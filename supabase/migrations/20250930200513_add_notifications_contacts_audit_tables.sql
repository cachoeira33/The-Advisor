/*
  # Add Notifications, Contact Submissions, and Audit Logs Tables

  This migration adds tables to support notifications, contact form submissions, and audit logging.

  ## 1. New Tables
  
  ### notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users, required)
  - `business_id` (uuid, foreign key to businesses, optional)
  - `title` (text, required)
  - `message` (text, required)
  - `type` (enum: info, success, warning, error)
  - `read` (boolean, default false)
  - `metadata` (jsonb, default {})
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

  ### contact_submissions
  - `id` (uuid, primary key)
  - `name` (text, required)
  - `email` (text, required)
  - `subject` (text, required)
  - `message` (text, required)
  - `status` (enum: new, in_progress, resolved)
  - `metadata` (jsonb, default {})
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

  ### audit_logs
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `business_id` (uuid, foreign key to businesses)
  - `action` (text, required)
  - `entity_type` (text, required)
  - `entity_id` (uuid)
  - `changes` (jsonb, default {})
  - `ip_address` (text)
  - `user_agent` (text)
  - `created_at` (timestamptz, default now)

  ## 2. Security
  - Enable RLS on all tables
  - Users can only access their own notifications
  - Contact submissions are insertable by anyone
  - Audit logs are accessible to business members

  ## 3. Indexes
  - Index on user_id for notifications
  - Index on business_id for audit logs
  - Index on created_at for efficient time-based queries

  ## 4. Auto-provisioning
  - Automatically create user profile when auth user is created
  - Automatically create default account and business for new users
*/

-- Create notification type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
  END IF;
END $$;

-- Create contact submission status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status') THEN
    CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved');
  END IF;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type DEFAULT 'info',
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status contact_status DEFAULT 'new',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for contact submissions
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for audit logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
    CREATE TRIGGER update_notifications_updated_at
      BEFORE UPDATE ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contact_submissions_updated_at') THEN
    CREATE TRIGGER update_contact_submissions_updated_at
      BEFORE UPDATE ON contact_submissions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user profile creation
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function to create default account and business
CREATE OR REPLACE FUNCTION create_default_account_and_business()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id uuid;
  new_business_id uuid;
BEGIN
  -- Create a default account
  INSERT INTO accounts (name, slug, plan_type, subscription_status)
  VALUES (
    COALESCE(NEW.full_name || '''s Account', 'My Account'),
    'account-' || substring(NEW.id::text from 1 for 8),
    'FREE',
    'ACTIVE'
  )
  RETURNING id INTO new_account_id;

  -- Create a default business
  INSERT INTO businesses (account_id, name, industry, currency)
  VALUES (
    new_account_id,
    'My Business',
    'General',
    'USD'
  )
  RETURNING id INTO new_business_id;

  -- Assign user as owner
  INSERT INTO user_business_roles (user_id, business_id, account_id, role, accepted_at)
  VALUES (
    NEW.id,
    new_business_id,
    new_account_id,
    'OWNER',
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for account/business creation
DROP TRIGGER IF EXISTS create_default_account_business_trigger ON users;
CREATE TRIGGER create_default_account_business_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_account_and_business();
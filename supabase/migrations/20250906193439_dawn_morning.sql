/*
  # Dashboard Layouts Table

  This migration creates a table to store user dashboard layouts and widget configurations.

  ## 1. New Table
  - `dashboard_layouts` - Stores dashboard configurations per user and business

  ## 2. Security
  - Enable RLS on dashboard_layouts table
  - Users can only access their own dashboard layouts
*/

CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  widgets jsonb DEFAULT '[]',
  layouts jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Enable Row Level Security
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policy - users can only access their own dashboard layouts
DROP POLICY IF EXISTS "Users can manage own dashboard layouts" ON dashboard_layouts;
CREATE POLICY "Users can manage own dashboard layouts" ON dashboard_layouts
  FOR ALL USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_dashboard_layouts_updated_at 
  BEFORE UPDATE ON dashboard_layouts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
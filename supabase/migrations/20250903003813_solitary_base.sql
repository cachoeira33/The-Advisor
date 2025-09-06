/*
  # Initial Database Schema for Multi-Tenant SaaS Financial Dashboard

  This migration creates the foundational tables for a multi-tenant financial dashboard platform.

  ## 1. New Tables

  ### Core Tables
  - `accounts` - Top-level tenant accounts with subscription info
  - `users` - User profiles extending Supabase auth.users
  - `businesses` - Individual businesses within accounts
  - `user_business_roles` - Many-to-many relationship with role-based permissions

  ### Financial Tables
  - `categories` - Transaction categories (income/expense)
  - `transactions` - Financial transactions with categorization
  - `budgets` - Budget planning and tracking
  - `forecasts` - Financial forecasting models and results
  - `forecast_scenarios` - Scenario variations for forecasts

  ## 2. Security
  - Enable RLS on all tables
  - Users can only access data for businesses they have roles in
  - Role-based permissions (OWNER > ADMIN > ANALYST > VIEWER)
  - Account-level data isolation

  ## 3. Features
  - Multi-currency support
  - Flexible fiscal year settings
  - Audit trail with created_at/updated_at timestamps
  - JSON metadata fields for extensibility
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'ANALYST', 'VIEWER');
CREATE TYPE plan_type AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE forecast_model AS ENUM ('LINEAR', 'SEASONAL', 'MONTE_CARLO');

-- Accounts table (top-level tenants)
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan_type plan_type DEFAULT 'FREE',
  stripe_customer_id text,
  subscription_status subscription_status DEFAULT 'ACTIVE',
  trial_ends_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  preferences jsonb DEFAULT '{}',
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text NOT NULL,
  currency text DEFAULT 'USD',
  fiscal_year_start integer DEFAULT 1 CHECK (fiscal_year_start >= 1 AND fiscal_year_start <= 12),
  logo_url text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User business roles (many-to-many with permissions)
CREATE TABLE IF NOT EXISTS user_business_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  permissions jsonb DEFAULT '{}',
  invited_by uuid REFERENCES users(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  icon text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  is_system boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(business_id, name, type)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  date timestamptz NOT NULL,
  reference text,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount decimal(12,2) NOT NULL,
  period text DEFAULT 'monthly' CHECK (period IN ('monthly', 'quarterly', 'yearly')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  alert_threshold decimal(3,2) DEFAULT 0.80,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  model_type forecast_model NOT NULL,
  time_horizon integer NOT NULL CHECK (time_horizon > 0 AND time_horizon <= 60),
  confidence_level decimal(3,2) DEFAULT 0.95 CHECK (confidence_level >= 0.50 AND confidence_level <= 0.99),
  parameters jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Forecast scenarios table
CREATE TABLE IF NOT EXISTS forecast_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id uuid NOT NULL REFERENCES forecasts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  adjustments jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_account_id ON businesses(account_id);
CREATE INDEX IF NOT EXISTS idx_user_business_roles_user_id ON user_business_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_business_roles_business_id ON user_business_roles(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories(business_id);
CREATE INDEX IF NOT EXISTS idx_budgets_business_id ON budgets(business_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_business_id ON forecasts(business_id);

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_business_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can manage own profile" ON users
  FOR ALL USING (auth.uid() = id);

-- Account access through user_business_roles
CREATE POLICY "Account access via business roles" ON accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_business_roles ubr
      JOIN businesses b ON b.account_id = accounts.id
      WHERE ubr.user_id = auth.uid()
      AND ubr.business_id = b.id
    )
  );

-- Business access through user_business_roles
CREATE POLICY "Business access via roles" ON businesses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = businesses.id
    )
  );

-- User business roles - users can see their own roles
CREATE POLICY "Users can see own business roles" ON user_business_roles
  FOR SELECT USING (user_id = auth.uid());

-- User business roles - owners and admins can manage roles
CREATE POLICY "Owners and admins can manage roles" ON user_business_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_business_roles owner_check
      WHERE owner_check.user_id = auth.uid()
      AND owner_check.business_id = user_business_roles.business_id
      AND owner_check.role IN ('OWNER', 'ADMIN')
    )
  );

-- Categories access through business membership
CREATE POLICY "Categories access via business" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = categories.business_id
    )
  );

-- Transactions access through business membership
CREATE POLICY "Transactions access via business" ON transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = transactions.business_id
    )
  );

-- Budgets access through business membership
CREATE POLICY "Budgets access via business" ON budgets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = budgets.business_id
    )
  );

-- Forecasts access through business membership
CREATE POLICY "Forecasts access via business" ON forecasts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = forecasts.business_id
    )
  );

-- Forecast scenarios access through forecast business membership
CREATE POLICY "Forecast scenarios access via business" ON forecast_scenarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM forecasts f
      JOIN user_business_roles ubr ON ubr.business_id = f.business_id
      WHERE f.id = forecast_scenarios.forecast_id
      AND ubr.user_id = auth.uid()
    )
  );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forecasts_updated_at BEFORE UPDATE ON forecasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forecast_scenarios_updated_at BEFORE UPDATE ON forecast_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
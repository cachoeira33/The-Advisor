-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'ANALYST', 'VIEWER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE forecast_model AS ENUM ('LINEAR', 'SEASONAL', 'MONTE_CARLO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Accounts table
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

-- Users table
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

-- User business roles
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

-- Recurring items table
CREATE TABLE IF NOT EXISTS recurring_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL,
  type transaction_type NOT NULL,
  frequency text DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dashboard layouts table
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

-- Create indexes
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

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_business_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
CREATE POLICY "Users can manage own profile" ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Account access via business roles" ON accounts;
CREATE POLICY "Account access via business roles" ON accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles ubr
      JOIN businesses b ON b.account_id = accounts.id
      WHERE ubr.user_id = auth.uid()
      AND ubr.business_id = b.id
    )
  );

DROP POLICY IF EXISTS "Business access via roles" ON businesses;
CREATE POLICY "Business access via roles" ON businesses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = businesses.id
    )
  );

DROP POLICY IF EXISTS "Users can see own business roles" ON user_business_roles;
CREATE POLICY "Users can see own business roles" ON user_business_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners and admins can manage roles" ON user_business_roles;
CREATE POLICY "Owners and admins can manage roles" ON user_business_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_business_roles owner_check
      WHERE owner_check.user_id = auth.uid()
      AND owner_check.business_id = user_business_roles.business_id
      AND owner_check.role IN ('OWNER', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "Categories access via business" ON categories;
CREATE POLICY "Categories access via business" ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = categories.business_id
    )
  );

DROP POLICY IF EXISTS "Transactions access via business" ON transactions;
CREATE POLICY "Transactions access via business" ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = transactions.business_id
    )
  );

DROP POLICY IF EXISTS "Budgets access via business" ON budgets;
CREATE POLICY "Budgets access via business" ON budgets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = budgets.business_id
    )
  );

DROP POLICY IF EXISTS "Forecasts access via business" ON forecasts;
CREATE POLICY "Forecasts access via business" ON forecasts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = forecasts.business_id
    )
  );

DROP POLICY IF EXISTS "Forecast scenarios access via business" ON forecast_scenarios;
CREATE POLICY "Forecast scenarios access via business" ON forecast_scenarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forecasts f
      JOIN user_business_roles ubr ON ubr.business_id = f.business_id
      WHERE f.id = forecast_scenarios.forecast_id
      AND ubr.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Recurring items access via business" ON recurring_items;
CREATE POLICY "Recurring items access via business" ON recurring_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = recurring_items.business_id
    )
  );

DROP POLICY IF EXISTS "Users can manage own dashboard layouts" ON dashboard_layouts;
CREATE POLICY "Users can manage own dashboard layouts" ON dashboard_layouts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_accounts_updated_at') THEN
    CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_businesses_updated_at') THEN
    CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
    CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budgets_updated_at') THEN
    CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_forecasts_updated_at') THEN
    CREATE TRIGGER update_forecasts_updated_at BEFORE UPDATE ON forecasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_forecast_scenarios_updated_at') THEN
    CREATE TRIGGER update_forecast_scenarios_updated_at BEFORE UPDATE ON forecast_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recurring_items_updated_at') THEN
    CREATE TRIGGER update_recurring_items_updated_at BEFORE UPDATE ON recurring_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dashboard_layouts_updated_at') THEN
    CREATE TRIGGER update_dashboard_layouts_updated_at BEFORE UPDATE ON dashboard_layouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to create default categories
CREATE OR REPLACE FUNCTION create_default_categories_for_business()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (business_id, name, color, type, is_system, sort_order) VALUES
    (NEW.id, 'Sales Revenue', '#10B981', 'INCOME', true, 1),
    (NEW.id, 'Service Revenue', '#059669', 'INCOME', true, 2),
    (NEW.id, 'Investment Income', '#047857', 'INCOME', true, 3),
    (NEW.id, 'Other Income', '#065F46', 'INCOME', true, 4),
    (NEW.id, 'Office Supplies', '#EF4444', 'EXPENSE', true, 1),
    (NEW.id, 'Marketing & Advertising', '#DC2626', 'EXPENSE', true, 2),
    (NEW.id, 'Travel & Meals', '#B91C1C', 'EXPENSE', true, 3),
    (NEW.id, 'Professional Services', '#991B1B', 'EXPENSE', true, 4),
    (NEW.id, 'Utilities', '#7F1D1D', 'EXPENSE', true, 5),
    (NEW.id, 'Rent & Facilities', '#F59E0B', 'EXPENSE', true, 6),
    (NEW.id, 'Software & Subscriptions', '#D97706', 'EXPENSE', true, 7),
    (NEW.id, 'Equipment', '#B45309', 'EXPENSE', true, 8),
    (NEW.id, 'Insurance', '#92400E', 'EXPENSE', true, 9),
    (NEW.id, 'Taxes', '#78350F', 'EXPENSE', true, 10),
    (NEW.id, 'Other Expenses', '#6B7280', 'EXPENSE', true, 11);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_default_categories_trigger ON businesses;
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories_for_business();
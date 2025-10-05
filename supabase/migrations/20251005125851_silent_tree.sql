/*
  # Complete Auto-Provisioning System

  1. Auto-Provisioning Functions
    - `handle_new_user()` - Creates account and default business for new users
    - `create_default_categories()` - Creates standard income/expense categories
    - `setup_user_business_role()` - Assigns owner role to new business

  2. Enhanced Security Functions
    - `get_user_businesses()` - Secure business access function
    - `check_business_access()` - Verify user business permissions
    - `audit_transaction()` - Comprehensive audit logging

  3. Triggers
    - Auto-provision on user creation
    - Auto-create categories on business creation
    - Enhanced audit logging

  4. Performance Enhancements
    - Additional composite indexes
    - Query optimization functions
*/

-- =====================================================
-- AUTO-PROVISIONING FUNCTIONS
-- =====================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id uuid;
  new_business_id uuid;
BEGIN
  -- Create account for new user
  INSERT INTO accounts (name, plan_type, max_businesses)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Personal Account'),
    'free',
    1
  )
  RETURNING id INTO new_account_id;

  -- Create user profile
  INSERT INTO users (
    id,
    account_id,
    email,
    full_name,
    language,
    timezone,
    currency
  )
  VALUES (
    NEW.id,
    new_account_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'en',
    'UTC',
    'USD'
  );

  -- Create default business
  INSERT INTO businesses (account_id, name, currency, industry, is_active)
  VALUES (
    new_account_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Personal') || '''s Business',
    'USD',
    'General',
    true
  )
  RETURNING id INTO new_business_id;

  -- Assign owner role
  INSERT INTO user_business_roles (user_id, business_id, role)
  VALUES (NEW.id, new_business_id, 'owner');

  -- Create default categories
  PERFORM create_default_categories(new_business_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default categories for a business
CREATE OR REPLACE FUNCTION create_default_categories(business_id_param uuid)
RETURNS void AS $$
BEGIN
  -- Default Income Categories
  INSERT INTO categories (business_id, name, type, color, icon, is_system) VALUES
  (business_id_param, 'Sales Revenue', 'income', '#10B981', 'dollar-sign', true),
  (business_id_param, 'Service Revenue', 'income', '#059669', 'briefcase', true),
  (business_id_param, 'Investment Income', 'income', '#047857', 'trending-up', true),
  (business_id_param, 'Other Income', 'income', '#065F46', 'plus-circle', true);

  -- Default Expense Categories
  INSERT INTO categories (business_id, name, type, color, icon, is_system) VALUES
  (business_id_param, 'Office Rent', 'expense', '#EF4444', 'home', true),
  (business_id_param, 'Utilities', 'expense', '#DC2626', 'zap', true),
  (business_id_param, 'Marketing', 'expense', '#B91C1C', 'megaphone', true),
  (business_id_param, 'Office Supplies', 'expense', '#991B1B', 'package', true),
  (business_id_param, 'Travel', 'expense', '#7F1D1D', 'plane', true),
  (business_id_param, 'Professional Services', 'expense', '#F97316', 'users', true),
  (business_id_param, 'Software & Tools', 'expense', '#EA580C', 'monitor', true),
  (business_id_param, 'Insurance', 'expense', '#C2410C', 'shield', true),
  (business_id_param, 'Other Expenses', 'expense', '#9A3412', 'minus-circle', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's accessible businesses
CREATE OR REPLACE FUNCTION get_user_businesses(user_id_param uuid)
RETURNS TABLE (
  business_id uuid,
  business_name text,
  role text,
  account_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    ubr.role,
    a.name
  FROM businesses b
  JOIN user_business_roles ubr ON b.id = ubr.business_id
  JOIN accounts a ON b.account_id = a.id
  WHERE ubr.user_id = user_id_param
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check business access
CREATE OR REPLACE FUNCTION check_business_access(
  user_id_param uuid,
  business_id_param uuid,
  required_role text DEFAULT 'viewer'
)
RETURNS boolean AS $$
DECLARE
  user_role text;
  role_hierarchy text[] := ARRAY['owner', 'admin', 'editor', 'viewer'];
  required_level int;
  user_level int;
BEGIN
  -- Get user's role for this business
  SELECT role INTO user_role
  FROM user_business_roles
  WHERE user_id = user_id_param AND business_id = business_id_param;

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Check role hierarchy
  SELECT array_position(role_hierarchy, required_role) INTO required_level;
  SELECT array_position(role_hierarchy, user_role) INTO user_level;

  RETURN user_level <= required_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced audit logging function
CREATE OR REPLACE FUNCTION audit_transaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    business_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.business_id, OLD.business_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-provision new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-create categories for new businesses
CREATE OR REPLACE FUNCTION handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_business_created ON businesses;
CREATE TRIGGER on_business_created
  AFTER INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION handle_new_business();

-- Enhanced audit triggers for critical tables
DROP TRIGGER IF EXISTS audit_transactions ON transactions;
CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_transaction();

DROP TRIGGER IF EXISTS audit_businesses ON businesses;
CREATE TRIGGER audit_businesses
  AFTER INSERT OR UPDATE OR DELETE ON businesses
  FOR EACH ROW EXECUTE FUNCTION audit_transaction();

DROP TRIGGER IF EXISTS audit_budgets ON budgets;
CREATE TRIGGER audit_budgets
  AFTER INSERT OR UPDATE OR DELETE ON budgets
  FOR EACH ROW EXECUTE FUNCTION audit_transaction();

-- =====================================================
-- PERFORMANCE ENHANCEMENTS
-- =====================================================

-- Additional composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_transactions_business_type_date 
ON transactions (business_id, type, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_amount_range 
ON transactions (business_id, amount) WHERE amount > 0;

CREATE INDEX IF NOT EXISTS idx_categories_business_type_system 
ON categories (business_id, type, is_system);

CREATE INDEX IF NOT EXISTS idx_user_business_roles_composite 
ON user_business_roles (user_id, business_id, role);

CREATE INDEX IF NOT EXISTS idx_budgets_period_dates 
ON budgets (business_id, period, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_forecasts_active_business 
ON forecasts (business_id, is_active) WHERE is_active = true;

-- =====================================================
-- ENHANCED SECURITY POLICIES
-- =====================================================

-- Enhanced policy for transactions with amount-based restrictions
DROP POLICY IF EXISTS "Enhanced transaction access" ON transactions;
CREATE POLICY "Enhanced transaction access" ON transactions
  FOR ALL USING (
    business_id IN (
      SELECT business_id 
      FROM user_business_roles 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT business_id 
      FROM user_business_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Enhanced policy for sensitive financial data
DROP POLICY IF EXISTS "Enhanced budget access" ON budgets;
CREATE POLICY "Enhanced budget access" ON budgets
  FOR ALL USING (
    check_business_access(auth.uid(), business_id, 'viewer')
  )
  WITH CHECK (
    check_business_access(auth.uid(), business_id, 'editor')
  );

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to calculate business metrics
CREATE OR REPLACE FUNCTION calculate_business_metrics(
  business_id_param uuid,
  start_date_param date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date_param date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_revenue numeric,
  total_expenses numeric,
  net_profit numeric,
  transaction_count bigint,
  avg_transaction_amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -ABS(t.amount) END), 0) as net_profit,
    COUNT(*) as transaction_count,
    COALESCE(AVG(ABS(t.amount)), 0) as avg_transaction_amount
  FROM transactions t
  WHERE t.business_id = business_id_param
    AND t.date BETWEEN start_date_param AND end_date_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get category spending analysis
CREATE OR REPLACE FUNCTION get_category_analysis(
  business_id_param uuid,
  analysis_period text DEFAULT 'month'
)
RETURNS TABLE (
  category_name text,
  category_color text,
  total_amount numeric,
  transaction_count bigint,
  percentage numeric
) AS $$
DECLARE
  date_filter date;
BEGIN
  -- Set date filter based on period
  CASE analysis_period
    WHEN 'week' THEN date_filter := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'month' THEN date_filter := CURRENT_DATE - INTERVAL '30 days';
    WHEN 'quarter' THEN date_filter := CURRENT_DATE - INTERVAL '90 days';
    WHEN 'year' THEN date_filter := CURRENT_DATE - INTERVAL '365 days';
    ELSE date_filter := CURRENT_DATE - INTERVAL '30 days';
  END CASE;

  RETURN QUERY
  WITH category_totals AS (
    SELECT 
      c.name,
      c.color,
      SUM(ABS(t.amount)) as amount,
      COUNT(*) as count
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.business_id = business_id_param
      AND t.date >= date_filter
      AND t.type = 'expense'
    GROUP BY c.id, c.name, c.color
  ),
  total_expenses AS (
    SELECT SUM(amount) as total FROM category_totals
  )
  SELECT 
    COALESCE(ct.name, 'Uncategorized'),
    COALESCE(ct.color, '#6B7280'),
    ct.amount,
    ct.count,
    CASE 
      WHEN te.total > 0 THEN ROUND((ct.amount / te.total * 100), 2)
      ELSE 0
    END
  FROM category_totals ct
  CROSS JOIN total_expenses te
  ORDER BY ct.amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate forecast data
CREATE OR REPLACE FUNCTION generate_simple_forecast(
  business_id_param uuid,
  months_ahead integer DEFAULT 6
)
RETURNS TABLE (
  forecast_month date,
  predicted_revenue numeric,
  predicted_expenses numeric,
  predicted_profit numeric,
  confidence_score numeric
) AS $$
DECLARE
  avg_revenue numeric;
  avg_expenses numeric;
  revenue_trend numeric;
  expense_trend numeric;
BEGIN
  -- Calculate historical averages and trends
  SELECT 
    AVG(CASE WHEN type = 'income' THEN amount ELSE 0 END),
    AVG(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END)
  INTO avg_revenue, avg_expenses
  FROM transactions
  WHERE business_id = business_id_param
    AND date >= CURRENT_DATE - INTERVAL '12 months';

  -- Simple trend calculation (last 3 months vs previous 3 months)
  WITH recent_data AS (
    SELECT 
      AVG(CASE WHEN type = 'income' THEN amount ELSE 0 END) as recent_revenue,
      AVG(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as recent_expenses
    FROM transactions
    WHERE business_id = business_id_param
      AND date >= CURRENT_DATE - INTERVAL '3 months'
  ),
  older_data AS (
    SELECT 
      AVG(CASE WHEN type = 'income' THEN amount ELSE 0 END) as older_revenue,
      AVG(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as older_expenses
    FROM transactions
    WHERE business_id = business_id_param
      AND date BETWEEN CURRENT_DATE - INTERVAL '6 months' AND CURRENT_DATE - INTERVAL '3 months'
  )
  SELECT 
    COALESCE((r.recent_revenue - o.older_revenue) / NULLIF(o.older_revenue, 0), 0),
    COALESCE((r.recent_expenses - o.older_expenses) / NULLIF(o.older_expenses, 0), 0)
  INTO revenue_trend, expense_trend
  FROM recent_data r, older_data o;

  -- Generate forecast
  FOR i IN 1..months_ahead LOOP
    RETURN QUERY
    SELECT 
      (CURRENT_DATE + (i || ' months')::interval)::date,
      GREATEST(0, avg_revenue * (1 + revenue_trend * i * 0.1)),
      GREATEST(0, avg_expenses * (1 + expense_trend * i * 0.1)),
      (avg_revenue * (1 + revenue_trend * i * 0.1)) - (avg_expenses * (1 + expense_trend * i * 0.1)),
      GREATEST(0.5, 1.0 - (i * 0.05))::numeric; -- Decreasing confidence over time
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENHANCED SECURITY FUNCTIONS
-- =====================================================

-- Function to safely get user's business data
CREATE OR REPLACE FUNCTION get_user_business_summary(user_id_param uuid)
RETURNS TABLE (
  business_id uuid,
  business_name text,
  role text,
  total_transactions bigint,
  current_balance numeric,
  last_transaction_date date
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    ubr.role,
    COUNT(t.id),
    COALESCE(SUM(
      CASE 
        WHEN t.type = 'income' THEN t.amount 
        ELSE -ABS(t.amount) 
      END
    ), 0),
    MAX(t.date)
  FROM businesses b
  JOIN user_business_roles ubr ON b.id = ubr.business_id
  LEFT JOIN transactions t ON b.id = t.business_id
  WHERE ubr.user_id = user_id_param
  GROUP BY b.id, b.name, ubr.role
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DATA VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate transaction data
CREATE OR REPLACE FUNCTION validate_transaction_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate amount based on type
  IF NEW.type = 'income' AND NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Income transactions must have positive amounts';
  END IF;
  
  IF NEW.type = 'expense' AND NEW.amount >= 0 THEN
    RAISE EXCEPTION 'Expense transactions must have negative amounts';
  END IF;

  -- Validate date is not in the future (with some tolerance)
  IF NEW.date > CURRENT_DATE + INTERVAL '1 day' THEN
    RAISE EXCEPTION 'Transaction date cannot be more than 1 day in the future';
  END IF;

  -- Validate currency matches business currency
  IF EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = NEW.business_id 
    AND currency != NEW.currency
  ) THEN
    RAISE EXCEPTION 'Transaction currency must match business currency';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger
DROP TRIGGER IF EXISTS validate_transaction_trigger ON transactions;
CREATE TRIGGER validate_transaction_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION validate_transaction_data();

-- =====================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- =====================================================

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_businesses_active 
ON businesses (account_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_recurring_items_active 
ON recurring_items (business_id, is_active) WHERE is_active = true;

-- Covering indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_business_date_amount 
ON transactions (business_id, date DESC) INCLUDE (amount, type, description);

CREATE INDEX IF NOT EXISTS idx_categories_business_type_name 
ON categories (business_id, type) INCLUDE (name, color, icon);

-- =====================================================
-- SECURITY ENHANCEMENTS
-- =====================================================

-- Additional RLS policy for cross-business data protection
CREATE POLICY "Prevent cross-business data access" ON transactions
  FOR ALL USING (
    NOT EXISTS (
      SELECT 1 FROM user_business_roles ubr1, user_business_roles ubr2
      WHERE ubr1.user_id = auth.uid()
        AND ubr2.business_id = transactions.business_id
        AND ubr1.business_id != ubr2.business_id
        AND ubr1.user_id != ubr2.user_id
    )
  );

-- Policy to prevent unauthorized role escalation
CREATE POLICY "Prevent role escalation" ON user_business_roles
  FOR UPDATE USING (
    CASE 
      WHEN OLD.role = 'owner' THEN 
        -- Only owners can modify owner roles
        EXISTS (
          SELECT 1 FROM user_business_roles 
          WHERE user_id = auth.uid() 
          AND business_id = OLD.business_id 
          AND role = 'owner'
        )
      ELSE
        -- Admins and owners can modify other roles
        EXISTS (
          SELECT 1 FROM user_business_roles 
          WHERE user_id = auth.uid() 
          AND business_id = OLD.business_id 
          AND role IN ('owner', 'admin')
        )
    END
  );

-- =====================================================
-- MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep integer DEFAULT 90)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < CURRENT_DATE - (days_to_keep || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update business statistics
CREATE OR REPLACE FUNCTION update_business_stats()
RETURNS void AS $$
BEGIN
  -- This could be expanded to update cached statistics
  -- For now, it's a placeholder for future enhancements
  RAISE NOTICE 'Business statistics updated at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
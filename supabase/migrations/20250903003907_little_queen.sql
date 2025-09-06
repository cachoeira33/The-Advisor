/*
  # Sample Data for Development and Testing

  This migration adds sample data to demonstrate the platform capabilities:

  ## 1. Sample Account and User
  - Creates a demo account with "PRO" plan
  - Creates a demo user profile

  ## 2. Sample Businesses
  - "Tech Startup Inc." - Technology company
  - "Local Restaurant" - Food service business

  ## 3. Sample Transactions
  - Revenue transactions (sales, services)
  - Expense transactions (office, marketing, utilities)
  - Covers last 12 months for forecasting

  ## 4. Sample Forecasts
  - Linear regression forecast
  - Seasonal adjustment forecast
  - Multiple scenarios for comparison
*/

-- Insert sample account
INSERT INTO accounts (id, name, slug, plan_type, subscription_status) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Corporation', 'demo-corp', 'PRO', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Insert sample user (this will reference an actual auth user when available)
-- Note: In production, this would be created through the signup flow

-- Insert sample businesses
INSERT INTO businesses (id, account_id, name, industry, currency, fiscal_year_start) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Tech Startup Inc.', 'Technology', 'USD', 1),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Local Restaurant', 'Food Service', 'USD', 1)
ON CONFLICT (id) DO NOTHING;

-- Get category IDs for transactions (these will be created by the trigger)
-- We'll use a DO block to insert transactions with proper category references

DO $$
DECLARE
  tech_business_id uuid := '550e8400-e29b-41d4-a716-446655440001';
  restaurant_business_id uuid := '550e8400-e29b-41d4-a716-446655440002';
  sales_category_id uuid;
  marketing_category_id uuid;
  office_category_id uuid;
  utilities_category_id uuid;
  current_date_iter timestamptz;
  i integer;
BEGIN
  -- Get category IDs
  SELECT id INTO sales_category_id FROM categories 
  WHERE business_id = tech_business_id AND name = 'Sales Revenue' AND type = 'INCOME';
  
  SELECT id INTO marketing_category_id FROM categories 
  WHERE business_id = tech_business_id AND name = 'Marketing & Advertising' AND type = 'EXPENSE';
  
  SELECT id INTO office_category_id FROM categories 
  WHERE business_id = tech_business_id AND name = 'Office Supplies' AND type = 'EXPENSE';
  
  SELECT id INTO utilities_category_id FROM categories 
  WHERE business_id = tech_business_id AND name = 'Utilities' AND type = 'EXPENSE';

  -- Insert sample transactions for Tech Startup (last 12 months)
  FOR i IN 1..12 LOOP
    current_date_iter := date_trunc('month', CURRENT_DATE) - (i - 1) * interval '1 month';
    
    -- Monthly recurring revenue
    INSERT INTO transactions (business_id, description, amount, currency, category_id, type, date) VALUES
      (tech_business_id, 'Monthly SaaS Revenue', 45000 + random() * 10000, 'USD', sales_category_id, 'INCOME', current_date_iter + interval '1 day'),
      (tech_business_id, 'Consulting Services', 15000 + random() * 5000, 'USD', sales_category_id, 'INCOME', current_date_iter + interval '5 days'),
      (tech_business_id, 'Product Sales', 8000 + random() * 3000, 'USD', sales_category_id, 'INCOME', current_date_iter + interval '10 days');
    
    -- Monthly expenses
    INSERT INTO transactions (business_id, description, amount, currency, category_id, type, date) VALUES
      (tech_business_id, 'Digital Marketing Campaign', -(5000 + random() * 2000), 'USD', marketing_category_id, 'EXPENSE', current_date_iter + interval '3 days'),
      (tech_business_id, 'Office Supplies & Equipment', -(1200 + random() * 500), 'USD', office_category_id, 'EXPENSE', current_date_iter + interval '7 days'),
      (tech_business_id, 'Utilities & Internet', -(800 + random() * 200), 'USD', utilities_category_id, 'EXPENSE', current_date_iter + interval '15 days');
  END LOOP;

  -- Insert sample transactions for Restaurant (last 12 months)
  FOR i IN 1..12 LOOP
    current_date_iter := date_trunc('month', CURRENT_DATE) - (i - 1) * interval '1 month';
    
    -- Get restaurant categories
    SELECT id INTO sales_category_id FROM categories 
    WHERE business_id = restaurant_business_id AND name = 'Sales Revenue' AND type = 'INCOME';
    
    -- Daily sales (multiple per month)
    FOR j IN 1..30 LOOP
      INSERT INTO transactions (business_id, description, amount, currency, category_id, type, date) VALUES
        (restaurant_business_id, 'Daily Sales Revenue', 1200 + random() * 800, 'USD', sales_category_id, 'INCOME', current_date_iter + j * interval '1 day');
    END LOOP;
  END LOOP;

END $$;
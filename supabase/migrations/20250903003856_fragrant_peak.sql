/*
  # Seed Default Categories

  This migration adds default income and expense categories that every new business will have.
  These categories provide a good starting point for financial management.

  ## 1. Default Income Categories
  - Sales Revenue
  - Service Revenue
  - Investment Income
  - Other Income

  ## 2. Default Expense Categories
  - Office Supplies
  - Marketing & Advertising
  - Travel & Meals
  - Professional Services
  - Utilities
  - Rent & Facilities
  - Software & Subscriptions
  - Equipment
  - Insurance
  - Taxes
  - Other Expenses

  ## 3. Implementation
  - Creates a function to automatically add default categories when a business is created
  - Uses a trigger to call this function on business insertion
*/

-- Function to create default categories for a new business
CREATE OR REPLACE FUNCTION create_default_categories_for_business()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default income categories
  INSERT INTO categories (business_id, name, color, type, is_system, sort_order) VALUES
    (NEW.id, 'Sales Revenue', '#10B981', 'INCOME', true, 1),
    (NEW.id, 'Service Revenue', '#059669', 'INCOME', true, 2),
    (NEW.id, 'Investment Income', '#047857', 'INCOME', true, 3),
    (NEW.id, 'Other Income', '#065F46', 'INCOME', true, 4);

  -- Insert default expense categories
  INSERT INTO categories (business_id, name, color, type, is_system, sort_order) VALUES
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

-- Trigger to automatically create default categories for new businesses
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories_for_business();
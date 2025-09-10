/*
  # Recurring Items Table

  This migration creates a table to store recurring income and expense items for budgeting and forecasting.

  ## 1. New Table
  - `recurring_items` - Stores regular income and expenses

  ## 2. Security
  - Enable RLS on recurring_items table
  - Users can only access their business's recurring items
*/

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

-- Enable Row Level Security
ALTER TABLE recurring_items ENABLE ROW LEVEL SECURITY;


-- Create trigger for updated_at
CREATE TRIGGER update_recurring_items_updated_at 
  BEFORE UPDATE ON recurring_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
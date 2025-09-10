/*
  # Recurring Items Table

  This migration creates a table to store recurring income and expense items for budgeting and forecasting.

  ## 1. New Table
  - `recurring_items` - Stores regular income and expenses

  ## 2. Security
  - Enable RLS on `recurring_items` table
  - Add policy for users to access their business recurring items
*/

CREATE TABLE IF NOT EXISTS recurring_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  type transaction_type NOT NULL,
  frequency text DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recurring items access via business"
  ON recurring_items
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = recurring_items.business_id
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_recurring_items_updated_at
  BEFORE UPDATE ON recurring_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
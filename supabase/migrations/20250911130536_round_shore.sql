/*
  # Create recurring items table

  1. New Tables
    - `recurring_items`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key to businesses)
      - `description` (text, required)
      - `amount` (numeric, required)
      - `type` (transaction_type enum, required)
      - `frequency` (text, default 'MONTHLY')
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `recurring_items` table
    - Add policy for business access via user roles

  3. Triggers
    - Add update trigger for updated_at column (with existence check)
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

-- Drop policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Recurring items access via business" ON public.recurring_items;

-- Create the policy
CREATE POLICY "Recurring items access via business"
  ON public.recurring_items
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_business_roles
      WHERE user_id = auth.uid()
      AND business_id = recurring_items.business_id
    )
  );

-- Add trigger for updated_at with existence check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_recurring_items_updated_at' 
    AND tgrelid = 'recurring_items'::regclass
  ) THEN
    CREATE TRIGGER update_recurring_items_updated_at
      BEFORE UPDATE ON recurring_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
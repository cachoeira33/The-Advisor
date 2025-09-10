/*
  # Dashboard Layouts Table

  This migration creates a table to store user dashboard layouts and widget configurations.

  ## 1. New Table
  - `dashboard_layouts` - Stores user dashboard customizations

  ## 2. Security
  - Enable RLS on `dashboard_layouts` table
  - Add policy for users to manage their own layouts
*/

CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  widgets jsonb DEFAULT '[]',
  layouts jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);

ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dashboard layouts"
  ON dashboard_layouts
  FOR ALL
  TO public
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_dashboard_layouts_updated_at
  BEFORE UPDATE ON dashboard_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
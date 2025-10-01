/*
  # Donation System Implementation

  ## 1. New Tables
    
  ### `donation_campaigns`
    - `id` (uuid, primary key)
    - `title` (text) - Campaign title
    - `description` (text) - Campaign description
    - `slug` (text, unique) - URL-friendly identifier
    - `image_url` (text) - Cloudinary image URL
    - `goal_amount` (numeric) - Optional campaign goal
    - `default_amounts` (jsonb) - Array of default donation amounts
    - `min_amount` (numeric) - Minimum donation amount (default 5.00)
    - `is_active` (boolean) - Whether campaign is active
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### `donations`
    - `id` (uuid, primary key)
    - `campaign_id` (uuid, foreign key)
    - `donor_name` (text)
    - `donor_email` (text)
    - `donor_phone` (text)
    - `amount` (numeric)
    - `stripe_payment_intent_id` (text)
    - `stripe_charge_id` (text)
    - `status` (text) - pending, completed, failed, refunded
    - `receipt_url` (text) - Stripe receipt URL
    - `created_at` (timestamptz)

  ### `stripe_settings`
    - Settings table for Stripe configuration

  ## 2. Security
    - Enable RLS on all tables
    - Public read access for active campaigns
    - Admin-only write access
    - Public insert for donations
*/

-- Create donation_campaigns table
CREATE TABLE IF NOT EXISTS donation_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  image_url text,
  goal_amount numeric,
  default_amounts jsonb DEFAULT '[10, 25, 50, 100, 250]'::jsonb,
  min_amount numeric DEFAULT 5.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES donation_campaigns(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  donor_phone text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 5.00),
  stripe_payment_intent_id text,
  stripe_charge_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  receipt_url text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create stripe_settings table
CREATE TABLE IF NOT EXISTS stripe_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_test_publishable_key text,
  stripe_test_secret_key text,
  stripe_live_publishable_key text,
  stripe_live_secret_key text,
  stripe_environment text DEFAULT 'test' CHECK (stripe_environment IN ('test', 'live')),
  updated_at timestamptz DEFAULT now()
);

-- Insert default stripe settings
INSERT INTO stripe_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_settings ENABLE ROW LEVEL SECURITY;

-- Policies for donation_campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON donation_campaigns FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all campaigns"
  ON donation_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
  ON donation_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
  ON donation_campaigns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaigns"
  ON donation_campaigns FOR DELETE
  TO authenticated
  USING (true);

-- Policies for donations
CREATE POLICY "Anyone can insert donations"
  ON donations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all donations"
  ON donations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for stripe_settings
CREATE POLICY "Authenticated users can view stripe settings"
  ON stripe_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update stripe settings"
  ON stripe_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_donation_campaigns_slug ON donation_campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_donation_campaigns_active ON donation_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);

-- Create updated_at trigger for donation_campaigns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_donation_campaigns_updated_at ON donation_campaigns;
CREATE TRIGGER update_donation_campaigns_updated_at
  BEFORE UPDATE ON donation_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_settings_updated_at ON stripe_settings;
CREATE TRIGGER update_stripe_settings_updated_at
  BEFORE UPDATE ON stripe_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

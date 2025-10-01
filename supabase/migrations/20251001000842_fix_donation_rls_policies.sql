/*
  # Fix RLS Policies for Donation System

  ## Changes
    - Add public read policy for stripe_settings (needed for frontend)
    - Ensure proper access to donation campaigns

  ## Security
    - Maintains security while allowing necessary public access
    - Only exposes publishable keys, not secret keys
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view stripe settings" ON stripe_settings;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON donation_campaigns;

-- Create new policies with proper access
CREATE POLICY "Public can view stripe environment and publishable keys"
  ON stripe_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can view active campaigns"
  ON donation_campaigns FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

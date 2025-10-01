-- Criar tabela de campanhas de doação
CREATE TABLE IF NOT EXISTS public.donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  default_amounts TEXT[] DEFAULT ARRAY['50', '100', '200', '500'],
  min_amount DECIMAL(10,2) DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  featured_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de doações
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.donation_campaigns(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT,
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de configurações do Stripe
CREATE TABLE IF NOT EXISTS public.stripe_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_test_publishable_key TEXT,
  stripe_test_secret_key TEXT,
  stripe_live_publishable_key TEXT,
  stripe_live_secret_key TEXT,
  stripe_environment TEXT DEFAULT 'test',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para donation_campaigns
CREATE POLICY "Allow public read access to active campaigns"
  ON public.donation_campaigns
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage campaigns"
  ON public.donation_campaigns
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para donations
CREATE POLICY "Allow public insert donations"
  ON public.donations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read all donations"
  ON public.donations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update donations"
  ON public.donations
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para stripe_settings
CREATE POLICY "Allow authenticated users to manage stripe settings"
  ON public.stripe_settings
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers para updated_at
CREATE TRIGGER update_donation_campaigns_updated_at
  BEFORE UPDATE ON public.donation_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stripe_settings_updated_at
  BEFORE UPDATE ON public.stripe_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
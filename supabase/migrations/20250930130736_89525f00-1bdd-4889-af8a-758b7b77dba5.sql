-- Adicionar campos de estatísticas à tabela site_settings (logo_url já existe)
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS parishes_count INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS priests_count INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS faithful_count TEXT DEFAULT '1M+',
ADD COLUMN IF NOT EXISTS years_count INTEGER DEFAULT 45;
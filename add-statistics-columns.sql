-- =====================================================
-- Adicionar colunas de estatísticas para a página inicial
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Adicionar coluna de número de paróquias
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'parishes_count'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN parishes_count integer DEFAULT 25;
  END IF;
END $$;

-- Adicionar coluna de número de padres
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'priests_count'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN priests_count integer DEFAULT 50;
  END IF;
END $$;

-- Adicionar coluna de número de fiéis (formato texto para permitir "1M+", "500K+", etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'faithful_count'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN faithful_count text DEFAULT '1M+';
  END IF;
END $$;

-- Adicionar coluna de anos de fundação
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'years_count'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN years_count integer DEFAULT 45;
  END IF;
END $$;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'site_settings'
  AND column_name IN ('parishes_count', 'priests_count', 'faithful_count', 'years_count')
ORDER BY column_name;
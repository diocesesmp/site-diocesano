/*
  # Adicionar campos de governo à tabela clergy

  1. Modificações na Tabela
    - `clergy`
      - `is_government` (boolean, default false) - Indica se o membro faz parte do governo diocesano
      - `government_order` (integer, nullable) - Ordem de exibição no governo diocesano

  2. Índices
    - Adicionar índice para consultas de membros do governo

  3. Comentários
    - Campos para identificar e ordenar membros do governo diocesano
*/

-- Adicionar campo is_government à tabela clergy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clergy' AND column_name = 'is_government'
  ) THEN
    ALTER TABLE clergy ADD COLUMN is_government boolean DEFAULT false;
  END IF;
END $$;

-- Adicionar campo government_order à tabela clergy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clergy' AND column_name = 'government_order'
  ) THEN
    ALTER TABLE clergy ADD COLUMN government_order integer;
  END IF;
END $$;

-- Criar índice para consultas de governo
CREATE INDEX IF NOT EXISTS idx_clergy_government 
ON clergy (is_government, government_order) 
WHERE is_government = true;
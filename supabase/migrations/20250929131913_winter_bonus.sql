/*
  # Criar tabela de linha do tempo da diocese

  1. Nova Tabela
    - `timeline_events`
      - `id` (uuid, primary key)
      - `title` (text, título do evento histórico)
      - `description` (text, descrição completa do evento)
      - `event_date` (date, data do evento histórico)
      - `image_url` (text, imagem do evento)
      - `order_position` (integer, ordem de exibição)
      - `is_active` (boolean, se está ativo para exibição)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `timeline_events`
    - Adicionar política para leitura pública
    - Adicionar política para gerenciamento por usuários autenticados

  3. Índices
    - Índice para ordenação por data do evento
    - Índice para eventos ativos
*/

-- Criar tabela de eventos da linha do tempo
CREATE TABLE IF NOT EXISTS timeline_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    event_date date NOT NULL,
    image_url text,
    order_position integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Allow public read access to active timeline events"
    ON timeline_events
    FOR SELECT
    TO public
    USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage timeline events"
    ON timeline_events
    FOR ALL
    TO public
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_timeline_events_date 
    ON timeline_events (event_date DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_events_active 
    ON timeline_events (is_active, order_position) 
    WHERE is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_timeline_events_updated_at 
    BEFORE UPDATE ON timeline_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns eventos históricos de exemplo
INSERT INTO timeline_events (title, description, event_date, order_position) VALUES
(
    'Criação da Diocese',
    'A Diocese de São Miguel Paulista foi criada em 15 de agosto de 1981, pela Bula Papal "Cum Ecclesiae" do Papa João Paulo II, sendo desmembrada da Arquidiocese de São Paulo.',
    '1981-08-15',
    1
),
(
    'Primeira Ordenação Sacerdotal',
    'Primeira ordenação sacerdotal realizada na nova diocese, marcando o início da formação do clero local.',
    '1982-12-08',
    2
),
(
    'Construção da Catedral',
    'Início da construção da Catedral de São Miguel Arcanjo, que se tornaria o centro espiritual da diocese.',
    '1985-03-19',
    3
),
(
    'Criação do Seminário Diocesano',
    'Fundação do seminário diocesano para formação de futuros sacerdotes da região.',
    '1990-02-11',
    4
),
(
    '25 Anos da Diocese',
    'Celebração dos 25 anos de criação da Diocese com grande festa e ações de graças.',
    '2006-08-15',
    5
),
(
    'Renovação Pastoral',
    'Início do processo de renovação pastoral com foco na evangelização e ação social.',
    '2010-01-01',
    6
);
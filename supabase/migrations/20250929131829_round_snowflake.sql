-- =====================================================
-- BACKUP COMPLETO DO BANCO DE DADOS
-- Diocese de São Miguel Paulista
-- Data: 2025-01-26
-- =====================================================

-- =====================================================
-- 1. TIPOS ENUMERADOS (ENUMS)
-- =====================================================

-- Tipo para status de eventos
CREATE TYPE event_status AS ENUM ('confirmado', 'cancelado', 'adiado');

-- Tipo para tipo de conteúdo das mensagens
CREATE TYPE content_type AS ENUM ('texto', 'video', 'audio');

-- =====================================================
-- 2. FUNÇÕES DO SISTEMA
-- =====================================================

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 3. TABELAS PRINCIPAIS
-- =====================================================

-- Tabela: site_settings
-- Configurações gerais do site
CREATE TABLE IF NOT EXISTS site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name text NOT NULL DEFAULT 'Diocese de São Miguel Paulista',
    site_title text NOT NULL DEFAULT 'Diocese de São Miguel Paulista',
    meta_description text,
    logo_url text,
    email_contact text,
    facebook_url text,
    instagram_url text,
    youtube_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela: cloudinary_settings
-- Configurações do Cloudinary para upload de imagens
CREATE TABLE IF NOT EXISTS cloudinary_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cloud_name text NOT NULL,
    api_key text NOT NULL,
    api_secret text NOT NULL,
    upload_preset text NOT NULL DEFAULT 'diocese_preset',
    folder_structure text NOT NULL DEFAULT 'diocese/{year}/{month}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabela: bishop
-- Informações do bispo diocesano
CREATE TABLE IF NOT EXISTS bishop (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    title text NOT NULL DEFAULT 'Bispo Diocesano',
    motto text,
    ordination_date date,
    episcopal_ordination_date date,
    appointment_date date,
    photo_url text,
    bio text,
    pastoral_letter text,
    phone text,
    email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabela: parishes
-- Paróquias da diocese
CREATE TABLE IF NOT EXISTS parishes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    address text NOT NULL,
    parish_priest_id uuid,
    creation_date date,
    mass_schedule text,
    service_hours text,
    phone text,
    email text,
    website text,
    description text,
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela: clergy
-- Clero da diocese (padres, diáconos, etc.)
CREATE TABLE IF NOT EXISTS clergy (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    position text NOT NULL,
    ordination_date date,
    motto text,
    parish_id uuid,
    provisioned_since date,
    photo_url text,
    phone text,
    email text,
    bio text,
    is_government boolean DEFAULT false,
    government_order integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela: events
-- Eventos da diocese
CREATE TABLE IF NOT EXISTS events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text NOT NULL,
    event_date timestamptz NOT NULL,
    end_date timestamptz,
    location text NOT NULL,
    status event_status DEFAULT 'confirmado',
    featured_image_url text,
    is_featured boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela: articles
-- Artigos/notícias da diocese
CREATE TABLE IF NOT EXISTS articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    content text NOT NULL,
    excerpt text,
    author text NOT NULL DEFAULT 'Diocese de São Miguel Paulista',
    featured_image_url text,
    is_featured boolean DEFAULT false,
    tags text[],
    gallery_images text[],
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela: pastor_messages
-- Mensagens do pastor
CREATE TABLE IF NOT EXISTS pastor_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    content text,
    content_type content_type DEFAULT 'texto',
    media_url text,
    thumbnail_url text,
    is_featured boolean DEFAULT false,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela: photos
-- Galeria de fotos
CREATE TABLE IF NOT EXISTS photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    image_url text NOT NULL,
    thumbnail_url text,
    event_id uuid,
    album_name text,
    taken_date date,
    photographer text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela: journals
-- Jornais/boletins da diocese
CREATE TABLE IF NOT EXISTS journals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    edition_number integer,
    publication_date date NOT NULL,
    pdf_url text NOT NULL,
    cover_image_url text,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. CHAVES ESTRANGEIRAS
-- =====================================================

-- Relacionamento: parishes -> clergy (pároco)
ALTER TABLE parishes 
ADD CONSTRAINT fk_parish_priest 
FOREIGN KEY (parish_priest_id) REFERENCES clergy(id);

-- Relacionamento: clergy -> parishes (paróquia do padre)
ALTER TABLE clergy 
ADD CONSTRAINT fk_clergy_parish 
FOREIGN KEY (parish_id) REFERENCES parishes(id);

-- Relacionamento: photos -> events (evento da foto)
ALTER TABLE photos 
ADD CONSTRAINT fk_photo_event 
FOREIGN KEY (event_id) REFERENCES events(id);

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para clero do governo diocesano
CREATE INDEX IF NOT EXISTS idx_clergy_government 
ON clergy (is_government, government_order) 
WHERE is_government = true;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloudinary_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bishop ENABLE ROW LEVEL SECURITY;
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clergy ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Políticas para site_settings
CREATE POLICY "Allow public read access" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage site settings" ON site_settings FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para cloudinary_settings
CREATE POLICY "Allow authenticated users to read cloudinary_settings" ON cloudinary_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert cloudinary_settings" ON cloudinary_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update cloudinary_settings" ON cloudinary_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to delete cloudinary_settings" ON cloudinary_settings FOR DELETE TO authenticated USING (true);

-- Políticas para bishop
CREATE POLICY "Allow public read access" ON bishop FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage bishop" ON bishop FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para parishes
CREATE POLICY "Allow public read access" ON parishes FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage parishes" ON parishes FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para clergy
CREATE POLICY "Allow public read access" ON clergy FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage clergy" ON clergy FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para events
CREATE POLICY "Allow public read access" ON events FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage events" ON events FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para articles
CREATE POLICY "Allow public read access" ON articles FOR SELECT TO public USING (published_at IS NOT NULL);
CREATE POLICY "Allow authenticated users to manage articles" ON articles FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para pastor_messages
CREATE POLICY "Allow public read access" ON pastor_messages FOR SELECT TO public USING (published_at IS NOT NULL);
CREATE POLICY "Allow authenticated users to manage pastor messages" ON pastor_messages FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para photos
CREATE POLICY "Allow public read access" ON photos FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage photos" ON photos FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para journals
CREATE POLICY "Allow public read access" ON journals FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage journals" ON journals FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 8. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Triggers para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cloudinary_settings_updated_at BEFORE UPDATE ON cloudinary_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bishop_updated_at BEFORE UPDATE ON bishop FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parishes_updated_at BEFORE UPDATE ON parishes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clergy_updated_at BEFORE UPDATE ON clergy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pastor_messages_updated_at BEFORE UPDATE ON pastor_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Inserir configurações padrão do site (se não existir)
INSERT INTO site_settings (site_name, site_title, meta_description, email_contact)
SELECT 
    'Diocese de São Miguel Paulista',
    'Diocese de São Miguel Paulista',
    'Site oficial da Diocese de São Miguel Paulista. Acompanhe notícias, eventos, mensagens do pastor e informações sobre paróquias e clero.',
    'contato@diocesesaomiguel.org.br'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- =====================================================
-- FIM DO BACKUP
-- =====================================================
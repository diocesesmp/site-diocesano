-- ============================================
-- BACKUP COMPLETO - Diocese de São Miguel Paulista
-- Data: 2025-01-25
-- ============================================
-- Este arquivo contém todas as tabelas, políticas RLS, 
-- funções, triggers e dados iniciais do banco de dados.
-- Execute este arquivo em um banco Supabase limpo.
-- ============================================

-- ============================================
-- 1. CRIAR ENUMS
-- ============================================

CREATE TYPE public.event_status AS ENUM ('confirmado', 'cancelado', 'adiado');
CREATE TYPE public.content_type AS ENUM ('texto', 'video', 'audio');

-- ============================================
-- 2. CRIAR TABELAS 
-- ============================================

-- Tabela de configurações do site
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'Diocese de São Miguel Paulista',
  site_title TEXT NOT NULL DEFAULT 'Diocese de São Miguel Paulista',
  meta_description TEXT,
  logo_url TEXT,
  email_contact TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  parishes_count INTEGER DEFAULT 25,
  priests_count INTEGER DEFAULT 50,
  faithful_count TEXT DEFAULT '1M+',
  years_count INTEGER DEFAULT 45,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de artigos/notícias
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT NOT NULL DEFAULT 'Diocese de São Miguel Paulista',
  featured_image_url TEXT,
  gallery_images TEXT[],
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de eventos
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  status event_status DEFAULT 'confirmado',
  featured_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mensagens do pastor
CREATE TABLE public.pastor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  content_type content_type DEFAULT 'texto',
  media_url TEXT,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela do jornal da diocese
CREATE TABLE public.journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  edition_number INTEGER,
  publication_date DATE NOT NULL,
  pdf_url TEXT NOT NULL,
  cover_image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de paróquias
CREATE TABLE public.parishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  parish_priest_id UUID,
  creation_date DATE,
  mass_schedule TEXT,
  service_hours TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela do clero
CREATE TABLE public.clergy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  ordination_date DATE,
  motto TEXT,
  parish_id UUID,
  provisioned_since DATE,
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  bio TEXT,
  is_government BOOLEAN DEFAULT false,
  government_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela do bispo
CREATE TABLE public.bishop (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Bispo Diocesano',
  motto TEXT,
  photo_url TEXT,
  bio TEXT,
  ordination_date DATE,
  episcopal_ordination_date DATE,
  appointment_date DATE,
  pastoral_letter TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de fotos da galeria
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  event_id UUID,
  album_name TEXT,
  taken_date DATE,
  photographer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de eventos da timeline
CREATE TABLE public.timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  image_url TEXT,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações do Cloudinary
CREATE TABLE public.cloudinary_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cloud_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  upload_preset TEXT NOT NULL DEFAULT 'diocese_preset',
  folder_structure TEXT NOT NULL DEFAULT 'diocese/{year}/{month}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 3. ADICIONAR FOREIGN KEYS
-- ============================================

ALTER TABLE public.clergy 
  ADD CONSTRAINT fk_clergy_parish 
  FOREIGN KEY (parish_id) REFERENCES public.parishes(id) ON DELETE SET NULL;

ALTER TABLE public.parishes 
  ADD CONSTRAINT fk_parish_priest 
  FOREIGN KEY (parish_priest_id) REFERENCES public.clergy(id) ON DELETE SET NULL;

ALTER TABLE public.photos 
  ADD CONSTRAINT fk_photo_event 
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;

-- ============================================
-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clergy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bishop ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloudinary_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CRIAR POLÍTICAS RLS - LEITURA PÚBLICA
-- ============================================

-- Permitir leitura pública de artigos publicados
CREATE POLICY "Allow public read access" 
ON public.articles FOR SELECT 
USING (published_at IS NOT NULL);

-- Permitir leitura pública de todos os eventos
CREATE POLICY "Allow public read access" 
ON public.events FOR SELECT 
USING (true);

-- Permitir leitura pública de mensagens publicadas
CREATE POLICY "Allow public read access" 
ON public.pastor_messages FOR SELECT 
USING (published_at IS NOT NULL);

-- Permitir leitura pública de jornais
CREATE POLICY "Allow public read access" 
ON public.journals FOR SELECT 
USING (true);

-- Permitir leitura pública do clero
CREATE POLICY "Allow public read access" 
ON public.clergy FOR SELECT 
USING (true);

-- Permitir leitura pública de paróquias
CREATE POLICY "Allow public read access" 
ON public.parishes FOR SELECT 
USING (true);

-- Permitir leitura pública de fotos
CREATE POLICY "Allow public read access" 
ON public.photos FOR SELECT 
USING (true);

-- Permitir leitura pública das configurações do site
CREATE POLICY "Allow public read access" 
ON public.site_settings FOR SELECT 
USING (true);

-- Permitir leitura pública do bispo
CREATE POLICY "Allow public read access" 
ON public.bishop FOR SELECT 
USING (true);

-- Permitir leitura pública de eventos da timeline ativos
CREATE POLICY "Allow public read access to active timeline events" 
ON public.timeline_events FOR SELECT 
USING (is_active = true);

-- ============================================
-- 6. CRIAR POLÍTICAS RLS - GERENCIAMENTO ADMIN
-- ============================================

-- Permitir gerenciamento completo de artigos para usuários autenticados
CREATE POLICY "Allow authenticated users to manage articles" 
ON public.articles FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo de eventos para usuários autenticados
CREATE POLICY "Allow authenticated users to manage events" 
ON public.events FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo de mensagens para usuários autenticados
CREATE POLICY "Allow authenticated users to manage pastor messages" 
ON public.pastor_messages FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo de jornais para usuários autenticados
CREATE POLICY "Allow authenticated users to manage journals" 
ON public.journals FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo do clero para usuários autenticados
CREATE POLICY "Allow authenticated users to manage clergy" 
ON public.clergy FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo de paróquias para usuários autenticados
CREATE POLICY "Allow authenticated users to manage parishes" 
ON public.parishes FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo de fotos para usuários autenticados
CREATE POLICY "Allow authenticated users to manage photos" 
ON public.photos FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo das configurações para usuários autenticados
CREATE POLICY "Allow authenticated users to manage site settings" 
ON public.site_settings FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo do bispo para usuários autenticados
CREATE POLICY "Allow authenticated users to manage bishop" 
ON public.bishop FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas específicas do bispo para insert e update
CREATE POLICY "Allow authenticated users to insert" 
ON public.bishop FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" 
ON public.bishop FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Permitir gerenciamento completo da timeline para usuários autenticados
CREATE POLICY "Allow authenticated users to manage timeline events" 
ON public.timeline_events FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir gerenciamento completo das configurações do Cloudinary para usuários autenticados
CREATE POLICY "Allow authenticated users to manage cloudinary settings" 
ON public.cloudinary_settings FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas específicas do Cloudinary
CREATE POLICY "Allow authenticated users to read cloudinary_settings" 
ON public.cloudinary_settings FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert cloudinary_settings" 
ON public.cloudinary_settings FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update cloudinary_settings" 
ON public.cloudinary_settings FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete cloudinary_settings" 
ON public.cloudinary_settings FOR DELETE 
USING (true);

-- ============================================
-- 7. CRIAR FUNÇÕES
-- ============================================

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 8. CRIAR TRIGGERS
-- ============================================

-- Triggers para atualização automática do campo updated_at
CREATE TRIGGER update_site_settings_updated_at 
  BEFORE UPDATE ON public.site_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON public.articles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pastor_messages_updated_at 
  BEFORE UPDATE ON public.pastor_messages 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journals_updated_at 
  BEFORE UPDATE ON public.journals 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clergy_updated_at 
  BEFORE UPDATE ON public.clergy 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parishes_updated_at 
  BEFORE UPDATE ON public.parishes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photos_updated_at 
  BEFORE UPDATE ON public.photos 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bishop_updated_at 
  BEFORE UPDATE ON public.bishop 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timeline_events_updated_at 
  BEFORE UPDATE ON public.timeline_events 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cloudinary_settings_updated_at 
  BEFORE UPDATE ON public.cloudinary_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. INSERIR DADOS INICIAIS
-- ============================================

-- Configurações iniciais do site
INSERT INTO public.site_settings (
  site_name, 
  site_title, 
  meta_description, 
  email_contact,
  parishes_count,
  priests_count,
  faithful_count,
  years_count
) VALUES (
  'Diocese de São Miguel Paulista',
  'Diocese de São Miguel Paulista - Fé, Esperança e Caridade',
  'Diocese de São Miguel Paulista - Comunidade católica comprometida com a evangelização, caridade e formação cristã na Zona Leste de São Paulo.',
  'contato@diocesesaomiguel.org.br',
  25,
  50,
  '1M+',
  45
);

-- Artigos de exemplo
INSERT INTO public.articles (
  title, 
  slug, 
  content, 
  excerpt, 
  featured_image_url, 
  is_featured, 
  published_at
) VALUES
(
  'Festa de São Miguel Arcanjo 2024',
  'festa-sao-miguel-arcanjo-2024',
  '<p>A Diocese de São Miguel Paulista convida toda a comunidade para participar da tradicional Festa de São Miguel Arcanjo, padroeiro da nossa diocese. Será um momento de fé, celebração e comunhão fraterna.</p><p>A festa terá início com a Missa Solene e seguirá com diversas atividades para toda a família.</p>',
  'Celebração do padroeiro da diocese acontece no dia 29 de setembro',
  '/placeholder.svg',
  true,
  now()
),
(
  'Campanha da Fraternidade 2024',
  'campanha-fraternidade-2024',
  '<p>A Campanha da Fraternidade deste ano tem como tema "Fraternidade e Amizade Social", convidando-nos a refletir sobre a construção de pontes de diálogo e paz em nossa sociedade.</p>',
  'Reflexões sobre construir pontes de diálogo e paz',
  '/placeholder.svg',
  false,
  now()
);

-- Eventos de exemplo
INSERT INTO public.events (
  title, 
  slug, 
  description, 
  event_date, 
  location, 
  featured_image_url, 
  is_featured,
  status
) VALUES
(
  'Missa Solene de São Miguel',
  'missa-solene-sao-miguel',
  'Celebração em honra ao padroeiro da diocese com a presença de nosso Bispo Diocesano e todo o clero da diocese.',
  '2024-09-29 10:00:00-03',
  'Catedral de São Miguel Arcanjo',
  '/placeholder.svg',
  true,
  'confirmado'
),
(
  'Retiro Espiritual de Jovens',
  'retiro-jovens-outubro',
  'Retiro para jovens de 16 a 35 anos com tema "Ser Jovem na Igreja". Três dias de oração, reflexão e partilha.',
  '2024-10-15 08:00:00-03',
  'Casa de Retiros Emmaus',
  '/placeholder.svg',
  false,
  'confirmado'
);

-- ============================================
-- FIM DO BACKUP
-- ============================================

-- Para restaurar este backup:
-- 1. Crie um novo projeto no Supabase
-- 2. Vá para SQL Editor
-- 3. Cole todo o conteúdo deste arquivo
-- 4. Execute o SQL
-- 5. Verifique se todas as tabelas foram criadas corretamente
-- 6. Configure as credenciais de autenticação no seu projeto
-- 7. Atualize as URLs e chaves no arquivo src/integrations/supabase/client.ts

-- NOTAS IMPORTANTES:
-- - Este backup NÃO inclui dados de usuários (auth.users)
-- - Você precisará criar novos usuários admin no novo projeto
-- - As configurações do Cloudinary precisam ser reconfiguradas
-- - As URLs de imagens precisam ser atualizadas se mudarem de bucket
-- - Certifique-se de que o storage está configurado se usar upload de imagens

-- Criar enum para status de eventos
CREATE TYPE public.event_status AS ENUM ('confirmado', 'cancelado', 'adiado');

-- Criar enum para tipos de conteúdo
CREATE TYPE public.content_type AS ENUM ('texto', 'video', 'audio');

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

-- Tabela do clero
CREATE TABLE public.clergy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL, -- padre, diácono, etc
  ordination_date DATE,
  motto TEXT,
  parish_id UUID,
  provisioned_since DATE,
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  bio TEXT,
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

-- Adicionar foreign keys
ALTER TABLE public.clergy ADD CONSTRAINT fk_clergy_parish 
  FOREIGN KEY (parish_id) REFERENCES public.parishes(id);

ALTER TABLE public.parishes ADD CONSTRAINT fk_parish_priest 
  FOREIGN KEY (parish_priest_id) REFERENCES public.clergy(id);

ALTER TABLE public.photos ADD CONSTRAINT fk_photo_event 
  FOREIGN KEY (event_id) REFERENCES public.events(id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clergy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública para todos
CREATE POLICY "Allow public read access" ON public.articles FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Allow public read access" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.pastor_messages FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Allow public read access" ON public.journals FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.clergy FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.parishes FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.site_settings FOR SELECT USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pastor_messages_updated_at BEFORE UPDATE ON public.pastor_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON public.journals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clergy_updated_at BEFORE UPDATE ON public.clergy FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parishes_updated_at BEFORE UPDATE ON public.parishes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON public.photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração inicial
INSERT INTO public.site_settings (site_name, site_title, meta_description, email_contact) 
VALUES (
  'Diocese de São Miguel Paulista',
  'Diocese de São Miguel Paulista - Fé, Esperança e Caridade',
  'Diocese de São Miguel Paulista - Comunidade católica comprometida com a evangelização, caridade e formação cristã na Zona Leste de São Paulo.',
  'contato@diocesesaomiguel.org.br'
);

-- Dados de exemplo
INSERT INTO public.articles (title, slug, content, excerpt, featured_image_url, is_featured, published_at) VALUES
('Festa de São Miguel Arcanjo 2024', 'festa-sao-miguel-arcanjo-2024', 'A Diocese de São Miguel Paulista convida toda a comunidade para participar da tradicional Festa de São Miguel Arcanjo...', 'Celebração do padroeiro da diocese acontece no dia 29 de setembro', '/placeholder.svg', true, now()),
('Campanha da Fraternidade 2024', 'campanha-fraternidade-2024', 'A Campanha da Fraternidade deste ano tem como tema "Fraternidade e Amizade Social"...', 'Reflexões sobre construir pontes de diálogo e paz', '/placeholder.svg', false, now());

INSERT INTO public.events (title, slug, description, event_date, location, featured_image_url, is_featured) VALUES
('Missa Solene de São Miguel', 'missa-solene-sao-miguel', 'Celebração em honra ao padroeiro da diocese', '2024-09-29 10:00:00-03', 'Catedral de São Miguel Arcanjo', '/placeholder.svg', true),
('Retiro Espiritual de Jovens', 'retiro-jovens-outubro', 'Retiro para jovens de 16 a 35 anos com tema "Ser Jovem na Igreja"', '2024-10-15 08:00:00-03', 'Casa de Retiros Emmaus', '/placeholder.svg', false);
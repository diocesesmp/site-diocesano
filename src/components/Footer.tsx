import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  site_name: string;
  logo_url?: string;
  email_contact?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('site_name, logo_url, email_contact, facebook_url, instagram_url, youtube_url')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setSiteSettings(data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do site:", error);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Diocese Info */}
            <div>
              <div className="flex items-center mb-6">
                {siteSettings?.logo_url ? (
                  <img src={siteSettings.logo_url} alt="Logo da Diocese" className="h-12 w-12 object-contain mr-3" />
                ) : (
                  <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center mr-3">
                    <span className="text-accent-foreground font-bold text-lg">D</span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {siteSettings?.site_name || "Diocese de São Miguel Paulista"}
                  </h3>
                  <p className="text-primary-foreground/80 text-sm">Defendei-nos no combate</p>
                </div>
              </div>
              <p className="text-primary-foreground/90 mb-6">
                Servindo à comunidade católica da zona leste de São Paulo com fé, esperança e caridade.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-3">
                {siteSettings?.facebook_url && (
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent hover:bg-primary-light" asChild>
                    <a href={siteSettings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                      <Facebook className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                {siteSettings?.instagram_url && (
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent hover:bg-primary-light" asChild>
                    <a href={siteSettings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <Instagram className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                {siteSettings?.youtube_url && (
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent hover:bg-primary-light" asChild>
                    <a href={siteSettings.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                      <Youtube className="h-5 w-5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Links Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/mensagens-do-pastor" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    Mensagens do Pastor
                  </Link>
                </li>
                <li>
                  <Link to="/noticias" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    Notícias
                  </Link>
                </li>
                <li>
                  <Link to="/eventos" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link to="/galeria" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    Galeria de Fotos
                  </Link>
                </li>
                <li>
                  <Link to="/diretorio/paroquias" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    Paróquias
                  </Link>
                </li>
                <li>
                  <Link to="/diretorio/clero" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    Diretório do Clero
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contato</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-1 text-accent" />
                  <div>
                    <p className="text-primary-foreground/90 text-sm">
                      Tv. Guilherme de Aguiar, 57<br />
                      São Miguel Paulista - São Paulo/SP<br />
                      CEP: 08011-030
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-accent" />
                  <span className="text-primary-foreground/90 text-sm">(11) 2051-6000</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-accent" />
                  <span className="text-primary-foreground/90 text-sm">
                    {siteSettings?.email_contact || "contato@diocesesmp.org.br"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-light py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/80 text-sm text-center md:text-left">
              © {currentYear} Diocese de São Miguel Paulista. Todos os direitos reservados.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <div className="flex space-x-6">
                <Link to="/politica-privacidade" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  Política de Privacidade
                </Link>
                <Link to="/termos" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  Termos de Uso
                </Link>
              </div>
              <div className="text-primary-foreground/70 text-xs">
                Dev: <a href="https://instagram.com/guthierresc" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light transition-smooth">Sem. Guthierres</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
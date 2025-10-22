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
    <footer className="bg-primary text-primary-foreground border-t-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Diocese Info - Destaque maior */}
            <div className="lg:col-span-2">
              <div className="flex items-start mb-6">
                {siteSettings?.logo_url ? (
                  <img src={siteSettings.logo_url} alt="Logo da Diocese" className="h-16 w-16 object-contain mr-4 flex-shrink-0" />
                ) : (
                  <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-elegant">
                    <span className="text-accent-foreground font-bold text-2xl">D</span>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-primary-foreground">
                    {siteSettings?.site_name || "Diocese de São Miguel Paulista"}
                  </h3>
                  <p className="text-accent font-medium text-sm italic">Defendei-nos no combate</p>
                </div>
              </div>
              
              <p className="text-primary-foreground/90 mb-6 leading-relaxed">
                Servindo à comunidade católica da zona leste de São Paulo com fé, esperança e caridade.
              </p>
              
              {/* Social Media */}
              <div>
                <h5 className="text-sm font-semibold mb-3 text-primary-foreground/90">Siga-nos</h5>
                <div className="flex space-x-2">
                  {siteSettings?.facebook_url && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-primary-foreground/20 hover:border-accent hover:bg-accent/10 hover:text-accent transition-smooth" 
                      asChild
                    >
                      <a href={siteSettings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <Facebook className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  {siteSettings?.instagram_url && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-primary-foreground/20 hover:border-accent hover:bg-accent/10 hover:text-accent transition-smooth" 
                      asChild
                    >
                      <a href={siteSettings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <Instagram className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  {siteSettings?.youtube_url && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-primary-foreground/20 hover:border-accent hover:bg-accent/10 hover:text-accent transition-smooth" 
                      asChild
                    >
                      <a href={siteSettings.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <Youtube className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-primary-foreground border-b border-primary-foreground/20 pb-2">
                Links Rápidos
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/mensagens-do-pastor" className="text-primary-foreground/80 hover:text-accent hover:translate-x-1 inline-block transition-smooth text-sm">
                    → Mensagens do Pastor
                  </Link>
                </li>
                <li>
                  <Link to="/noticias" className="text-primary-foreground/80 hover:text-accent hover:translate-x-1 inline-block transition-smooth text-sm">
                    → Notícias
                  </Link>
                </li>
                <li>
                  <Link to="/eventos" className="text-primary-foreground/80 hover:text-accent hover:translate-x-1 inline-block transition-smooth text-sm">
                    → Eventos
                  </Link>
                </li>
                <li>
                  <Link to="/galeria" className="text-primary-foreground/80 hover:text-accent hover:translate-x-1 inline-block transition-smooth text-sm">
                    → Galeria de Fotos
                  </Link>
                </li>
                <li>
                  <Link to="/diretorio/paroquias" className="text-primary-foreground/80 hover:text-accent hover:translate-x-1 inline-block transition-smooth text-sm">
                    → Paróquias
                  </Link>
                </li>
                <li>
                  <Link to="/diretorio/clero" className="text-primary-foreground/80 hover:text-accent hover:translate-x-1 inline-block transition-smooth text-sm">
                    → Diretório do Clero
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-primary-foreground border-b border-primary-foreground/20 pb-2">
                Contato
              </h4>
              <div className="space-y-3.5">
                <div className="flex items-start group">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0 group-hover:scale-110 transition-smooth" />
                  <div>
                    <p className="text-primary-foreground/90 text-sm leading-relaxed">
                      Tv. Guilherme de Aguiar, 57<br />
                      São Miguel Paulista<br />
                      São Paulo/SP - CEP: 08011-030
                    </p>
                  </div>
                </div>
                <div className="flex items-center group">
                  <Phone className="h-5 w-5 mr-3 text-accent flex-shrink-0 group-hover:scale-110 transition-smooth" />
                  <a href="tel:+551120516000" className="text-primary-foreground/90 text-sm hover:text-accent transition-smooth">
                    (11) 2051-6000
                  </a>
                </div>
                <div className="flex items-center group">
                  <Mail className="h-5 w-5 mr-3 text-accent flex-shrink-0 group-hover:scale-110 transition-smooth" />
                  <a 
                    href={`mailto:${siteSettings?.email_contact || "contato@diocesesmp.org.br"}`}
                    className="text-primary-foreground/90 text-sm hover:text-accent transition-smooth break-all"
                  >
                    {siteSettings?.email_contact || "contato@diocesesmp.org.br"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/70 text-sm text-center md:text-left">
              © {currentYear} Diocese de São Miguel Paulista. Todos os direitos reservados.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm">
              <Link to="/politica-privacidade" className="text-primary-foreground/70 hover:text-accent transition-smooth">
                Política de Privacidade
              </Link>
              <span className="hidden sm:inline text-primary-foreground/40">•</span>
              <Link to="/termos" className="text-primary-foreground/70 hover:text-accent transition-smooth">
                Termos de Uso
              </Link>
              <span className="hidden sm:inline text-primary-foreground/40">•</span>
              <div className="text-primary-foreground/60 text-xs">
                Dev: <a href="https://instagram.com/guthierresc" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light font-medium transition-smooth">Sem. Guthierres</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlobalSearch from "@/components/GlobalSearch";

interface SiteSettings {
  site_name: string;
  site_title: string;
  logo_url?: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const navigationItems = [
    { name: "Início", href: "/" },
    { name: "Notícias", href: "/noticias" },
    { name: "Eventos", href: "/eventos" },
    { name: "Bispo", href: "/bispo" },
    { name: "Campanhas", href: "/campanhas" },
    {
      name: "Diretório",
      href: "#",
      submenu: [
        { name: "Clero", href: "/diretorio/clero" },
        { name: "Paróquias", href: "/diretorio/paroquias" },
      ],
    },
  ];

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('site_name, site_title, logo_url')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setSiteSettings(data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do site:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <header className="bg-background shadow-medium sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo - Otimizado para mobile */}
          <div className="flex items-center min-w-0 flex-1 lg:flex-initial">
            <Link to="/" className="flex items-center min-w-0">
              {siteSettings?.logo_url ? (
                <img 
                  src={siteSettings.logo_url} 
                  alt="Logo da Diocese" 
                  className="h-10 w-10 md:h-12 md:w-12 object-contain mr-2 md:mr-3 flex-shrink-0" 
                />
              ) : (
                <div className="h-10 w-10 md:h-12 md:w-12 bg-primary rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-base md:text-lg">D</span>
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-primary truncate">
                  {siteSettings?.site_name || "Diocese de São Miguel Paulista"}
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {/* Search Field - Desktop */}
            <GlobalSearch placeholder="Buscar no site..." />
            
            {navigationItems.map((item) => (
              <div key={item.name} className="relative">
                {item.submenu ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <button className="flex items-center text-foreground hover:text-primary transition-smooth">
                      {item.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-background shadow-medium rounded-md border">
                        {item.submenu.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-primary transition-smooth first:rounded-t-md last:rounded-b-md"
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="text-foreground hover:text-primary transition-smooth font-medium"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
            <Button variant="accent" size="sm" asChild>
              <a href="/contato">
                Contato
              </a>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-1.5">
            <div className="w-32 sm:w-auto">
              <GlobalSearch placeholder="Buscar..." />
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-md hover:bg-secondary transition-smooth"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-primary" />
              ) : (
                <Menu className="h-6 w-6 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Melhorado */}
        {isMenuOpen && (
          <nav className="lg:hidden pb-3 border-t border-border mt-2">            
            <div className="space-y-0.5 pt-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-smooth flex items-center justify-between">
                        {item.name}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <div className="ml-3 space-y-0.5 mt-0.5">
                        {item.submenu.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-smooth"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary hover:text-primary rounded-md transition-smooth"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
              <div className="pt-3">
                <Button variant="accent" size="sm" className="w-full" asChild>
                  <a href="/contato" onClick={() => setIsMenuOpen(false)}>
                    Contato
                  </a>
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
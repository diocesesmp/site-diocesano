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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              {siteSettings?.logo_url ? (
                <img src={siteSettings.logo_url} alt="Logo da Diocese" className="h-12 w-12 object-contain mr-3" />
              ) : (
                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-foreground font-bold text-lg">D</span>
                </div>
              )}
            </Link>
            <div>
              <h1 className="text-xl font-bold text-primary">
                {siteSettings?.site_name || "Diocese de São Miguel Paulista"}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Search Field - Desktop */}
            <GlobalSearch className="w-64" placeholder="Buscar no site..." />
            
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
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden pb-4">
            {/* Search Field - Mobile */}
            <div className="mb-4">
              <GlobalSearch className="w-full" placeholder="Buscar no site..." />
            </div>
            
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button className="w-full text-left px-3 py-2 text-foreground hover:bg-secondary rounded-md transition-smooth">
                        {item.name}
                      </button>
                      <div className="ml-4 space-y-1">
                        {item.submenu.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-smooth"
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="block px-3 py-2 text-foreground hover:bg-secondary hover:text-primary rounded-md transition-smooth"
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
              <div className="pt-2">
                <Button variant="accent" size="sm" className="w-full" asChild>
                  <a href="/contato">
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
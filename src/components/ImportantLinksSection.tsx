import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface ImportantLink {
  id: string;
  title: string;
  url: string;
  icon_url?: string;
  order_position: number;
}

const ImportantLinksSection = () => {
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('important_links')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) {
        console.error("Erro ao carregar links:", error);
        return;
      }

      if (data) {
        setLinks(data);
      }
    } catch (error) {
      console.error("Erro ao carregar links:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || links.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Links Importantes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Acesse recursos e informações essenciais da Diocese
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary/50">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  {link.icon_url ? (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      <img
                        src={link.icon_url}
                        alt={link.title}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-primary" />
                    </div>
                  )}

                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>

                  <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Acessar</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImportantLinksSection;

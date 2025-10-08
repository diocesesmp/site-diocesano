import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // NOVA DISTÂNCIA: Largura do card (180px) + gap (space-x-6, que é 24px) = 204px.
  // Usaremos 205 para rolagem suave.
  const scrollDistance = 205; 

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('important_links')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) {
        console.error("Erro ao carregar links:", error);
        return;
      }
      setLinks(data || []);
    } catch (error) {
      console.error("Erro ao carregar links:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -scrollDistance,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: scrollDistance,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <section className="py-16 text-center bg-gradient-to-b from-background to-muted/20">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </section>
    );
  }

  if (links.length === 0) {
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

        {/* CONTÊINER DO CARROSSEL */}
        <div className="relative max-w-7xl mx-auto">
          
          {/* Botão de Navegação Esquerda (Aparece em telas grandes) */}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex bg-background/80 backdrop-blur-sm border shadow-lg"
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Botão de Navegação Direita (Aparece em telas grandes) */}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex bg-background/80 backdrop-blur-sm border shadow-lg"
            aria-label="Rolar para a direita"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Área de Rolagem dos Cards */}
          <div
            ref={scrollRef} 
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          >
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                // LARGURA DO CARD REDUZIDA PARA APROXIMAR DO QUADRADO
                className="group flex-shrink-0 w-[180px] snap-center" 
              >
                {/* O h-full em conjunto com o p-3 e espaço y-2 ajuda na proporção */}
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
                  <CardContent className="p-3 flex flex-col items-center text-center space-y-2"> 
                    
                    {/* REDUÇÃO DOS ÍCONES/IMAGENS */}
                    {link.icon_url ? (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        <img
                          src={link.icon_url}
                          alt={link.title}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-primary" />
                      </div>
                    )}

                    {/* REDUÇÃO DA FONTE DO TÍTULO */}
                    <h3 className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors"> 
                      {link.title}
                    </h3>

                    {/* TEXTO DE ACESSO MENOR */}
                    <div className="flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Acessar</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImportantLinksSection;

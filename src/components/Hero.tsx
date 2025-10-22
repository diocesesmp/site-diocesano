import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-diocese.jpg";

const Hero = () => {
  const [stats, setStats] = useState({
    parishes: 25,
    priests: 50,
    faithful: "1M+",
    years: 45
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('parishes_count, priests_count, faithful_count, years_count, logo_url, hero_background_url')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Erro ao carregar configurações:", error);
        return;
      }

      if (data && (data as any[]).length > 0) {
        const row: any = (data as any[])[0];
        console.log("Configurações carregadas do banco:", row);
        setStats({
          parishes: row.parishes_count || 25,
          priests: row.priests_count || 50,
          faithful: row.faithful_count || "1M+",
          years: row.years_count || 45
        });
        setLogoUrl(row.logo_url || null);
        setHeroBackgroundUrl(row.hero_background_url || null);
      } else {
        console.log("Nenhum dado encontrado no banco");
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center bg-primary-dark overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackgroundUrl || heroImage})` }}
      >
        <div className="absolute inset-0 bg-hero-gradient opacity-80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-0">
        {logoUrl && (
          <div className="flex justify-center mb-4 sm:mb-6">
            <img
              src={logoUrl}
              alt="Brasão Diocese de São Miguel Paulista"
              className="h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.7))' }}
            />
          </div>
        )}
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6 leading-tight px-2" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)' }}>
          Diocese de São Miguel Paulista
        </h1>
        <p className="text-base sm:text-xl md:text-2xl text-primary-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.4)' }}>
          Caminhando juntos na fé, construindo uma comunidade de amor e esperança 
          no coração da zona leste de São Paulo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Button variant="hero" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3" asChild>
            <a href="/sobre">
              Conheça Nossa Missão
            </a>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
            <a href="/sobre">
              Sobre a Diocese
            </a>
          </Button>
        </div>

        {/* Statistics - Otimizado para mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-primary-foreground/20">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>{stats.parishes}+</div>
            <div className="text-primary-foreground text-xs sm:text-sm md:text-base font-medium mt-1" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>Paróquias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>{stats.priests}+</div>
            <div className="text-primary-foreground text-xs sm:text-sm md:text-base font-medium mt-1" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>Padres</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>{stats.faithful}</div>
            <div className="text-primary-foreground text-xs sm:text-sm md:text-base font-medium mt-1" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>Fiéis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>{stats.years}</div>
            <div className="text-primary-foreground text-xs sm:text-sm md:text-base font-medium mt-1" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>Anos</div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
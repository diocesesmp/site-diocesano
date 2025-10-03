import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Campaign {
  id: string;
  title: string;
  description: string;
  slug: string;
  image_url?: string;
  goal_amount?: number;
  default_amounts: number[];
  min_amount: number;
  is_active: boolean;
}

const Campanhas = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao carregar campanhas:", error);
        return;
      }

      if (data) {
        setCampaigns(
          data.map((d: any) => ({
            ...d,
            default_amounts: Array.isArray(d.default_amounts)
              ? (d.default_amounts as number[])
              : (typeof d.default_amounts === 'string'
                  ? (JSON.parse(d.default_amounts) as number[])
                  : []),
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar campanhas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Campanhas de Doação
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sua contribuição faz a diferença em nossa missão.
            Conheça nossas campanhas ativas e faça parte dessa transformação.
          </p>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Nenhuma campanha ativa no momento
            </h2>
            <p className="text-muted-foreground">
              Volte em breve para conhecer nossas próximas campanhas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
                {campaign.image_url && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-4">
                    {campaign.description}
                  </p>

                  {campaign.goal_amount && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Meta da Campanha</span>
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        R$ {campaign.goal_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate(`/doacoes/${campaign.slug}`)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Fazer Doação
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Doação mínima: R$ {campaign.min_amount.toFixed(2)}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {campaigns.length > 0 && (
          <div className="mt-16 text-center max-w-3xl mx-auto p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Por que sua doação é importante?
            </h2>
            <p className="text-muted-foreground mb-6">
              Cada contribuição ajuda a Diocese de São Miguel Paulista a continuar sua missão de evangelização,
              apoio às comunidades e obras de caridade. Juntos, podemos fazer a diferença na vida de milhares de pessoas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Transparência nas doações</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">Seguro</div>
                <p className="text-sm text-muted-foreground">Pagamento protegido</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">Rápido</div>
                <p className="text-sm text-muted-foreground">Processo simplificado</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Campanhas;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader as Loader2 } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const Doacoes = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCampaign();
    }
  }, [slug]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_campaigns')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Campanha não encontrada",
          description: "Esta campanha não existe ou não está ativa.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setCampaign(data);
    } catch (error) {
      console.error('Erro ao carregar campanha:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar campanha.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, p1, p2, p3) =>
        p3 ? `(${p1}) ${p2}-${p3}` : p2 ? `(${p1}) ${p2}` : p1 ? `(${p1}` : ''
      );
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, p1, p2, p3) =>
      p3 ? `(${p1}) ${p2}-${p3}` : p2 ? `(${p1}) ${p2}` : p1 ? `(${p1}` : ''
    );
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const getDonationAmount = (): number => {
    if (customAmount) {
      return parseFloat(customAmount);
    }
    return selectedAmount || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = getDonationAmount();

    if (!campaign) return;

    if (amount < campaign.min_amount) {
      toast({
        title: "Valor inválido",
        description: `O valor mínimo da doação é R$ ${campaign.min_amount.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um telefone válido.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const { data: stripeSettings, error: settingsError } = await supabase
        .from('stripe_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settingsError) throw settingsError;

      if (!stripeSettings) {
        throw new Error('Configurações do Stripe não encontradas');
      }

      const isTestMode = stripeSettings.stripe_environment === 'test';
      const publishableKey = isTestMode
        ? stripeSettings.stripe_test_publishable_key
        : stripeSettings.stripe_live_publishable_key;

      if (!publishableKey) {
        throw new Error('Chave pública do Stripe não configurada');
      }

      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .insert({
          campaign_id: campaign.id,
          donor_name: formData.name,
          donor_email: formData.email,
          donor_phone: formData.phone,
          amount: amount,
          status: 'pending'
        })
        .select()
        .single();

      if (donationError) throw donationError;

      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error('Erro ao carregar Stripe');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: amount,
          donationId: donation.id,
          campaignTitle: campaign.title,
          donorEmail: formData.email,
          isTestMode
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento');
      }

      const { clientSecret } = await response.json();

      navigate(`/doacoes/${slug}/checkout`, {
        state: {
          clientSecret,
          donationId: donation.id,
          amount,
          campaignTitle: campaign.title,
          publishableKey
        }
      });

    } catch (error: any) {
      console.error('Erro ao processar doação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar doação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="h-6 w-6 text-red-500" />
                {campaign.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {campaign.image_url && (
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              {campaign.description && (
                <p className="text-muted-foreground">{campaign.description}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Escolha o valor da doação</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {campaign.default_amounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={selectedAmount === amount ? "default" : "outline"}
                        className="h-16 text-lg font-semibold"
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                      >
                        R$ {amount.toFixed(2)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom_amount">Ou insira um valor personalizado</Label>
                  <Input
                    id="custom_amount"
                    type="number"
                    step="0.01"
                    min={campaign.min_amount}
                    placeholder={`Mínimo R$ ${campaign.min_amount.toFixed(2)}`}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Seus dados</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="(00) 00000-0000"
                        required
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total da doação:</span>
                    <span className="text-2xl text-primary">
                      R$ {getDonationAmount().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={processing || getDonationAmount() < campaign.min_amount}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5 mr-2" />
                      Continuar para pagamento
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Doacoes;

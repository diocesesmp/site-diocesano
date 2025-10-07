import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader as Loader2, CreditCard, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const PAYMENT_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-mercadopago-payment`;

const DoacoesCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { publicKey, donationId, amount, campaignTitle, campaignId, donorName, donorEmail, donorPhone } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Carregar script do Mercado Pago
  useEffect(() => {
    if (!donationId || !publicKey || !amount) {
      navigate('/');
      return;
    }

    // Verificar se o script já foi carregado
    if (window.MercadoPago) {
      setScriptLoaded(true);
      setLoading(false);
      return;
    }

    // Carregar script do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      setLoading(false);
    };
    script.onerror = () => {
      toast({
        title: "Erro",
        description: "Erro ao carregar sistema de pagamento.",
        variant: "destructive",
      });
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [donationId, publicKey, amount, navigate]);

  // Inicializar Mercado Pago após script carregar e componente montar
  useEffect(() => {
    if (!scriptLoaded || !publicKey) return;
    
    initializeMercadoPago();
  }, [scriptLoaded, publicKey]);

  const initializeMercadoPago = async () => {
    try {
      const mp = new window.MercadoPago(publicKey, {
        locale: 'pt-BR'
      });

      // Criar Card Payment Brick
      const bricksBuilder = mp.bricks();
      
      const cardPaymentBrickController = await bricksBuilder.create('cardPayment', 'mercadopago-checkout', {
        initialization: {
          amount: amount,
        },
        customization: {
          visual: {
            style: {
              theme: 'default',
            },
          },
          paymentMethods: {
            maxInstallments: 12,
          },
        },
        callbacks: {
          onReady: () => {
            setLoading(false);
          },
          onSubmit: async (formData: any) => {
            setProcessing(true);
            try {
              const { data: { session } } = await supabase.auth.getSession();

              const response = await fetch(PAYMENT_FUNCTION_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.access_token || SUPABASE_PUBLISHABLE_KEY}`,
                  'apikey': SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({
                  donationId,
                  campaignId,
                  amount,
                  paymentData: formData,
                  donorEmail,
                  donorName,
                  donorPhone,
                })
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.error || errorData.message || 'Erro ao processar pagamento');
              }

              const result = await response.json();

              if (result.status === 'approved') {
                setPaymentSuccess(true);
                toast({
                  title: "Pagamento aprovado!",
                  description: "Sua doação foi processada com sucesso.",
                });
                setTimeout(() => {
                  navigate(`/doacoes/obrigado?donation_id=${donationId}`);
                }, 2000);
              } else if (result.status === 'pending') {
                toast({
                  title: "Pagamento pendente",
                  description: "Seu pagamento está sendo processado.",
                });
                setTimeout(() => {
                  navigate(`/doacoes/obrigado?donation_id=${donationId}`);
                }, 2000);
              } else {
                throw new Error(result.status_detail || 'Pagamento rejeitado');
              }
            } catch (error: any) {
              console.error('Erro ao processar pagamento:', error);
              toast({
                title: "Erro no pagamento",
                description: error.message || "Erro ao processar pagamento. Tente novamente.",
                variant: "destructive",
              });
              setProcessing(false);
            }
          },
          onError: (error: any) => {
            console.error('Erro no Mercado Pago Brick:', error);
            toast({
              title: "Erro",
              description: "Erro ao processar pagamento.",
              variant: "destructive",
            });
          },
        },
      });

    } catch (error: any) {
      console.error('Erro ao inicializar Mercado Pago:', error);
      toast({
        title: "Erro",
        description: error?.message || "Erro ao carregar sistema de pagamento.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pagamento aprovado!</h2>
            <p className="text-muted-foreground">Redirecionando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Finalizar Doação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-1">Você está doando para</p>
                <p className="font-semibold text-lg">{campaignTitle}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  R$ {amount?.toFixed(2)}
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 min-h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-muted-foreground">Carregando formulário de pagamento...</p>
                </div>
              ) : (
                <>
                  <div id="mercadopago-checkout" className="min-h-[400px]">
                    {processing && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p className="text-muted-foreground">Processando pagamento...</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-center text-muted-foreground mt-6">
                    <CreditCard className="h-4 w-4 inline mr-1" />
                    Pagamento seguro processado pelo Mercado Pago
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoacoesCheckout;

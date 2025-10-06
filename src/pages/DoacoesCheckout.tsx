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
  // Desestruturar com valores padrão para evitar 'undefined'
  const { 
    publicKey, 
    donationId, 
    amount, 
    campaignTitle, 
    campaignId, 
    donorName, 
    donorEmail, 
    donorPhone 
  } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  const initializeMercadoPago = async () => {
    // Verifica se o container ID está presente no DOM ANTES de inicializar
    if (!document.getElementById('mercadopago-checkout')) {
      console.error("Erro de Timing: Contêiner 'mercadopago-checkout' não encontrado. Tentativa de Inicialização falhou.");
      // Tente novamente após um pequeno atraso, se desejar, mas o fix principal é no script.onload
      setLoading(false);
      return; 
    }
    
    try {
      const mp = new window.MercadoPago(publicKey, {
        locale: 'pt-BR'
      });

      const bricksBuilder = mp.bricks();

      await bricksBuilder.create('cardPayment', 'mercadopago-checkout', {
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
            // O Brick está pronto para ser exibido/interagido
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
                // Retorna a mensagem de erro detalhada do backend/Mercado Pago
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
              // IMPORTANTE: Retorna false para evitar que o Brick continue o fluxo de pagamento
              return false;
            }
          },
          onError: (error: any) => {
            console.error('Erro no Mercado Pago Brick:', error);
            toast({
              title: "Erro",
              description: error?.message || "Erro ao carregar ou processar pagamento. Verifique as configurações.",
              variant: "destructive",
            });
            setLoading(false);
          },
        },
      });

    } catch (error: any) {
      // Captura o erro 'Could not find the Brick container ID...'
      console.error('Erro ao inicializar Mercado Pago:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar sistema de pagamento.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!donationId || !publicKey || !amount) {
      navigate('/');
      return;
    }
    
    // --- INÍCIO DA CORREÇÃO ---
    // Otimiza o carregamento do script do Mercado Pago
    if (window.MercadoPago) {
      // Se já carregou, inicializa diretamente
      initializeMercadoPago();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    
    // CORREÇÃO DE TIMING: Adiciona um pequeno delay após o script carregar
    // para garantir que o React já renderizou a div #mercadopago-checkout
    script.onload = () => {
      // O script do MP está carregado, agora damos um pequeno respiro para o DOM
      setTimeout(() => {
        initializeMercadoPago();
      }, 100); 
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [donationId, publicKey, amount, navigate]); // Dependências do useEffect

  // O restante do seu JSX (a parte de renderização) permanece inalterado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
      <main className="flex-1 container mx-auto px-4 py-12">
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

              {/* A DIV CRÍTICA ESTÁ AQUI - SEU CÓDIGO ESTAVA CORRETO */}
              <div id="mercadopago-checkout" className="min-h-[500px]">
                {processing && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-muted-foreground">Processando pagamento...</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground mt-6">
                <CreditCard className="h-4 w-4 inline mr-1" />
                Pagamento seguro processado pelo Mercado Pago
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoacoesCheckout;

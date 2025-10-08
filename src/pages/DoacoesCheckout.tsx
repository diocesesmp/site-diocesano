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

  // Mapeamento de erros do Mercado Pago para mensagens amigáveis
  const getErrorMessage = (statusDetail: string): string => {
    const errorMessages: Record<string, string> = {
      'cc_rejected_bad_filled_card_number': 'Número do cartão inválido. Verifique e tente novamente.',
      'cc_rejected_bad_filled_date': 'Data de validade inválida. Verifique e tente novamente.',
      'cc_rejected_bad_filled_security_code': 'Código de segurança inválido. Verifique e tente novamente.',
      'cc_rejected_blacklist': 'Não foi possível processar seu pagamento.',
      'cc_rejected_call_for_authorize': 'Entre em contato com seu banco para autorizar o pagamento.',
      'cc_rejected_card_disabled': 'Cartão desabilitado. Entre em contato com seu banco.',
      'cc_rejected_card_error': 'Não foi possível processar seu cartão.',
      'cc_rejected_duplicated_payment': 'Você já realizou um pagamento com esse valor. Se precisar pagar novamente, use outro cartão.',
      'cc_rejected_high_risk': 'Pagamento recusado. Tente com outro meio de pagamento.',
      'cc_rejected_insufficient_amount': 'Saldo insuficiente no cartão.',
      'cc_rejected_invalid_installments': 'Número de parcelas não aceito para este cartão.',
      'cc_rejected_max_attempts': 'Você atingiu o limite de tentativas. Tente novamente em 24 horas.',
      'cc_rejected_other_reason': 'Pagamento recusado. Verifique os dados do cartão ou tente outro meio de pagamento.',
    };
    return errorMessages[statusDetail] || 'Pagamento recusado. Verifique os dados e tente novamente.';
  };

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
            try {
              setProcessing(true);
              console.log('Dados do formulário Mercado Pago:', formData);

              if (!formData || !formData.token) {
                throw new Error('Dados do pagamento incompletos. Tente novamente.');
              }

              // Criar AbortController para timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

              try {
                const response = await fetch(PAYMENT_FUNCTION_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
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
                  }),
                  signal: controller.signal,
                });

                clearTimeout(timeoutId);

                let result;
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                  result = await response.json();
                } else {
                  const text = await response.text();
                  console.error('Resposta não-JSON:', text);
                  throw new Error('Resposta inválida do servidor');
                }

                if (!response.ok) {
                  throw new Error(result.error || result.message || 'Erro ao processar pagamento');
                }

                console.log('Resultado do pagamento:', result);

                if (result.status === 'approved') {
                  setPaymentSuccess(true);
                  toast({
                    title: "Pagamento aprovado!",
                    description: "Sua doação foi processada com sucesso.",
                  });
                  setTimeout(() => {
                    navigate(`/doacoes/obrigado?donation_id=${donationId}`);
                  }, 2000);
                  return;
                } else if (result.status === 'pending' || result.status === 'in_process') {
                  toast({
                    title: "Pagamento pendente",
                    description: "Seu pagamento está sendo processado. Você receberá uma confirmação em breve.",
                  });
                  setTimeout(() => {
                    navigate(`/doacoes/obrigado?donation_id=${donationId}`);
                  }, 2000);
                  return;
                } else {
                  const errorMessage = getErrorMessage(result.status_detail || '');
                  throw new Error(errorMessage);
                }
              } catch (fetchError: any) {
                clearTimeout(timeoutId);

                if (fetchError.name === 'AbortError') {
                  throw new Error('O processamento está demorando mais que o esperado. Tente novamente.');
                }
                throw fetchError;
              }
            } catch (error: any) {
              console.error('Erro ao processar pagamento:', error);
              setProcessing(false);

              toast({
                title: "Pagamento não aprovado",
                description: error.message || "Verifique os dados do cartão e tente novamente.",
                variant: "destructive",
              });

              throw error;
            }
          },
          onError: (error: any) => {
            console.error('Erro no Mercado Pago Brick:', error);
            setProcessing(false);

            toast({
              title: "Erro",
              description: "Erro ao processar pagamento. Tente novamente.",
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
                  <div id="mercadopago-checkout" className="min-h-[400px] relative">
                    {processing && (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
                        <div className="bg-card p-8 rounded-lg shadow-lg text-center">
                          <Loader2 className="h-12 w-12 animate-spin mb-4 mx-auto text-primary" />
                          <p className="text-lg font-semibold mb-2">Processando pagamento</p>
                          <p className="text-sm text-muted-foreground">Aguarde enquanto confirmamos sua doação...</p>
                        </div>
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

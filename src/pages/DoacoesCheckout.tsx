import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader as Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

const PAYMENT_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-pagarme-payment`;

const DoacoesCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { donationId, amount, campaignTitle, campaignId, donorName, donorEmail, donorPhone } = location.state || {};
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    card_number: '',
    card_holder_name: '',
    card_expiration_date: '',
    card_cvv: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!donationId || !amount) {
      navigate('/');
      return;
    }
  }, [donationId, amount, navigate]);

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpirationDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardData({ ...cardData, card_number: formatted });
    }
  };

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpirationDate(e.target.value);
    if (formatted.replace(/\D/g, '').length <= 4) {
      setCardData({ ...cardData, card_expiration_date: formatted });
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    if (numbers.length <= 4) {
      setCardData({ ...cardData, card_cvv: numbers });
    }
  };

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'invalid_card_number': 'Número do cartão inválido.',
      'invalid_expiration_date': 'Data de validade inválida.',
      'invalid_cvv': 'CVV inválido.',
      'card_declined': 'Cartão recusado. Tente outro cartão.',
      'insufficient_funds': 'Saldo insuficiente.',
      'card_expired': 'Cartão expirado.',
    };
    return errorMessages[error] || 'Erro ao processar pagamento. Verifique os dados e tente novamente.';
  };

  const validateCardData = (): boolean => {
    const cardNumber = cardData.card_number.replace(/\s/g, '');

    if (cardNumber.length < 13 || cardNumber.length > 16) {
      toast({
        title: "Erro",
        description: "Número do cartão inválido.",
        variant: "destructive",
      });
      return false;
    }

    if (!cardData.card_holder_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do titular é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    const expiration = cardData.card_expiration_date.replace(/\D/g, '');
    if (expiration.length !== 4) {
      toast({
        title: "Erro",
        description: "Data de validade inválida.",
        variant: "destructive",
      });
      return false;
    }

    const month = parseInt(expiration.slice(0, 2));
    const year = parseInt(expiration.slice(2, 4));
    if (month < 1 || month > 12) {
      toast({
        title: "Erro",
        description: "Mês de validade inválido.",
        variant: "destructive",
      });
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      toast({
        title: "Erro",
        description: "Cartão expirado.",
        variant: "destructive",
      });
      return false;
    }

    if (cardData.card_cvv.length < 3 || cardData.card_cvv.length > 4) {
      toast({
        title: "Erro",
        description: "CVV inválido.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCardData()) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Iniciando processamento do pagamento');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

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
            cardData: {
              card_number: cardData.card_number.replace(/\s/g, ''),
              card_holder_name: cardData.card_holder_name,
              card_expiration_date: cardData.card_expiration_date.replace(/\D/g, ''),
              card_cvv: cardData.card_cvv
            },
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

        if (result.status === 'paid') {
          setPaymentSuccess(true);
          toast({
            title: "Pagamento aprovado!",
            description: "Sua doação foi processada com sucesso.",
          });
          setTimeout(() => {
            navigate(`/doacoes/obrigado?donation_id=${donationId}`);
          }, 2000);
          return;
        } else if (result.status === 'pending' || result.status === 'processing') {
          toast({
            title: "Pagamento pendente",
            description: "Seu pagamento está sendo processado. Você receberá uma confirmação em breve.",
          });
          setTimeout(() => {
            navigate(`/doacoes/obrigado?donation_id=${donationId}`);
          }, 2000);
          return;
        } else {
          const errorMessage = getErrorMessage(result.status || '');
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

      setError(error.message);
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="card_number">Número do Cartão</Label>
                  <Input
                    id="card_number"
                    type="text"
                    value={cardData.card_number}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    required
                    maxLength={19}
                  />
                </div>

                <div>
                  <Label htmlFor="card_holder_name">Nome do Titular</Label>
                  <Input
                    id="card_holder_name"
                    type="text"
                    value={cardData.card_holder_name}
                    onChange={(e) => setCardData({ ...cardData, card_holder_name: e.target.value.toUpperCase() })}
                    placeholder="NOME COMO NO CARTÃO"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card_expiration_date">Validade</Label>
                    <Input
                      id="card_expiration_date"
                      type="text"
                      value={cardData.card_expiration_date}
                      onChange={handleExpirationDateChange}
                      placeholder="MM/AA"
                      required
                      maxLength={5}
                    />
                  </div>

                  <div>
                    <Label htmlFor="card_cvv">CVV</Label>
                    <Input
                      id="card_cvv"
                      type="text"
                      value={cardData.card_cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      required
                      maxLength={4}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processando pagamento...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Confirmar Pagamento
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  <CreditCard className="h-4 w-4 inline mr-1" />
                  Pagamento seguro processado pelo Pagar.me
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoacoesCheckout;

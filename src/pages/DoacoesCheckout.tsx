import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader as Loader2, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CheckoutFormProps {
  donationId: string;
  amount: number;
  campaignTitle: string;
}

const CheckoutForm = ({ donationId, amount, campaignTitle }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/doacoes/obrigado?donation_id=${donationId}`,
        },
      });

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted p-4 rounded-lg mb-6">
        <p className="text-sm text-muted-foreground mb-1">Você está doando para</p>
        <p className="font-semibold text-lg">{campaignTitle}</p>
        <p className="text-2xl font-bold text-primary mt-2">
          R$ {amount.toFixed(2)}
        </p>
      </div>

      <PaymentElement />

      <Button
        type="submit"
        className="w-full h-12 text-lg"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processando pagamento...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Finalizar doação
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Pagamento seguro processado pelo Stripe
      </p>
    </form>
  );
};

const DoacoesCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientSecret, donationId, amount, campaignTitle, publishableKey } = location.state || {};
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    if (!clientSecret || !donationId || !publishableKey) {
      navigate('/');
      return;
    }

    setStripePromise(loadStripe(publishableKey));
  }, [clientSecret, donationId, publishableKey, navigate]);

  if (!stripePromise || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#8b5cf6',
      },
    },
    locale: 'pt-BR'
  };

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
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm
                  donationId={donationId}
                  amount={amount}
                  campaignTitle={campaignTitle}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoacoesCheckout;

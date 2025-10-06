import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader as Loader2, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const DoacoesCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { preferenceId, publicKey, donationId, amount, campaignTitle } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!preferenceId || !donationId || !publicKey) {
      navigate('/');
      return;
    }

    // Carregar script do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => initializeMercadoPago();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [preferenceId, donationId, publicKey, navigate]);

  const initializeMercadoPago = () => {
    try {
      const mp = new window.MercadoPago(publicKey, {
        locale: 'pt-BR'
      });

      // Criar checkout
      mp.checkout({
        preference: {
          id: preferenceId
        },
        render: {
          container: '#mercadopago-checkout',
          label: 'Finalizar doação',
        },
        theme: {
          elementsColor: '#8b5cf6',
          headerColor: '#8b5cf6',
        },
      });

      setLoading(false);
    } catch (error) {
      console.error('Erro ao inicializar Mercado Pago:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar sistema de pagamento.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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

              <div id="mercadopago-checkout" className="min-h-[400px]"></div>

              <p className="text-xs text-center text-muted-foreground mt-6">
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

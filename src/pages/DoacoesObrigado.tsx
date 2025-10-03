import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleCheck as CheckCircle, Loader as Loader2, Download, Chrome as Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Donation {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  amount: number;
  status: string;
  created_at: string;
  campaign_id: string;
  donation_campaigns: {
    title: string;
    image_url?: string;
  };
}

const DoacoesObrigado = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const donationId = searchParams.get('donation_id');

  useEffect(() => {
    if (!donationId) {
      navigate('/');
      return;
    }

    const loadDonation = async () => {
      try {
        const paymentIntent = searchParams.get('payment_intent');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/donation-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ donationId, paymentIntentId: paymentIntent || undefined })
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Falha ao carregar status da doação');
        }
        const data = await response.json();
        setDonation(data);
      } catch (error) {
        console.error('Erro ao carregar doação:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDonation();
  }, [donationId, searchParams, navigate]);

  const generatePDFReceipt = async () => {
    if (!donation) return;

    setDownloading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          donationId: donation.id
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar comprovante');
      }

      const contentType = response.headers.get('Content-Type');
      const blob = await response.blob();

      // Se retornou HTML, abre em nova janela para impressão
      if (contentType?.includes('text/html')) {
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        // Se retornou PDF, faz download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprovante-doacao-${donation.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!donation) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl">Obrigado pela sua doação!</CardTitle>
              <p className="text-muted-foreground mt-2">
                Sua generosidade faz a diferença
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {donation.donation_campaigns.image_url && (
                <img
                  src={donation.donation_campaigns.image_url}
                  alt={donation.donation_campaigns.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div className="bg-muted p-6 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campanha:</span>
                  <span className="font-semibold">{donation.donation_campaigns.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-semibold text-xl text-primary">
                    R$ {donation.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-semibold">
                    {new Date(donation.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-green-600">
                    {donation.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Confirmação enviada!</strong><br />
                  Um e-mail de confirmação foi enviado para {donation.donor_email} com os detalhes da sua doação.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={generatePDFReceipt}
                  disabled={downloading}
                  variant="outline"
                  className="flex-1"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Comprovante
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Início
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-4">
                <p>Código da doação: {donation.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoacoesObrigado;

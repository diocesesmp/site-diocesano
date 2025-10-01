import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Calendar, Eye, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Journal {
  id: string;
  title: string;
  edition_number?: number;
  publication_date: string;
  pdf_url: string;
  cover_image_url?: string;
  description?: string;
}

const JornalPage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const journalsPerPage = 12;

  useEffect(() => {
    fetchJournals();
  }, [currentPage]);

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('publication_date', { ascending: false })
        .range((currentPage - 1) * journalsPerPage, currentPage * journalsPerPage - 1);

      if (error) throw error;
      setJournals(data || []);
    } catch (error) {
      console.error('Erro ao carregar jornais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (pdfUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Jornal da Diocese</h1>
          <p className="text-muted-foreground">
            Acesse as edições do nosso jornal oficial com notícias, reflexões e informações importantes da Diocese
          </p>
        </div>

        {journals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma edição encontrada.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {journals.map((journal) => (
                <Card key={journal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    {journal.cover_image_url ? (
                      <img 
                        src={journal.cover_image_url} 
                        alt={journal.title}
                        className="w-full h-64 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-64 bg-muted flex items-center justify-center rounded-t-lg">
                        <div className="text-center text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-2" />
                          <p className="font-medium">Jornal da Diocese</p>
                          {journal.edition_number && (
                            <p className="text-sm">Edição {journal.edition_number}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="mb-3 line-clamp-2">
                      {journal.title}
                      {journal.edition_number && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (Edição {journal.edition_number})
                        </span>
                      )}
                    </CardTitle>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(journal.publication_date), "MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>

                    {journal.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {journal.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleView(journal.pdf_url)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ler Online
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownload(journal.pdf_url, journal.title)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={journals.length < journalsPerPage}
              >
                Próxima
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default JornalPage;
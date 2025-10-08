import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Phone, Mail, Globe, Calendar, Clock, ArrowLeft, User } from "lucide-react";

interface Parish {
  id: string;
  name: string;
  slug: string;
  address: string;
  parish_priest_id?: string;
  creation_date?: string;
  mass_schedule?: string;
  service_hours?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  clergy?: {
    name: string;
    slug: string;
    position: string;
  };
}

const DiretorioParoquiasPage = () => {
  const { slug } = useParams();
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [currentParish, setCurrentParish] = useState<Parish | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const parishesPerPage = 12;

  useEffect(() => {
    if (slug) {
      fetchParish();
    } else {
      fetchParishes();
    }
  }, [slug, currentPage]);

  const fetchParishes = async () => {
    try {
      const { data, error } = await supabase
        .from('parishes')
        .select(`
          *,
          clergy:parish_priest_id (
            name,
            slug,
            position
          )
        `)
        .order('name')
        .range((currentPage - 1) * parishesPerPage, currentPage * parishesPerPage - 1);

      if (error) throw error;
      setParishes(data || []);
    } catch (error) {
      console.error('Erro ao carregar paróquias:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParish = async () => {
    try {
      const { data, error } = await supabase
        .from('parishes')
        .select(`
          *,
          clergy:parish_priest_id (
            name,
            slug,
            position
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setCurrentParish(data);
    } catch (error) {
      console.error('Erro ao carregar paróquia:', error);
    } finally {
      setLoading(false);
    }
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

  // Página individual da paróquia
  if (slug && currentParish) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/diretorio/paroquias">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Paróquias
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardHeader>
                    {currentParish.image_url && (
                      <img
                        src={currentParish.image_url}
                        alt={currentParish.name}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <CardTitle className="text-3xl text-primary">{currentParish.name}</CardTitle>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{currentParish.address}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {currentParish.description ? (
                      <div className="prose prose-lg max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: currentParish.description }} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Descrição não disponível.</p>
                    )}
                  </CardContent>
                </Card>

                {(currentParish.mass_schedule || currentParish.service_hours) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentParish.mass_schedule && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Horários de Missa
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="whitespace-pre-line text-sm">
                            {currentParish.mass_schedule}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentParish.service_hours && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Horários de Atendimento
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="whitespace-pre-line text-sm">
                            {currentParish.service_hours}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentParish.clergy && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Pároco
                        </h4>
                        <Link 
                          to={`/diretorio/clero/${currentParish.clergy.slug}`}
                          className="text-primary hover:underline block"
                        >
                          {currentParish.clergy.name}
                        </Link>
                        <Badge variant="outline" className="mt-1">
                          {currentParish.clergy.position}
                        </Badge>
                      </div>
                    )}

                    {currentParish.creation_date && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data de Criação
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(currentParish.creation_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    )}

                    {(currentParish.phone || currentParish.email || currentParish.website) && (
                      <div>
                        <h4 className="font-medium mb-2">Contato</h4>
                        <div className="space-y-2">
                          {currentParish.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4" />
                              <a href={`tel:${currentParish.phone}`} className="text-primary hover:underline">
                                {currentParish.phone}
                              </a>
                            </div>
                          )}
                          {currentParish.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4" />
                              <a href={`mailto:${currentParish.email}`} className="text-primary hover:underline">
                                {currentParish.email}
                              </a>
                            </div>
                          )}
                          {currentParish.website && (
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4" />
                              <a 
                                href={currentParish.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Site da Paróquia
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Página de listagem de paróquias
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
          <h1 className="text-4xl font-bold text-primary mb-4">Diretório de Paróquias</h1>
          <p className="text-muted-foreground">
            Conheça as paróquias da Diocese de São Miguel Paulista
          </p>
        </div>

        {parishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma paróquia encontrada.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {parishes.map((parish) => (
                <Card key={parish.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    {parish.image_url ? (
                      <img 
                        src={parish.image_url} 
                        alt={parish.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                        <MapPin className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="mb-3">
                      <Link 
                        to={`/diretorio/paroquias/${parish.slug}`}
                        className="hover:text-primary transition-colors line-clamp-2"
                      >
                        {parish.name}
                      </Link>
                    </CardTitle>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{parish.address}</span>
                      </div>

                      {parish.clergy && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span>
                            <Link 
                              to={`/diretorio/clero/${parish.clergy.slug}`}
                              className="text-primary hover:underline"
                            >
                              {parish.clergy.name}
                            </Link>
                          </span>
                        </div>
                      )}

                      {parish.creation_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Criada em {format(new Date(parish.creation_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center gap-2">
                      {parish.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${parish.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {parish.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${parish.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {parish.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={parish.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
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
                disabled={parishes.length < parishesPerPage}
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

export default DiretorioParoquiasPage;
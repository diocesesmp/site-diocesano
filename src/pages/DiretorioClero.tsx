import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Phone, Mail, ArrowLeft, User } from "lucide-react";

interface ClergyMember {
  id: string;
  name: string;
  slug: string;
  position: string;
  ordination_date?: string;
  motto?: string;
  parish_id?: string;
  provisioned_since?: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  bio?: string;
  parishes?: {
    name: string;
    slug: string;
  };
}

const DiretorioCleroPage = () => {
  const { slug } = useParams();
  const [clergy, setClergy] = useState<ClergyMember[]>([]);
  const [currentMember, setCurrentMember] = useState<ClergyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 12;

  useEffect(() => {
    if (slug) {
      fetchClergyMember();
    } else {
      fetchClergy();
    }
  }, [slug, currentPage]);

  const fetchClergy = async () => {
    try {
      const { data, error } = await supabase
        .from('clergy')
        .select(`
          *,
          parishes:parish_id (
            name,
            slug
          )
        `)
        .order('name')
        .range((currentPage - 1) * membersPerPage, currentPage * membersPerPage - 1);

      if (error) throw error;
      setClergy(data || []);
    } catch (error) {
      console.error('Erro ao carregar clero:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClergyMember = async () => {
    try {
      const { data, error } = await supabase
        .from('clergy')
        .select(`
          *,
          parishes:parish_id (
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setCurrentMember(data);
    } catch (error) {
      console.error('Erro ao carregar membro do clero:', error);
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

  // Página individual do membro do clero
  if (slug && currentMember) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/diretorio/clero">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Diretório
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="p-6 text-center">
                    {currentMember.photo_url ? (
                      <img
                        src={currentMember.photo_url}
                        alt={currentMember.name}
                        className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center">
                        <User className="h-24 w-24 text-muted-foreground" />
                      </div>
                    )}

                    <h1 className="text-2xl font-bold text-primary mb-2">{currentMember.name}</h1>
                    <Badge className="mb-4">{currentMember.position}</Badge>

                    {currentMember.motto && (
                      <blockquote className="italic text-muted-foreground border-l-4 border-primary pl-4 mb-4">
                        "{currentMember.motto}"
                      </blockquote>
                    )}

                    <div className="space-y-3 text-left">
                      {currentMember.ordination_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <div>
                            <span className="font-medium">Ordenação:</span>
                            <br />
                            {format(new Date(currentMember.ordination_date), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      )}

                      {currentMember.parishes && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <div>
                            <span className="font-medium">Paróquia:</span>
                            <br />
                            <Link 
                              to={`/diretorio/paroquias/${currentMember.parishes.slug}`}
                              className="text-primary hover:underline"
                            >
                              {currentMember.parishes.name}
                            </Link>
                          </div>
                        </div>
                      )}

                      {currentMember.provisioned_since && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <div>
                            <span className="font-medium">Provisionado desde:</span>
                            <br />
                            {format(new Date(currentMember.provisioned_since), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      )}

                      {currentMember.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-primary" />
                          <div>
                            <span className="font-medium">Telefone:</span>
                            <br />
                            <a href={`tel:${currentMember.phone}`} className="text-primary hover:underline">
                              {currentMember.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {currentMember.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <div>
                            <span className="font-medium">E-mail:</span>
                            <br />
                            <a href={`mailto:${currentMember.email}`} className="text-primary hover:underline">
                              {currentMember.email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Biografia</h2>
                  </CardHeader>
                  <CardContent>
                    {currentMember.bio ? (
                      <div className="prose prose-lg max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: currentMember.bio }} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Biografia não disponível.</p>
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

  // Página de listagem do clero
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
          <h1 className="text-4xl font-bold text-primary mb-4">Diretório do Clero</h1>
          <p className="text-muted-foreground">
            Conheça os sacerdotes e diáconos que servem na Diocese de São Miguel Paulista
          </p>
        </div>

        {clergy.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum membro do clero encontrado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {clergy.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}

                    <h3 className="font-bold text-lg mb-2">
                      <Link 
                        to={`/diretorio/clero/${member.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {member.name}
                      </Link>
                    </h3>

                    <Badge variant="outline" className="mb-3">{member.position}</Badge>

                    {member.parishes && (
                      <p className="text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {member.parishes.name}
                      </p>
                    )}

                    {member.ordination_date && (
                      <p className="text-xs text-muted-foreground">
                        Ordenado em {format(new Date(member.ordination_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}

                    <div className="flex justify-center gap-2 mt-4">
                      {member.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${member.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {member.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${member.email}`}>
                            <Mail className="h-4 w-4" />
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
                disabled={clergy.length < membersPerPage}
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

export default DiretorioCleroPage;
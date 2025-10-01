import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Phone, Mail, ArrowLeft, User, Users } from "lucide-react";

interface GovernmentMember {
  id: string;
  name: string;
  slug: string;
  position: string;
  ordination_date?: string;
  motto?: string;
  parish_id?: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  bio?: string;
  parishes?: {
    name: string;
    slug: string;
  };
}

const GovernoDiocesePage = () => {
  const [governmentMembers, setGovernmentMembers] = useState<GovernmentMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGovernmentMembers();
  }, []);

  const fetchGovernmentMembers = async () => {
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
        .eq('is_government', true)
        .order('government_order', { ascending: true });

      if (error) throw error;
      setGovernmentMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar governo da diocese:', error);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Governo da Diocese</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça os membros que compõem o governo diocesano e auxiliam nosso Bispo 
              na administração pastoral da Diocese de São Miguel Paulista
            </p>
          </div>

          {governmentMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum membro do governo diocesano cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {governmentMembers.map((member) => (
                <Card key={member.id} className="shadow-soft hover:shadow-medium transition-smooth group">
                  <CardContent className="p-6 text-center">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-medium group-hover:scale-105 transition-smooth"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center group-hover:scale-105 transition-smooth">
                        <User className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-smooth">
                      <Link 
                        to={`/diretorio/clero/${member.slug}`}
                        className="hover:text-accent transition-colors"
                      >
                        {member.name}
                      </Link>
                    </h3>

                    <Badge className="mb-4 text-sm px-3 py-1">{member.position}</Badge>

                    {member.motto && (
                      <blockquote className="italic text-muted-foreground text-sm mb-4 border-l-2 border-accent pl-3">
                        "{member.motto}"
                      </blockquote>
                    )}

                    {member.parishes && (
                      <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <Link 
                          to={`/diretorio/paroquias/${member.parishes.slug}`}
                          className="text-primary hover:underline"
                        >
                          {member.parishes.name}
                        </Link>
                      </p>
                    )}

                    {member.ordination_date && (
                      <p className="text-xs text-muted-foreground mb-4 flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ordenado em {format(new Date(member.ordination_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}

                    <div className="flex justify-center gap-2">
                      {member.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${member.phone}`} title="Telefone">
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {member.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${member.email}`} title="E-mail">
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="mt-4">
                      <Button variant="ghost" size="sm" asChild className="w-full">
                        <Link to={`/diretorio/clero/${member.slug}`}>
                          Ver Mais Detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GovernoDiocesePage;
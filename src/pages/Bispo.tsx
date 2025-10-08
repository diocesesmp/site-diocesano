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
import { Calendar, Mail, Phone, ArrowLeft, User, Heart, BookOpen } from "lucide-react";

interface Bishop {
  id: string;
  name: string;
  title: string;
  motto?: string;
  ordination_date?: string;
  episcopal_ordination_date?: string;
  appointment_date?: string;
  photo_url?: string;
  bio?: string;
  pastoral_letter?: string;
  phone?: string;
  email?: string;
}

const BispoPage = () => {
  const [bishop, setBishop] = useState<Bishop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBishop();
  }, []);

  const fetchBishop = async () => {
    try {
      const { data, error } = await supabase
        .from('bishop')
        .select('*')
        .single();

      if (error) throw error;
      setBishop(data);
    } catch (error) {
      console.error('Erro ao carregar dados do bispo:', error);
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

  if (!bishop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Informações do bispo não encontradas.</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna da esquerda - Foto e informações básicas */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6 text-center">
                  {bishop.photo_url ? (
                    <img
                      src={bishop.photo_url}
                      alt={bishop.name}
                      className="w-64 h-64 rounded-lg mx-auto mb-6 object-cover shadow-medium"
                    />
                  ) : (
                    <div className="w-64 h-64 rounded-lg mx-auto mb-6 bg-muted flex items-center justify-center">
                      <User className="h-32 w-32 text-muted-foreground" />
                    </div>
                  )}

                  <h1 className="text-3xl font-bold text-primary mb-2">{bishop.name}</h1>
                  <Badge className="mb-4 text-base px-4 py-2">{bishop.title}</Badge>

                  {bishop.motto && (
                    <blockquote className="italic text-muted-foreground border-l-4 border-accent pl-4 mb-6 text-lg">
                      "{bishop.motto}"
                    </blockquote>
                  )}

                  <div className="space-y-4 text-left">
                    {bishop.ordination_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-medium block">Ordenação Sacerdotal:</span>
                          <span className="text-muted-foreground">
                            {format(new Date(bishop.ordination_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    )}

                    {bishop.episcopal_ordination_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-medium block">Ordenação Episcopal:</span>
                          <span className="text-muted-foreground">
                            {format(new Date(bishop.episcopal_ordination_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    )}

                    {bishop.appointment_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-medium block">Nomeação para a Diocese:</span>
                          <span className="text-muted-foreground">
                            {format(new Date(bishop.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    )}

                    {bishop.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-medium block">Telefone:</span>
                          <a href={`tel:${bishop.phone}`} className="text-primary hover:underline">
                            {bishop.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {bishop.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-medium block">E-mail:</span>
                          <a href={`mailto:${bishop.email}`} className="text-primary hover:underline">
                            {bishop.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna da direita - Biografia e carta pastoral */}
            <div className="lg:col-span-2 space-y-8">
              {/* Biografia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Biografia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bishop.bio ? (
                    <div className="prose prose-lg max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: bishop.bio }} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Biografia não disponível.</p>
                  )}
                </CardContent>
              </Card>

              {/* Carta Pastoral */}
              {bishop.pastoral_letter && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6" />
                      Carta Pastoral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: bishop.pastoral_letter }} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mensagem de Boas-vindas */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Paz e Bem a todos!
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Como Pastor desta querida Diocese, convido a todos para caminharmos juntos 
                    na fé, construindo uma comunidade de amor, esperança e solidariedade.
                  </p>
                  <div className="mt-6">
                    <p className="font-medium text-primary">+ {bishop.name}</p>
                    <p className="text-sm text-muted-foreground">{bishop.title}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BispoPage;
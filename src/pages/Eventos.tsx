import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  end_date?: string;
  location: string;
  status: 'confirmado' | 'cancelado' | 'adiado';
  featured_image_url?: string;
  is_featured: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmado': return 'bg-green-100 text-green-800';
    case 'cancelado': return 'bg-red-100 text-red-800';
    case 'adiado': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmado': return 'Confirmado';
    case 'cancelado': return 'Cancelado';
    case 'adiado': return 'Adiado';
    default: return status;
  }
};

const EventosPage = () => {
  const { slug } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  useEffect(() => {
    if (slug) {
      fetchEvent();
    } else {
      fetchEvents();
    }
  }, [slug, currentPage]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .range((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage - 1);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setCurrentEvent(data);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && currentEvent) {
      try {
        await navigator.share({
          title: currentEvent.title,
          text: currentEvent.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
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

  // Página individual do evento
  if (slug && currentEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/eventos">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Eventos
                </Button>
              </Link>
            </div>

            <article>
              <header className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-primary flex-1">{currentEvent.title}</h1>
                  <Badge className={getStatusColor(currentEvent.status)}>
                    {getStatusText(currentEvent.status)}
                  </Badge>
                </div>

                {currentEvent.featured_image_url && (
                  <img 
                    src={currentEvent.featured_image_url} 
                    alt={currentEvent.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Data e Hora</p>
                      <p>{format(new Date(currentEvent.event_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                      {currentEvent.end_date && (
                        <p className="text-sm">
                          até {format(new Date(currentEvent.end_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Local</p>
                      <p>{currentEvent.location}</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar Evento
                </Button>
              </header>

              <div className="prose prose-lg max-w-none">
                <h2>Descrição</h2>
                <div dangerouslySetInnerHTML={{ __html: currentEvent.description }} />
              </div>
            </article>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Página de listagem de eventos
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
          <h1 className="text-4xl font-bold text-primary mb-4">Eventos</h1>
          <p className="text-muted-foreground">Participe das atividades e celebrações da Diocese</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum evento encontrado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    {event.featured_image_url && (
                      <img 
                        src={event.featured_image_url} 
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <CardTitle className="flex-1 line-clamp-2">
                        <Link 
                          to={`/eventos/${event.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {event.title}
                        </Link>
                      </CardTitle>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusText(event.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.event_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(event.event_date), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {event.description?.replace(/<[^>]*>/g, '') || ''}
                    </p>
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
                disabled={events.length < eventsPerPage}
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

export default EventosPage;
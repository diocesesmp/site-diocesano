import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, description, event_date, end_date, location, status, featured_image_url')
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(4);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Próximos Eventos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Participe dos eventos e celebrações que fortalecem nossa comunidade de fé.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Próximos Eventos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Participe dos eventos e celebrações que fortalecem nossa comunidade de fé.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum evento programado no momento.</p>
            <Button variant="outline" asChild>
              <Link to="/eventos">Ver Todos os Eventos</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {events.map((event) => (
                <Card key={event.id} className="shadow-soft hover:shadow-medium transition-smooth group">
                  <CardHeader className="border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-accent transition-smooth line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(event.event_date), "dd/MM/yyyy", { locale: ptBR })}
                          <Clock className="h-4 w-4 ml-4 mr-2" />
                          {format(new Date(event.event_date), "HH:mm", { locale: ptBR })}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                      >
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {event.description?.replace(/<[^>]*>/g, '') || ''}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/eventos/${event.slug}`}>
                        Mais Informações
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="default" size="lg" asChild>
                <Link to="/eventos">
                  Ver Agenda Completa
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
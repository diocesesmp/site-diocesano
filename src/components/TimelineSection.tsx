import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url?: string;
  order_position: number;
}

const TimelineSection = () => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setTimelineEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar linha do tempo:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEventDetails = (event: TimelineEvent, index: number) => {
    setSelectedEvent(event);
    setCurrentIndex(index);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  const nextEvent = () => {
    const newIndex = (currentIndex + 1) % timelineEvents.length;
    setCurrentIndex(newIndex);
    setSelectedEvent(timelineEvents[newIndex]);
  };

  const prevEvent = () => {
    const newIndex = currentIndex === 0 ? timelineEvents.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedEvent(timelineEvents[newIndex]);
  };

  // Não renderizar se não houver eventos ou estiver carregando
  if (loading || timelineEvents.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Nossa História
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Momentos marcantes na trajetória da Diocese de São Miguel Paulista
          </p>
        </div>

        {/* Timeline Carousel */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {timelineEvents.map((event, index) => (
              <Card 
                key={event.id} 
                className="flex-shrink-0 w-48 shadow-soft hover:shadow-medium transition-smooth cursor-pointer group"
                onClick={() => openEventDetails(event, index)}
              >
                <CardContent className="p-4 text-center">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover shadow-medium group-hover:scale-105 transition-smooth"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-smooth">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-sm text-primary mb-2 line-clamp-2 group-hover:text-accent transition-smooth">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(event.event_date), "yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Event Details Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={() => closeEventDetails()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-left">{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-6">
                {selectedEvent.image_url && (
                  <div className="text-center">
                    <img
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title}
                      className="w-32 h-32 rounded-full mx-auto object-cover shadow-medium"
                    />
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedEvent.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedEvent.description }} />
                </div>

                {timelineEvents.length > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={prevEvent}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} de {timelineEvents.length}
                    </span>
                    
                    <Button
                      variant="outline"
                      onClick={nextEvent}
                      className="flex items-center gap-2"
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default TimelineSection;
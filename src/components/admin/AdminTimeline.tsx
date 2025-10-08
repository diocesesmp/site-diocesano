import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, CreditCard as Edit, Trash2, Eye, Calendar, Clock, ArrowUp, ArrowDown } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url?: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
}

const AdminTimeline = () => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    image_url: '',
    order_position: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setTimelineEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos da linha do tempo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos da linha do tempo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        image_url: formData.image_url || null,
        order_position: formData.order_position ? parseInt(formData.order_position) : 0,
        is_active: formData.is_active
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('timeline_events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Evento da linha do tempo atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('timeline_events')
          .insert([eventData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Evento da linha do tempo criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTimelineEvents();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar evento da linha do tempo.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_date: format(new Date(event.event_date), "yyyy-MM-dd"),
      image_url: event.image_url || '',
      order_position: event.order_position.toString(),
      is_active: event.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Evento da linha do tempo excluído com sucesso!",
      });
      
      fetchTimelineEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir evento da linha do tempo.",
        variant: "destructive",
      });
    }
  };

  const moveEvent = async (eventId: string, direction: 'up' | 'down') => {
    const currentIndex = timelineEvents.findIndex(e => e.id === eventId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= timelineEvents.length) return;

    try {
      const currentEvent = timelineEvents[currentIndex];
      const targetEvent = timelineEvents[newIndex];

      // Trocar as posições
      await supabase
        .from('timeline_events')
        .update({ order_position: targetEvent.order_position })
        .eq('id', currentEvent.id);

      await supabase
        .from('timeline_events')
        .update({ order_position: currentEvent.order_position })
        .eq('id', targetEvent.id);

      fetchTimelineEvents();
    } catch (error) {
      console.error('Erro ao reordenar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao reordenar evento.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      image_url: '',
      order_position: '',
      is_active: true
    });
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Linha do Tempo da Diocese
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento Histórico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Editar Evento Histórico' : 'Novo Evento Histórico'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título do Evento</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Criação da Diocese"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_date">Data do Evento</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição Completa</Label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={(description) => setFormData({...formData, description})}
                    placeholder="Descreva o evento histórico em detalhes..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Imagem do Evento</Label>
                  <ImageUpload
                    onUpload={(urls) => setFormData({...formData, image_url: urls[0] || ''})}
                    multiple={false}
                    folder="diocese/timeline"
                  />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-full"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order_position">Posição na Linha do Tempo</Label>
                    <Input
                      id="order_position"
                      type="number"
                      min="0"
                      value={formData.order_position}
                      onChange={(e) => setFormData({...formData, order_position: e.target.value})}
                      placeholder="0 = primeiro"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active">Ativo (visível no site)</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingEvent ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timelineEvents.map((event, index) => (
              <TableRow key={event.id}>
                <TableCell>
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(event.event_date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell>
                  {event.is_active ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="outline">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{event.order_position}</span>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveEvent(event.id, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveEvent(event.id, 'down')}
                        disabled={index === timelineEvents.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este evento histórico? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(event.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {timelineEvents.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum evento histórico encontrado.</p>
            <p className="text-sm text-muted-foreground">
              Adicione eventos para criar a linha do tempo da diocese.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTimeline;
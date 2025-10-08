import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Edit, Trash2, Eye, Calendar, Camera, Image as ImageIcon } from "lucide-react";

interface Photo {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  event_id?: string;
  album_name?: string;
  taken_date?: string;
  photographer?: string;
  created_at: string;
  events?: {
    title: string;
  };
}

interface Event {
  id: string;
  title: string;
}

const AdminPhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_urls: [] as string[],
    event_id: '__none__',
    album_name: '',
    taken_date: '',
    photographer: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotos();
    fetchEvents();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          events:event_id (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar fotos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.image_urls.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma imagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPhoto) {
        // Editar foto existente
        const photoData = {
          title: formData.title,
          description: formData.description || null,
          image_url: formData.image_urls[0], // Para edição, usa apenas a primeira imagem
          thumbnail_url: formData.image_urls[0],
          event_id: formData.event_id === '__none__' ? null : formData.event_id,
          album_name: formData.album_name || null,
          taken_date: formData.taken_date || null,
          photographer: formData.photographer || null
        };

        const { error } = await supabase
          .from('photos')
          .update(photoData)
          .eq('id', editingPhoto.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Foto atualizada com sucesso!",
        });
      } else {
        // Adicionar novas fotos (múltiplas)
        const photosData = formData.image_urls.map((url, index) => ({
          title: formData.image_urls.length > 1 ? `${formData.title} - ${index + 1}` : formData.title,
          description: formData.description || null,
          image_url: url,
          thumbnail_url: url,
          event_id: formData.event_id === '__none__' ? null : formData.event_id,
          album_name: formData.album_name || null,
          taken_date: formData.taken_date || null,
          photographer: formData.photographer || null
        }));

        const { error } = await supabase
          .from('photos')
          .insert(photosData);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: `${formData.image_urls.length} foto(s) adicionada(s) com sucesso!`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPhotos();
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar foto(s).",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || '',
      image_urls: [photo.image_url],
      event_id: photo.event_id || '__none__',
      album_name: photo.album_name || '',
      taken_date: photo.taken_date ? format(new Date(photo.taken_date), "yyyy-MM-dd") : '',
      photographer: photo.photographer || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Foto excluída com sucesso!",
      });
      
      fetchPhotos();
    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir foto.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_urls: [],
      event_id: '__none__',
      album_name: '',
      taken_date: '',
      photographer: ''
    });
    setEditingPhoto(null);
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
          <CardTitle>Gerenciar Galeria de Fotos</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                {editingPhoto ? 'Editar Foto' : 'Adicionar Fotos'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPhoto ? 'Editar Foto' : 'Adicionar Fotos à Galeria'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Título da foto ou álbum"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="album_name">Nome do Álbum</Label>
                    <Input
                      id="album_name"
                      value={formData.album_name}
                      onChange={(e) => setFormData({...formData, album_name: e.target.value})}
                      placeholder="Ex: Festa Junina 2024"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Descrição da foto ou evento..."
                  />
                </div>

                <div>
                  <Label>Imagens</Label>
                  <ImageUpload
                    onUpload={(urls) => setFormData({...formData, image_urls: urls})}
                    multiple={!editingPhoto} // Múltiplo apenas para novas fotos
                    folder="diocese/galeria"
                    maxFiles={20}
                  />
                  {formData.image_urls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {formData.image_urls.length} imagem(ns) selecionada(s)
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {formData.image_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_id">Evento Associado</Label>
                    <Select value={formData.event_id} onValueChange={(value) => setFormData({...formData, event_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar evento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhum evento</SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taken_date">Data da Foto</Label>
                    <Input
                      id="taken_date"
                      type="date"
                      value={formData.taken_date}
                      onChange={(e) => setFormData({...formData, taken_date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="photographer">Fotógrafo</Label>
                  <Input
                    id="photographer"
                    value={formData.photographer}
                    onChange={(e) => setFormData({...formData, photographer: e.target.value})}
                    placeholder="Nome do fotógrafo"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPhoto ? 'Atualizar' : 'Adicionar'}
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
              <TableHead>Álbum</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {photos.map((photo) => (
              <TableRow key={photo.id}>
                <TableCell>
                  <img
                    src={photo.thumbnail_url || photo.image_url}
                    alt={photo.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{photo.title}</p>
                    {photo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {photo.album_name && (
                    <span className="text-sm bg-muted px-2 py-1 rounded">
                      {photo.album_name}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {photo.events?.title && (
                    <span className="text-sm">{photo.events.title}</span>
                  )}
                </TableCell>
                <TableCell>
                  {photo.taken_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(photo.taken_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={photo.image_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(photo)}>
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
                            Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(photo.id)}>
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

        {photos.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma foto encontrada.</p>
            <p className="text-sm text-muted-foreground">
              Adicione fotos para criar álbuns e galerias.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPhotos;
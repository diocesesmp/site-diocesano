import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Edit, Trash2, Eye, Calendar, FileText, Play, Volume2 } from "lucide-react";

interface PastorMessage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  content_type: 'texto' | 'video' | 'audio';
  media_url?: string;
  thumbnail_url?: string;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
}

const AdminPastorMessages = () => {
  const [messages, setMessages] = useState<PastorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<PastorMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    content: string;
    content_type: 'texto' | 'video' | 'audio';
    media_url: string;
    thumbnail_url: string;
    is_featured: boolean;
    published_at: string;
  }>({
    title: '',
    slug: '',
    content: '',
    content_type: 'texto',
    media_url: '',
    thumbnail_url: '',
    is_featured: false,
    published_at: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('pastor_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const messageData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content || null,
        media_url: formData.media_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        published_at: formData.published_at || null
      };

      if (editingMessage) {
        const { error } = await supabase
          .from('pastor_messages')
          .update(messageData)
          .eq('id', editingMessage.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Mensagem atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('pastor_messages')
          .insert([messageData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Mensagem criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMessages();
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (message: PastorMessage) => {
    setEditingMessage(message);
    setFormData({
      title: message.title,
      slug: message.slug,
      content: message.content || '',
      content_type: message.content_type as 'texto' | 'video' | 'audio',
      media_url: message.media_url || '',
      thumbnail_url: message.thumbnail_url || '',
      is_featured: message.is_featured,
      published_at: message.published_at ? format(new Date(message.published_at), "yyyy-MM-dd'T'HH:mm") : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pastor_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Mensagem excluída com sucesso!",
      });
      
      fetchMessages();
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir mensagem.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      content_type: 'texto',
      media_url: '',
      thumbnail_url: '',
      is_featured: false,
      published_at: ''
    });
    setEditingMessage(null);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'audio': return Volume2;
      default: return FileText;
    }
  };

  const getContentTypeText = (type: string) => {
    switch (type) {
      case 'video': return 'Vídeo';
      case 'audio': return 'Áudio';
      default: return 'Texto';
    }
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
          <CardTitle>Gerenciar Mensagens do Pastor</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMessage ? 'Editar Mensagem' : 'Nova Mensagem'}
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
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="Gerado automaticamente se vazio"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content_type">Tipo de Conteúdo</Label>
                  <Select value={formData.content_type} onValueChange={(value: any) => setFormData({...formData, content_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="texto">Texto</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="thumbnail_url">Imagem de Destaque</Label>
                  <ImageUpload
                    onUpload={(urls) => setFormData({...formData, thumbnail_url: urls[0] || ''})}
                    multiple={false}
                    folder="diocese/mensagens/thumbnails"
                  />
                  {formData.thumbnail_url && (
                    <div className="mt-2">
                      <img
                        src={formData.thumbnail_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {(formData.content_type !== 'texto') && (
                  <div>
                    <Label htmlFor="media_url">URL do {formData.content_type === 'video' ? 'Vídeo' : 'Áudio'}</Label>
                    <Input
                      id="media_url"
                      value={formData.media_url}
                      onChange={(e) => setFormData({...formData, media_url: e.target.value})}
                      placeholder={`URL do ${formData.content_type === 'video' ? 'vídeo (YouTube, Vimeo, etc.)' : 'áudio'}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.content_type === 'video' 
                        ? 'Cole a URL do vídeo do YouTube, Vimeo ou outro serviço'
                        : 'Cole a URL do arquivo de áudio hospedado'
                      }
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="content">Conteúdo (Texto)</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({...formData, content})}
                    placeholder="Conteúdo da mensagem..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="published_at">Data de Publicação</Label>
                  <Input
                    id="published_at"
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={(e) => setFormData({...formData, published_at: e.target.value})}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                  <Label htmlFor="is_featured">Mensagem em destaque</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingMessage ? 'Atualizar' : 'Criar'}
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
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => {
              const ContentIcon = getContentTypeIcon(message.content_type);
              return (
                <TableRow key={message.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{message.title}</p>
                      {message.is_featured && (
                        <Badge variant="secondary" className="mt-1">Destaque</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ContentIcon className="h-4 w-4" />
                      <span>{getContentTypeText(message.content_type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {message.published_at ? (
                      <Badge variant="default">Publicado</Badge>
                    ) : (
                      <Badge variant="outline">Rascunho</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(message.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {message.published_at && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/mensagens-do-pastor/${message.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(message)}>
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
                              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(message.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminPastorMessages;
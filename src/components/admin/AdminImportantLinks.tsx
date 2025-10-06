import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard as Edit, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ImportantLink {
  id: string;
  title: string;
  url: string;
  icon_url?: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
}

const AdminImportantLinks = () => {
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ImportantLink | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon_url: '',
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('important_links')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;

      setLinks(data || []);
    } catch (error) {
      console.error('Erro ao carregar links:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar links importantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const linkData = {
        title: formData.title,
        url: formData.url,
        icon_url: formData.icon_url || null,
        is_active: formData.is_active,
        order_position: editingLink ? editingLink.order_position : links.length,
      };

      if (editingLink) {
        const { error } = await (supabase as any)
          .from('important_links')
          .update(linkData)
          .eq('id', editingLink.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Link atualizado com sucesso!",
        });
      } else {
        const { error } = await (supabase as any)
          .from('important_links')
          .insert([linkData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Link criado com sucesso!",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchLinks();
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar link.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (link: ImportantLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      icon_url: link.icon_url || '',
      is_active: link.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('important_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Link excluído com sucesso!",
      });

      fetchLinks();
    } catch (error) {
      console.error('Erro ao excluir link:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir link.",
        variant: "destructive",
      });
    }
  };

  const updateOrder = async (id: string, newPosition: number) => {
    try {
      const { error } = await (supabase as any)
        .from('important_links')
        .update({ order_position: newPosition })
        .eq('id', id);

      if (error) throw error;

      fetchLinks();
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index - 1]] = [newLinks[index - 1], newLinks[index]];
    newLinks.forEach((link, i) => updateOrder(link.id, i));
  };

  const moveDown = (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    newLinks.forEach((link, i) => updateOrder(link.id, i));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      icon_url: '',
      is_active: true,
    });
    setEditingLink(null);
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
          <CardTitle>Links Importantes</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingLink ? 'Editar Link' : 'Novo Link Importante'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Portal da Diocese"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://exemplo.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="icon_url">Ícone do Link</Label>
                  <ImageUpload
                    onUpload={(urls) => setFormData({...formData, icon_url: urls[0]})}
                    multiple={false}
                    folder="diocese/important-links"
                    className="mt-2"
                  />
                  {formData.icon_url && (
                    <img src={formData.icon_url} alt="Ícone" className="mt-2 h-16 w-16 object-contain" />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Link ativo</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingLink ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum link importante cadastrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ordem</TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link, index) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="flex flex-col items-center space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDown(index)}
                        disabled={index === links.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        ↓
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {link.icon_url ? (
                      <img src={link.icon_url} alt={link.title} className="h-10 w-10 object-contain" />
                    ) : (
                      <ExternalLink className="h-10 w-10 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                      {link.url.substring(0, 40)}...
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${link.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {link.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(link)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o link "{link.title}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(link.id)}>
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
        )}
      </CardContent>
    </Card>
  );
};

export default AdminImportantLinks;

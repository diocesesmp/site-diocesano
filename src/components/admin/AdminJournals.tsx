import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Edit, Trash2, Eye, Calendar, Download } from "lucide-react";

interface Journal {
  id: string;
  title: string;
  edition_number?: number;
  publication_date: string;
  pdf_url: string;
  cover_image_url?: string;
  description?: string;
  created_at: string;
}

const AdminJournals = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    edition_number: '',
    publication_date: '',
    pdf_url: '',
    cover_image_url: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setJournals(data || []);
    } catch (error) {
      console.error('Erro ao carregar jornais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar jornais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const journalData = {
        title: formData.title,
        edition_number: formData.edition_number ? parseInt(formData.edition_number) : null,
        publication_date: formData.publication_date,
        pdf_url: formData.pdf_url,
        cover_image_url: formData.cover_image_url || null,
        description: formData.description || null
      };

      if (editingJournal) {
        const { error } = await supabase
          .from('journals')
          .update(journalData)
          .eq('id', editingJournal.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Jornal atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('journals')
          .insert([journalData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Jornal criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchJournals();
    } catch (error) {
      console.error('Erro ao salvar jornal:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar jornal.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (journal: Journal) => {
    setEditingJournal(journal);
    setFormData({
      title: journal.title,
      edition_number: journal.edition_number?.toString() || '',
      publication_date: format(new Date(journal.publication_date), "yyyy-MM-dd"),
      pdf_url: journal.pdf_url,
      cover_image_url: journal.cover_image_url || '',
      description: journal.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Jornal excluído com sucesso!",
      });
      
      fetchJournals();
    } catch (error) {
      console.error('Erro ao excluir jornal:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir jornal.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      edition_number: '',
      publication_date: '',
      pdf_url: '',
      cover_image_url: '',
      description: ''
    });
    setEditingJournal(null);
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
          <CardTitle>Gerenciar Jornal da Diocese</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Edição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingJournal ? 'Editar Edição' : 'Nova Edição'}
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
                    <Label htmlFor="edition_number">Número da Edição</Label>
                    <Input
                      id="edition_number"
                      type="number"
                      value={formData.edition_number}
                      onChange={(e) => setFormData({...formData, edition_number: e.target.value})}
                      placeholder="Ex: 123"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="publication_date">Data de Publicação</Label>
                  <Input
                    id="publication_date"
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) => setFormData({...formData, publication_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pdf_url">Upload do PDF</Label>
                  <Input
                    id="pdf_url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({...formData, pdf_url: e.target.value})}
                    placeholder="https://exemplo.com/jornal.pdf"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cover_image_url">URL da Capa</Label>
                  <Input
                    id="cover_image_url"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Breve descrição da edição..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingJournal ? 'Atualizar' : 'Criar'}
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
              <TableHead>Edição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journals.map((journal) => (
              <TableRow key={journal.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{journal.title}</p>
                    {journal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {journal.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {journal.edition_number && (
                    <Badge variant="outline">Nº {journal.edition_number}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(journal.publication_date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={journal.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={journal.pdf_url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(journal)}>
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
                            Tem certeza que deseja excluir esta edição? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(journal.id)}>
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
      </CardContent>
    </Card>
  );
};

export default AdminJournals;
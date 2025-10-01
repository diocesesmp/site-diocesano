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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Phone, Mail, Globe } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface Parish {
  id: string;
  name: string;
  slug: string;
  address: string;
  parish_priest_id?: string;
  creation_date?: string;
  mass_schedule?: string;
  service_hours?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  clergy?: {
    name: string;
  };
}

interface ClergyMember {
  id: string;
  name: string;
}

const AdminParishes = () => {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [clergy, setClergy] = useState<ClergyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParish, setEditingParish] = useState<Parish | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    parish_priest_id: '__none__',
    creation_date: '',
    mass_schedule: '',
    service_hours: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchParishes();
    fetchClergy();
  }, []);

  const fetchParishes = async () => {
    try {
      const { data, error } = await supabase
        .from('parishes')
        .select(`
          *,
          clergy:parish_priest_id (
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setParishes(data || []);
    } catch (error) {
      console.error('Erro ao carregar paróquias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar paróquias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClergy = async () => {
    try {
      const { data, error } = await supabase
        .from('clergy')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setClergy(data || []);
    } catch (error) {
      console.error('Erro ao carregar clero:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
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
      const parishData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        address: formData.address,
        parish_priest_id: formData.parish_priest_id === '__none__' ? null : formData.parish_priest_id,
        creation_date: formData.creation_date || null,
        mass_schedule: formData.mass_schedule || null,
        service_hours: formData.service_hours || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        description: formData.description || null,
        image_url: formData.image_url || null
      };

      if (editingParish) {
        const { error } = await supabase
          .from('parishes')
          .update(parishData)
          .eq('id', editingParish.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Paróquia atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('parishes')
          .insert([parishData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Paróquia adicionada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchParishes();
    } catch (error) {
      console.error('Erro ao salvar paróquia:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar paróquia.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (parish: Parish) => {
    setEditingParish(parish);
    setFormData({
      name: parish.name,
      slug: parish.slug,
      address: parish.address,
      parish_priest_id: parish.parish_priest_id || '__none__',
      creation_date: parish.creation_date ? format(new Date(parish.creation_date), "yyyy-MM-dd") : '',
      mass_schedule: parish.mass_schedule || '',
      service_hours: parish.service_hours || '',
      phone: parish.phone || '',
      email: parish.email || '',
      website: parish.website || '',
      description: parish.description || '',
      image_url: parish.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('parishes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Paróquia excluída com sucesso!",
      });
      
      fetchParishes();
    } catch (error) {
      console.error('Erro ao excluir paróquia:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir paróquia.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      address: '',
      parish_priest_id: '__none__',
      creation_date: '',
      mass_schedule: '',
      service_hours: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      image_url: ''
    });
    setEditingParish(null);
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
          <CardTitle>Gerenciar Paróquias</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Paróquia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingParish ? 'Editar Paróquia' : 'Adicionar Paróquia'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Paróquia</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parish_priest_id">Pároco</Label>
                    <Select value={formData.parish_priest_id} onValueChange={(value) => setFormData({...formData, parish_priest_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar pároco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhum pároco</SelectItem>
                        {clergy.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="creation_date">Data de Criação</Label>
                    <Input
                      id="creation_date"
                      type="date"
                      value={formData.creation_date}
                      onChange={(e) => setFormData({...formData, creation_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mass_schedule">Horários de Missa</Label>
                    <Textarea
                      id="mass_schedule"
                      value={formData.mass_schedule}
                      onChange={(e) => setFormData({...formData, mass_schedule: e.target.value})}
                      rows={4}
                      placeholder="Ex: Segunda a Sexta: 19h&#10;Sábado: 19h&#10;Domingo: 8h, 10h, 19h"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_hours">Horários de Atendimento</Label>
                    <Textarea
                      id="service_hours"
                      value={formData.service_hours}
                      onChange={(e) => setFormData({...formData, service_hours: e.target.value})}
                      rows={4}
                      placeholder="Ex: Segunda a Sexta: 8h às 17h&#10;Sábado: 8h às 12h"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="paroquia@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image_url">Imagem da Paróquia</Label>
                  <ImageUpload
                    onUpload={(urls) => setFormData({...formData, image_url: urls[0]})}
                    multiple={false}
                    folder="diocese/paroquias"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={5}
                    placeholder="História e informações sobre a paróquia..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingParish ? 'Atualizar' : 'Adicionar'}
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
              <TableHead>Nome</TableHead>
              <TableHead>Pároco</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parishes.map((parish) => (
              <TableRow key={parish.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{parish.name}</p>
                    {parish.creation_date && (
                      <p className="text-sm text-muted-foreground">
                        Criada em {format(new Date(parish.creation_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {parish.clergy?.name && (
                    <span className="text-sm">{parish.clergy.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-1 text-sm text-muted-foreground max-w-48">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{parish.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {parish.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{parish.phone}</span>
                      </div>
                    )}
                    {parish.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{parish.email}</span>
                      </div>
                    )}
                    {parish.website && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span>Site</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/diretorio/paroquias/${parish.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(parish)}>
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
                            Tem certeza que deseja excluir esta paróquia? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(parish.id)}>
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

export default AdminParishes;
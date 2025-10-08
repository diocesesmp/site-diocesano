import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, CreditCard as Edit, Trash2, Eye, Calendar, User, Phone, Mail } from "lucide-react";

interface ClergyMember {
  id: string;
  name: string;
  slug: string;
  position: string;
  ordination_date?: string;
  motto?: string;
  parish_id?: string;
  provisioned_since?: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  bio?: string;
  created_at: string;
  is_government?: boolean;
  government_order?: number;
  parishes?: {
    name: string;
  };
}

interface Parish {
  id: string;
  name: string;
}

const AdminClergy = () => {
  const [clergy, setClergy] = useState<ClergyMember[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<ClergyMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    position: '',
    ordination_date: '',
    motto: '',
    parish_id: '__none__',
    provisioned_since: '',
    photo_url: '',
    phone: '',
    email: '',
    bio: '',
    is_government: false,
    government_order: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClergy();
    fetchParishes();
  }, []);

  const fetchClergy = async () => {
    try {
      const { data, error } = await supabase
        .from('clergy')
        .select(`
          *,
          parishes:parish_id (
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setClergy(data || []);
    } catch (error) {
      console.error('Erro ao carregar clero:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clero.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParishes = async () => {
    try {
      const { data, error } = await supabase
        .from('parishes')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setParishes(data || []);
    } catch (error) {
      console.error('Erro ao carregar paróquias:', error);
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
      const memberData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        position: formData.position,
        ordination_date: formData.ordination_date || null,
        motto: formData.motto || null,
        parish_id: formData.parish_id === '__none__' ? null : formData.parish_id,
        provisioned_since: formData.provisioned_since || null,
        photo_url: formData.photo_url || null,
        phone: formData.phone || null,
        email: formData.email || null,
        bio: formData.bio || null,
        is_government: formData.is_government,
        government_order: formData.government_order ? parseInt(formData.government_order) : null
      };

      if (editingMember) {
        const { error } = await supabase
          .from('clergy')
          .update(memberData)
          .eq('id', editingMember.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Membro do clero atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('clergy')
          .insert([memberData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Membro do clero adicionado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchClergy();
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar membro do clero.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: ClergyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      slug: member.slug,
      position: member.position,
      ordination_date: member.ordination_date ? format(new Date(member.ordination_date), "yyyy-MM-dd") : '',
      motto: member.motto || '',
      parish_id: member.parish_id || '__none__',
      provisioned_since: member.provisioned_since ? format(new Date(member.provisioned_since), "yyyy-MM-dd") : '',
      photo_url: member.photo_url || '',
      phone: member.phone || '',
      email: member.email || '',
      bio: member.bio || '',
      is_government: member.is_government || false,
      government_order: member.government_order ? member.government_order.toString() : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clergy')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Membro do clero excluído com sucesso!",
      });
      
      fetchClergy();
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir membro do clero.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      position: '',
      ordination_date: '',
      motto: '',
      parish_id: '__none__',
      provisioned_since: '',
      photo_url: '',
      phone: '',
      email: '',
      bio: '',
      is_government: false,
      government_order: ''
    });
    setEditingMember(null);
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
          <CardTitle>Gerenciar Clero</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Editar Membro do Clero' : 'Adicionar Membro do Clero'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Posição/Cargo</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="Ex: Padre, Diácono, Bispo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parish_id">Paróquia</Label>
                    <Select value={formData.parish_id} onValueChange={(value) => setFormData({...formData, parish_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar paróquia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhuma paróquia</SelectItem>
                        {parishes.map((parish) => (
                          <SelectItem key={parish.id} value={parish.id}>
                            {parish.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ordination_date">Data de Ordenação</Label>
                    <Input
                      id="ordination_date"
                      type="date"
                      value={formData.ordination_date}
                      onChange={(e) => setFormData({...formData, ordination_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="provisioned_since">Provisionado desde</Label>
                    <Input
                      id="provisioned_since"
                      type="date"
                      value={formData.provisioned_since}
                      onChange={(e) => setFormData({...formData, provisioned_since: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="motto">Lema/Motto</Label>
                  <Input
                    id="motto"
                    value={formData.motto}
                    onChange={(e) => setFormData({...formData, motto: e.target.value})}
                    placeholder="Lema pessoal ou frase inspiradora"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_government"
                      checked={formData.is_government}
                      onCheckedChange={(checked) => setFormData({...formData, is_government: checked})}
                    />
                    <Label htmlFor="is_government">Membro do Governo Diocesano</Label>
                  </div>

                  {formData.is_government && (
                    <div>
                      <Label htmlFor="government_order">Ordem no Governo (1-10)</Label>
                      <Input
                        id="government_order"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.government_order}
                        onChange={(e) => setFormData({...formData, government_order: e.target.value})}
                        placeholder="Posição na hierarquia (1 = mais alto)"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="photo_url">URL da Foto</Label>
                    <Input
                      id="photo_url"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
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
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={5}
                    placeholder="Biografia do membro do clero..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingMember ? 'Atualizar' : 'Adicionar'}
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
              <TableHead>Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Posição</TableHead>
              <TableHead>Paróquia</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clergy.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.photo_url} alt={member.name} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    {member.ordination_date && (
                      <p className="text-sm text-muted-foreground">
                        Ordenado em {format(new Date(member.ordination_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{member.position}</span>
                </TableCell>
                <TableCell>
                  {member.parishes?.name && (
                    <span className="text-sm">{member.parishes.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {member.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/diretorio/clero/${member.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
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
                            Tem certeza que deseja excluir este membro do clero? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(member.id)}>
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

export default AdminClergy;
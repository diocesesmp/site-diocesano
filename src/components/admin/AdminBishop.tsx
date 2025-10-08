import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload"; // Apenas uma importação
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Save, User, Crown } from "lucide-react";

interface Bishop {
  id: string;
  name: string;
  slug: string;
  title: string;
  motto?: string;
  ordination_date?: string;
  episcopal_ordination_date?: string;
  appointment_date?: string;
  photo_url?: string;
  bio?: string;
  pastoral_letter?: string;
  phone?: string;
  email?: string;
}

const AdminBishop = () => {
  const [bishop, setBishop] = useState<Bishop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    title: '',
    motto: '',
    ordination_date: '',
    episcopal_ordination_date: '',
    appointment_date: '',
    photo: '',
    bio: '',
    pastoral_letter: '',
    phone: '',
    email: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBishop();
  }, []);

  const fetchBishop = async () => {
    try {
      const { data, error } = await supabase
        .from('bishop')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBishop(data);
        setFormData({
          name: data.name,
          slug: data.slug,
          title: data.title,
          motto: data.motto || '',
          ordination_date: data.ordination_date ? format(new Date(data.ordination_date), "yyyy-MM-dd") : '',
          episcopal_ordination_date: data.episcopal_ordination_date ? format(new Date(data.episcopal_ordination_date), "yyyy-MM-dd") : '',
          appointment_date: data.appointment_date ? format(new Date(data.appointment_date), "yyyy-MM-dd") : '',
          photo: data.photo_url || '',
          bio: data.bio || '',
          pastoral_letter: data.pastoral_letter || '',
          phone: data.phone || '',
          email: data.email || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do bispo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do bispo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    setSaving(true);
    
    try {
      const bishopData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        title: formData.title,
        motto: formData.motto || null,
        ordination_date: formData.ordination_date || null,
        episcopal_ordination_date: formData.episcopal_ordination_date || null,
        appointment_date: formData.appointment_date || null,
        photo_url: formData.photo || null,
        bio: formData.bio || null,
        pastoral_letter: formData.pastoral_letter || null,
        phone: formData.phone || null,
        email: formData.email || null
      };

      if (bishop) {
        const { error } = await supabase
          .from('bishop')
          .update(bishopData)
          .eq('id', bishop.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bishop')
          .insert([bishopData]);

        if (error) throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Dados do bispo salvos com sucesso!",
      });
      
      fetchBishop();
    } catch (error) {
      console.error('Erro ao salvar dados do bispo:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados do bispo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Gerenciar Dados do Bispo
          </CardTitle>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Prévia</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.photo} alt={formData.name} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-lg">{formData.name || 'Nome do Bispo'}</h4>
                <p className="text-muted-foreground">{formData.title || 'Título'}</p>
                {formData.motto && (
                  <p className="italic text-sm">"{formData.motto}"</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="Gerado automaticamente se vazio"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="title">Título Episcopal</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Bispo Diocesano"
                  required
                />
              </div>
              <div>
                <Label htmlFor="motto">Lema Episcopal</Label>
                <Input
                  id="motto"
                  value={formData.motto}
                  onChange={(e) => setFormData({...formData, motto: e.target.value})}
                  placeholder="Lema ou frase inspiradora"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Foto Oficial</Label>
              <ImageUpload
                onUpload={(urls) => setFormData({...formData, photo: urls[0]})}
                multiple={false}
                folder="diocese/bispo"
              />
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Datas Importantes */}
          <div>
            <h3 className="text-lg font-medium mb-4">Datas Importantes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ordination_date">Ordenação Sacerdotal</Label>
                <Input
                  id="ordination_date"
                  type="date"
                  value={formData.ordination_date}
                  onChange={(e) => setFormData({...formData, ordination_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="episcopal_ordination_date">Ordenação Episcopal</Label>
                <Input
                  id="episcopal_ordination_date"
                  type="date"
                  value={formData.episcopal_ordination_date}
                  onChange={(e) => setFormData({...formData, episcopal_ordination_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="appointment_date">Nomeação para a Diocese</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-medium mb-4">Informações de Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="bispo@diocesesaomiguel.org.br"
                />
              </div>
            </div>
          </div>

          {/* Biografia */}
          <div>
            <h3 className="text-lg font-medium mb-4">Biografia</h3>
            <RichTextEditor
              content={formData.bio}
              onChange={(bio) => setFormData({...formData, bio})}
              placeholder="Biografia completa do bispo..."
              className="mt-2"
            />
          </div>

          {/* Carta Pastoral */}
          <div>
            <h3 className="text-lg font-medium mb-4">Carta Pastoral</h3>
            <RichTextEditor
              content={formData.pastoral_letter}
              onChange={(pastoral_letter) => setFormData({...formData, pastoral_letter})}
              placeholder="Mensagem pastoral para os fiéis..."
              className="mt-2"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminBishop;
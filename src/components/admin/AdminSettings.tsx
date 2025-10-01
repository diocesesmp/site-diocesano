import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, Facebook, Instagram, Youtube, Mail } from "lucide-react";

interface SiteSettings {
  id: string;
  site_name: string;
  site_title: string;
  meta_description?: string;
  logo_url?: string;
  email_contact?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  parishes_count?: number;
  priests_count?: number;
  faithful_count?: string;
  years_count?: number;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    site_name: '',
    site_title: '',
    meta_description: '',
    logo_url: '',
    email_contact: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    parishes_count: 25,
    priests_count: 50,
    faithful_count: '1M+',
    years_count: 45
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setSettings(data[0]);
        setFormData({
          site_name: data[0].site_name,
          site_title: data[0].site_title,
          meta_description: data[0].meta_description || '',
          logo_url: data[0].logo_url || '',
          email_contact: data[0].email_contact || '',
          facebook_url: data[0].facebook_url || '',
          instagram_url: data[0].instagram_url || '',
          youtube_url: data[0].youtube_url || '',
          parishes_count: data[0].parishes_count || 25,
          priests_count: data[0].priests_count || 50,
          faithful_count: data[0].faithful_count || '1M+',
          years_count: data[0].years_count || 45
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do site.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const settingsData = {
        site_name: formData.site_name,
        site_title: formData.site_title,
        meta_description: formData.meta_description || null,
        logo_url: formData.logo_url || null,
        email_contact: formData.email_contact || null,
        facebook_url: formData.facebook_url || null,
        instagram_url: formData.instagram_url || null,
        youtube_url: formData.youtube_url || null,
        parishes_count: formData.parishes_count,
        priests_count: formData.priests_count,
        faithful_count: formData.faithful_count,
        years_count: formData.years_count
      };

      if (settings) {
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([settingsData]);

        if (error) throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
      
      fetchSettings();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
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
          <CardTitle>Configurações do Site</CardTitle>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site_name">Nome do Site</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData({...formData, site_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="site_title">Título do Site</Label>
                <Input
                  id="site_title"
                  value={formData.site_title}
                  onChange={(e) => setFormData({...formData, site_title: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="meta_description">Descrição Meta (SEO)</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                rows={3}
                placeholder="Descrição que aparece nos resultados de busca..."
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="logo_url">Logo do Site</Label>
              <ImageUpload
                onUpload={(urls) => setFormData({...formData, logo_url: urls[0]})}
                multiple={false}
                folder="diocese/logo"
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Informações de Contato */}
          <div>
            <h3 className="text-lg font-medium mb-4">Informações de Contato</h3>
            <div>
              <Label htmlFor="email_contact">E-mail de Contato</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email_contact"
                  type="email"
                  value={formData.email_contact}
                  onChange={(e) => setFormData({...formData, email_contact: e.target.value})}
                  className="pl-10"
                  placeholder="contato@diocesesaomiguel.org.br"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Redes Sociais */}
          <div>
            <h3 className="text-lg font-medium mb-4">Redes Sociais</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="facebook_url">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                    className="pl-10"
                    placeholder="https://facebook.com/diocesesaomiguel"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram_url">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                    className="pl-10"
                    placeholder="https://instagram.com/diocesesaomiguel"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="youtube_url">YouTube</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                    className="pl-10"
                    placeholder="https://youtube.com/@diocesesaomiguel"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estatísticas da Página Inicial */}
          <div>
            <h3 className="text-lg font-medium mb-4">Estatísticas da Página Inicial</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure os números que aparecem no banner da página inicial</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parishes_count">Número de Paróquias</Label>
                <Input
                  id="parishes_count"
                  type="number"
                  value={formData.parishes_count}
                  onChange={(e) => setFormData({...formData, parishes_count: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="priests_count">Número de Padres</Label>
                <Input
                  id="priests_count"
                  type="number"
                  value={formData.priests_count}
                  onChange={(e) => setFormData({...formData, priests_count: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="faithful_count">Número de Fiéis</Label>
                <Input
                  id="faithful_count"
                  value={formData.faithful_count}
                  onChange={(e) => setFormData({...formData, faithful_count: e.target.value})}
                  placeholder="Ex: 1M+, 500K+"
                />
                <p className="text-xs text-muted-foreground mt-1">Pode usar formato abreviado (1M+, 500K+, etc.)</p>
              </div>
              <div>
                <Label htmlFor="years_count">Anos de Fundação</Label>
                <Input
                  id="years_count"
                  type="number"
                  value={formData.years_count}
                  onChange={(e) => setFormData({...formData, years_count: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações do Sistema */}
          <div>
            <h3 className="text-lg font-medium mb-4">Informações do Sistema</h3>
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Versão:</span> 1.0.0
                </div>
                <div>
                  <span className="font-medium">Última atualização:</span> {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">Banco de dados:</span> Supabase
                </div>
                <div>
                  <span className="font-medium">Hospedagem:</span> Bolt
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
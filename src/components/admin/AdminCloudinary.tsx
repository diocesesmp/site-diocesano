import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Cloud, Settings, Key, Folder } from "lucide-react";

interface CloudinarySettings {
  id?: string;
  cloud_name: string;
  api_key: string;
  api_secret: string;
  upload_preset: string;
  folder_structure: string;
}

const AdminCloudinary = () => {
  const [settings, setSettings] = useState<CloudinarySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cloud_name: '',
    api_key: '',
    api_secret: '',
    upload_preset: 'diocese_preset',
    folder_structure: 'diocese/{year}/{month}'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('cloudinary_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setFormData({
          cloud_name: data.cloud_name,
          api_key: data.api_key,
          api_secret: data.api_secret,
          upload_preset: data.upload_preset,
          folder_structure: data.folder_structure
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const settingsData = {
        cloud_name: formData.cloud_name,
        api_key: formData.api_key,
        api_secret: formData.api_secret,
        upload_preset: formData.upload_preset,
        folder_structure: formData.folder_structure
      };

      if (settings) {
        const { error } = await supabase
          .from('cloudinary_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cloudinary_settings')
          .insert([settingsData]);

        if (error) throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Configurações do Cloudinary salvas com sucesso!",
      });
      
      fetchSettings();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do Cloudinary.",
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
            <Cloud className="h-5 w-5" />
            Configurações do Cloudinary
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleSubmit} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações sobre Cloudinary */}
          <Alert>
            <Cloud className="h-4 w-4" />
            <AlertDescription>
              O Cloudinary é um serviço de gerenciamento de imagens na nuvem. Configure suas credenciais 
              para habilitar upload automático de imagens. 
              <a 
                href="https://cloudinary.com/console" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Acesse seu painel do Cloudinary
              </a>
            </AlertDescription>
          </Alert>

          {/* Credenciais */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Credenciais da API
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cloud_name">Cloud Name *</Label>
                <Input
                  id="cloud_name"
                  value={formData.cloud_name}
                  onChange={(e) => setFormData({...formData, cloud_name: e.target.value})}
                  placeholder="seu-cloud-name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="api_key">API Key *</Label>
                <Input
                  id="api_key"
                  value={formData.api_key}
                  onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                  placeholder="123456789012345"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="api_secret">API Secret *</Label>
              <Input
                id="api_secret"
                type="password"
                value={formData.api_secret}
                onChange={(e) => setFormData({...formData, api_secret: e.target.value})}
                placeholder="••••••••••••••••••••••••••••••"
                required
              />
            </div>
          </div>

          <Separator />

          {/* Configurações de Upload */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Upload
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="upload_preset">Upload Preset</Label>
                <Input
                  id="upload_preset"
                  value={formData.upload_preset}
                  onChange={(e) => setFormData({...formData, upload_preset: e.target.value})}
                  placeholder="diocese_preset"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Preset configurado no painel do Cloudinary
                </p>
              </div>
              <div>
                <Label htmlFor="folder_structure">Estrutura de Pastas</Label>
                <Input
                  id="folder_structure"
                  value={formData.folder_structure}
                  onChange={(e) => setFormData({...formData, folder_structure: e.target.value})}
                  placeholder="diocese/{year}/{month}"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {'{year}'} e {'{month}'} para organização automática
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Instruções */}
          <div>
            <h3 className="text-lg font-medium mb-4">Como Configurar</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <p>Acesse seu <a href="https://cloudinary.com/console" target="_blank" className="text-primary hover:underline">painel do Cloudinary</a></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <p>Copie o <strong>Cloud Name</strong> e <strong>API Key</strong> do Dashboard</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <p>Gere um <strong>API Secret</strong> em Settings → Security</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <p>Crie um <strong>Upload Preset</strong> em Settings → Upload</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
                <p>Configure o preset como <strong>Unsigned</strong> para uploads diretos</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">6</span>
                <p>Adicione <strong>VITE_CLOUDINARY_CLOUD_NAME</strong> no arquivo .env</p>
              </div>
            </div>
          </div>

          {/* Status da Configuração */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Status da Configuração</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Cloud Name:</span>
                {formData.cloud_name ? (
                  <Badge variant="outline">{formData.cloud_name}</Badge>
                ) : (
                  <span className="text-muted-foreground">Não configurado</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">API Key:</span>
                {formData.api_key ? (
                  <Badge variant="outline">Configurado</Badge>
                ) : (
                  <span className="text-muted-foreground">Não configurado</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">API Secret:</span>
                {formData.api_secret ? (
                  <Badge variant="outline">Configurado</Badge>
                ) : (
                  <span className="text-muted-foreground">Não configurado</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Upload Preset:</span>
                <Badge variant="outline">{formData.upload_preset}</Badge>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminCloudinary;
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, CreditCard, CircleAlert as AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MercadoPagoSettings {
  id: string;
  mp_test_public_key?: string;
  mp_test_access_token?: string;
  mp_live_public_key?: string;
  mp_live_access_token?: string;
  mp_environment: 'test' | 'live';
}

const AdminMercadoPago = () => {
  const [settings, setSettings] = useState<MercadoPagoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    mp_test_public_key: '',
    mp_test_access_token: '',
    mp_live_public_key: '',
    mp_live_access_token: '',
    mp_environment: 'test' as 'test' | 'live'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('mercadopago_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const environment = (data.mp_environment === 'live' ? 'live' : 'test') as 'test' | 'live';
        setSettings({
          ...data,
          mp_environment: environment
        });
        setFormData({
          mp_test_public_key: data.mp_test_public_key || '',
          mp_test_access_token: data.mp_test_access_token || '',
          mp_live_public_key: data.mp_live_public_key || '',
          mp_live_access_token: data.mp_live_access_token || '',
          mp_environment: environment
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do Mercado Pago.",
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
        mp_test_public_key: formData.mp_test_public_key || null,
        mp_test_access_token: formData.mp_test_access_token || null,
        mp_live_public_key: formData.mp_live_public_key || null,
        mp_live_access_token: formData.mp_live_access_token || null,
        mp_environment: formData.mp_environment
      };

      if (settings) {
        const { error } = await (supabase as any)
          .from('mercadopago_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('mercadopago_settings')
          .insert([settingsData]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações do Mercado Pago salvas com sucesso!",
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
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Configurações do Mercado Pago</CardTitle>
          </div>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para obter suas credenciais do Mercado Pago, acesse <a href="https://www.mercadopago.com.br/developers/panel/credentials" target="_blank" rel="noopener noreferrer" className="underline font-medium">Painel de Credenciais</a>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="environment">Ambiente Ativo</Label>
            <Select
              value={formData.mp_environment}
              onValueChange={(value: 'test' | 'live') => setFormData({...formData, mp_environment: value})}
            >
              <SelectTrigger id="environment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Teste (Sandbox)</SelectItem>
                <SelectItem value="live">Produção (Live)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.mp_environment === 'test'
                ? 'Modo de teste: Nenhuma transação real será processada'
                : 'Modo produção: Transações reais serão processadas'}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Credenciais de Teste</h3>
            <p className="text-sm text-muted-foreground mb-4">Use estas credenciais para testar o sistema sem processar pagamentos reais</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test_public">Public Key de Teste</Label>
                <Input
                  id="test_public"
                  type="text"
                  value={formData.mp_test_public_key}
                  onChange={(e) => setFormData({...formData, mp_test_public_key: e.target.value})}
                  placeholder="TEST-..."
                />
              </div>
              <div>
                <Label htmlFor="test_access">Access Token de Teste</Label>
                <Input
                  id="test_access"
                  type="password"
                  value={formData.mp_test_access_token}
                  onChange={(e) => setFormData({...formData, mp_test_access_token: e.target.value})}
                  placeholder="TEST-..."
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Credenciais de Produção</h3>
            <p className="text-sm text-muted-foreground mb-4">Use estas credenciais para processar pagamentos reais</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="live_public">Public Key de Produção</Label>
                <Input
                  id="live_public"
                  type="text"
                  value={formData.mp_live_public_key}
                  onChange={(e) => setFormData({...formData, mp_live_public_key: e.target.value})}
                  placeholder="APP_USR-..."
                />
              </div>
              <div>
                <Label htmlFor="live_access">Access Token de Produção</Label>
                <Input
                  id="live_access"
                  type="password"
                  value={formData.mp_live_access_token}
                  onChange={(e) => setFormData({...formData, mp_live_access_token: e.target.value})}
                  placeholder="APP_USR-..."
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminMercadoPago;

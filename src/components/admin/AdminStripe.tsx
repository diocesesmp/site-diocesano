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

interface StripeSettings {
  id: string;
  stripe_test_publishable_key?: string;
  stripe_test_secret_key?: string;
  stripe_live_publishable_key?: string;
  stripe_live_secret_key?: string;
  stripe_environment: 'test' | 'live';
}

const AdminStripe = () => {
  const [settings, setSettings] = useState<StripeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    stripe_test_publishable_key: '',
    stripe_test_secret_key: '',
    stripe_live_publishable_key: '',
    stripe_live_secret_key: '',
    stripe_environment: 'test' as 'test' | 'live'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setFormData({
          stripe_test_publishable_key: data.stripe_test_publishable_key || '',
          stripe_test_secret_key: data.stripe_test_secret_key || '',
          stripe_live_publishable_key: data.stripe_live_publishable_key || '',
          stripe_live_secret_key: data.stripe_live_secret_key || '',
          stripe_environment: data.stripe_environment || 'test'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do Stripe.",
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
        stripe_test_publishable_key: formData.stripe_test_publishable_key || null,
        stripe_test_secret_key: formData.stripe_test_secret_key || null,
        stripe_live_publishable_key: formData.stripe_live_publishable_key || null,
        stripe_live_secret_key: formData.stripe_live_secret_key || null,
        stripe_environment: formData.stripe_environment
      };

      if (settings) {
        const { error } = await supabase
          .from('stripe_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stripe_settings')
          .insert([settingsData]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações do Stripe salvas com sucesso!",
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
            <CardTitle>Configurações do Stripe</CardTitle>
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
              Para obter suas chaves Stripe, acesse <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline font-medium">dashboard.stripe.com/apikeys</a>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="environment">Ambiente Ativo</Label>
            <Select
              value={formData.stripe_environment}
              onValueChange={(value: 'test' | 'live') => setFormData({...formData, stripe_environment: value})}
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
              {formData.stripe_environment === 'test'
                ? 'Modo de teste: Nenhuma transação real será processada'
                : 'Modo produção: Transações reais serão processadas'}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Chaves de Teste</h3>
            <p className="text-sm text-muted-foreground mb-4">Use estas chaves para testar o sistema sem processar pagamentos reais</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test_publishable">Chave Publicável de Teste</Label>
                <Input
                  id="test_publishable"
                  type="text"
                  value={formData.stripe_test_publishable_key}
                  onChange={(e) => setFormData({...formData, stripe_test_publishable_key: e.target.value})}
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <Label htmlFor="test_secret">Chave Secreta de Teste</Label>
                <Input
                  id="test_secret"
                  type="password"
                  value={formData.stripe_test_secret_key}
                  onChange={(e) => setFormData({...formData, stripe_test_secret_key: e.target.value})}
                  placeholder="sk_test_..."
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Chaves de Produção</h3>
            <p className="text-sm text-muted-foreground mb-4">Use estas chaves para processar pagamentos reais</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="live_publishable">Chave Publicável de Produção</Label>
                <Input
                  id="live_publishable"
                  type="text"
                  value={formData.stripe_live_publishable_key}
                  onChange={(e) => setFormData({...formData, stripe_live_publishable_key: e.target.value})}
                  placeholder="pk_live_..."
                />
              </div>
              <div>
                <Label htmlFor="live_secret">Chave Secreta de Produção</Label>
                <Input
                  id="live_secret"
                  type="password"
                  value={formData.stripe_live_secret_key}
                  onChange={(e) => setFormData({...formData, stripe_live_secret_key: e.target.value})}
                  placeholder="sk_live_..."
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminStripe;

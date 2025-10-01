import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard as Edit, Trash2, ExternalLink, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  slug: string;
  image_url?: string;
  goal_amount?: number;
  default_amounts: number[];
  min_amount: number;
  is_active: boolean;
  created_at: string;
}

interface DonationStats {
  total_donations: number;
  total_amount: number;
  pending_amount: number;
}

const AdminDonations = () => {
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaign | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    image_url: '',
    goal_amount: '',
    default_amounts: '10,25,50,100,250',
    min_amount: '5'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar campanhas de doação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('amount, status');

      if (error) throw error;

      const completed = data?.filter(d => d.status === 'completed') || [];
      const pending = data?.filter(d => d.status === 'pending') || [];

      setStats({
        total_donations: completed.length,
        total_amount: completed.reduce((sum, d) => sum + Number(d.amount), 0),
        pending_amount: pending.reduce((sum, d) => sum + Number(d.amount), 0)
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const defaultAmountsArray = formData.default_amounts
        .split(',')
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v));

      const campaignData = {
        title: formData.title,
        description: formData.description,
        slug: formData.slug,
        image_url: formData.image_url || null,
        goal_amount: formData.goal_amount ? parseFloat(formData.goal_amount) : null,
        default_amounts: defaultAmountsArray,
        min_amount: parseFloat(formData.min_amount),
        is_active: true
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from('donation_campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Campanha atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from('donation_campaigns')
          .insert([campaignData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Campanha criada com sucesso!" });
      }

      setDialogOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error: any) {
      console.error('Erro ao salvar campanha:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar campanha.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (campaign: DonationCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      slug: campaign.slug,
      image_url: campaign.image_url || '',
      goal_amount: campaign.goal_amount?.toString() || '',
      default_amounts: campaign.default_amounts.join(','),
      min_amount: campaign.min_amount.toString()
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('donation_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Campanha removida com sucesso!" });
      fetchCampaigns();
    } catch (error) {
      console.error('Erro ao deletar campanha:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover campanha.",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (campaign: DonationCampaign) => {
    try {
      const { error } = await supabase
        .from('donation_campaigns')
        .update({ is_active: !campaign.is_active })
        .eq('id', campaign.id);

      if (error) throw error;
      fetchCampaigns();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da campanha.",
        variant: "destructive",
      });
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/doacoes/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copiado!", description: "Link da campanha copiado para a área de transferência." });
  };

  const resetForm = () => {
    setEditingCampaign(null);
    setFormData({
      title: '',
      description: '',
      slug: '',
      image_url: '',
      goal_amount: '',
      default_amounts: '10,25,50,100,250',
      min_amount: '5'
    });
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
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">R$ {stats.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Total Arrecadado</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total_donations}</div>
              <p className="text-xs text-muted-foreground">Doações Realizadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">R$ {stats.pending_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campanhas de Doação</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCampaign ? 'Editar' : 'Nova'} Campanha</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título da Campanha</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      required
                      placeholder="campanha-exemplo"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL: {window.location.origin}/doacoes/{formData.slug}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Imagem da Campanha</Label>
                    <ImageUpload
                      onUpload={(urls) => setFormData({...formData, image_url: urls[0]})}
                      multiple={false}
                      folder="diocese/donations"
                      className="mt-2"
                    />
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min_amount">Valor Mínimo (R$)</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        step="0.01"
                        min="5"
                        value={formData.min_amount}
                        onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="goal_amount">Meta (R$) - Opcional</Label>
                      <Input
                        id="goal_amount"
                        type="number"
                        step="0.01"
                        value={formData.goal_amount}
                        onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
                        placeholder="Ex: 10000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="default_amounts">Valores Sugeridos (separados por vírgula)</Label>
                    <Input
                      id="default_amounts"
                      value={formData.default_amounts}
                      onChange={(e) => setFormData({...formData, default_amounts: e.target.value})}
                      placeholder="10,25,50,100,250"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Ex: 10,25,50,100,250</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingCampaign ? 'Atualizar' : 'Criar'} Campanha
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma campanha cadastrada ainda.
              </p>
            ) : (
              campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        {campaign.image_url && (
                          <img
                            src={campaign.image_url}
                            alt={campaign.title}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{campaign.title}</h3>
                            <Badge variant={campaign.is_active ? "default" : "secondary"}>
                              {campaign.is_active ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>Min: R$ {campaign.min_amount.toFixed(2)}</span>
                            {campaign.goal_amount && (
                              <span>Meta: R$ {campaign.goal_amount.toLocaleString('pt-BR')}</span>
                            )}
                            <span>Valores: R$ {campaign.default_amounts.join(', R$ ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(campaign.slug)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/doacoes/${campaign.slug}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center">
                          <Switch
                            checked={campaign.is_active}
                            onCheckedChange={() => toggleActive(campaign)}
                          />
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(campaign.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDonations;

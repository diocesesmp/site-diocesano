import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Settings, FileText, Calendar, Users, Image, BookOpen, Newspaper, Chrome as Home, CreditCard } from "lucide-react";
import { Crown, Clock, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Componentes do painel admin (vão ser criados separadamente)
import AdminArticles from "@/components/admin/AdminArticles";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminPastorMessages from "@/components/admin/AdminPastorMessages";
import AdminPhotos from "@/components/admin/AdminPhotos";
import AdminClergy from "@/components/admin/AdminClergy";
import AdminParishes from "@/components/admin/AdminParishes";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminBishop from "@/components/admin/AdminBishop";
import AdminCloudinary from "@/components/admin/AdminCloudinary";
import AdminTimeline from "@/components/admin/AdminTimeline";
import AdminDonations from "@/components/admin/AdminDonations";
import AdminStripe from "@/components/admin/AdminStripe";

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Painel Administrativo</h1>
              <p className="text-muted-foreground">Diocese de São Miguel Paulista</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Bem-vindo, {user.email}
              </span>
              <Button variant="outline" asChild>
                <a href="/" target="_blank">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para o Site
                </a>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-12">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Notícias</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Eventos</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Mensagens</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Galeria</span>
            </TabsTrigger>
            <TabsTrigger value="clergy" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clero</span>
            </TabsTrigger>
            <TabsTrigger value="parishes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Paróquias</span>
            </TabsTrigger>
            <TabsTrigger value="bishop" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Bispo</span>
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Doações</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Stripe</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="cloudinary" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Cloudinary</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <AdminArticles />
          </TabsContent>

          <TabsContent value="events">
            <AdminEvents />
          </TabsContent>

          <TabsContent value="messages">
            <AdminPastorMessages />
          </TabsContent>


          <TabsContent value="photos">
            <AdminPhotos />
          </TabsContent>

          <TabsContent value="clergy">
            <AdminClergy />
          </TabsContent>

          <TabsContent value="parishes">
            <AdminParishes />
          </TabsContent>

          <TabsContent value="bishop">
            <AdminBishop />
          </TabsContent>

          <TabsContent value="donations">
            <AdminDonations />
          </TabsContent>

          <TabsContent value="stripe">
            <AdminStripe />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="cloudinary">
            <AdminCloudinary />
          </TabsContent>

          <TabsContent value="timeline">
            <AdminTimeline />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
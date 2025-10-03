import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LogOut, Settings, FileText, Calendar, Users, Image, BookOpen, Chrome as Home, CreditCard, ExternalLink, Church, Landmark, Menu, X } from "lucide-react";
import { Crown, Clock, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
import AdminImportantLinks from "@/components/admin/AdminImportantLinks";

const menuItems = [
  {
    category: "Conteúdo",
    items: [
      { id: "articles", label: "Notícias", icon: FileText },
      { id: "events", label: "Eventos", icon: Calendar },
      { id: "messages", label: "Mensagens Pastorais", icon: BookOpen },
      { id: "photos", label: "Galeria de Fotos", icon: Image },
      { id: "timeline", label: "Linha do Tempo", icon: Clock },
    ],
  },
  {
    category: "Diocese",
    items: [
      { id: "bishop", label: "Bispo Diocesano", icon: Crown },
      { id: "clergy", label: "Clero", icon: Users },
      { id: "parishes", label: "Paróquias", icon: Church },
      { id: "links", label: "Links Importantes", icon: ExternalLink },
    ],
  },
  {
    category: "Financeiro",
    items: [
      { id: "donations", label: "Doações", icon: Heart },
      { id: "stripe", label: "Configurar Stripe", icon: CreditCard },
    ],
  },
  {
    category: "Configurações",
    items: [
      { id: "settings", label: "Configurações Gerais", icon: Settings },
      { id: "cloudinary", label: "Cloudinary", icon: Image },
    ],
  },
];

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("articles");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const renderContent = () => {
    switch (activeSection) {
      case "articles":
        return <AdminArticles />;
      case "events":
        return <AdminEvents />;
      case "messages":
        return <AdminPastorMessages />;
      case "photos":
        return <AdminPhotos />;
      case "clergy":
        return <AdminClergy />;
      case "parishes":
        return <AdminParishes />;
      case "bishop":
        return <AdminBishop />;
      case "donations":
        return <AdminDonations />;
      case "stripe":
        return <AdminStripe />;
      case "settings":
        return <AdminSettings />;
      case "cloudinary":
        return <AdminCloudinary />;
      case "timeline":
        return <AdminTimeline />;
      case "links":
        return <AdminImportantLinks />;
      default:
        return <AdminArticles />;
    }
  };

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary">Painel Administrativo</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Diocese de São Miguel Paulista</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <a href="/" target="_blank">
                <Home className="h-4 w-4 mr-2" />
                Ver Site
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "top-16"
          )}
        >
          <ScrollArea className="h-[calc(100vh-4rem)] py-6">
            <div className="px-3 space-y-6">
              {menuItems.map((group) => (
                <div key={group.category}>
                  <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.category}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={activeSection === item.id ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            activeSection === item.id && "bg-secondary"
                          )}
                          onClick={() => {
                            setActiveSection(item.id);
                            if (window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;

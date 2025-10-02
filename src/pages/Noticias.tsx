import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsGallery from "@/components/NewsGallery";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, User, ArrowLeft, Facebook, MessageCircle, Mail, Copy, ExternalLink,
  Loader2, Frown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Interface para o tipo Article
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  featured_image_url: string;
  tags: string[];
  published_at: string;
  gallery_images?: string[];
}

const NoticiasPage = () => {
  const { slug } = useParams<{ slug: string }>(); 
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    
    if (slug) {
      fetchArticle();
    } else {
      fetchArticles();
    }
  }, [slug, currentPage]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .range((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage - 1);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .single();

      if (error || !data) {
        if (error && error.code === 'PGRST116') {
           setNotFound(true);
        } else if (!data) {
           setNotFound(true);
        } else {
           throw error;
        }
        setCurrentArticle(null);
      } else {
        setCurrentArticle(data as Article);
      }
    } catch (error) {
      console.error('Erro ao carregar notícia:', error);
      setNotFound(true);
      setCurrentArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(currentArticle?.title || '');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`*${currentArticle?.title}* - ${currentArticle?.excerpt}`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(currentArticle?.title || '');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(currentArticle?.title || '');
    const body = encodeURIComponent(`${currentArticle?.excerpt}\n\nLeia mais: ${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  // Renderização de Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-32">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-primary">Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Renderização de Notícia Não Encontrada (404)
  if (slug && notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-destructive mb-2">404 - Notícia Não Encontrada</h1>
          <p className="text-muted-foreground mb-8">
            Parece que a notícia com o slug **'{slug}'** não existe ou foi removida.
          </p>
          <Link to="/noticias">
            <Button variant="default">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Lista de Notícias
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Página individual da notícia (Somente se houver slug E currentArticle)
  if (slug && currentArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/noticias">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Notícias
                </Button>
              </Link>
            </div>

            <article className="prose prose-lg max-w-none dark:prose-invert">
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-primary mb-4">{currentArticle.title}</h1>
                  
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{currentArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(currentArticle.published_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Botões de Compartilhamento (COMPACTOS) */}
                <div className="flex items-center flex-wrap gap-2 mb-6">
                  <span className="text-sm font-medium text-muted-foreground mr-1">Compartilhe:</span>
                  
                  {/* Facebook (Apenas Ícone) */}
                  <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleShareFacebook} 
                      className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white"
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  
                  {/* WhatsApp (Apenas Ícone) */}
                  <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleShareWhatsApp} 
                      className="bg-[#25D366] text-white hover:bg-[#25D366]/90 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  
                  {/* X/Twitter (Apenas Ícone) */}
                  <Button variant="outline" size="icon" onClick={handleShareTwitter}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  
                  {/* E-mail (Apenas Ícone) */}
                  <Button variant="outline" size="icon" onClick={handleShareEmail}>
                    <Mail className="h-4 w-4" />
                  </Button>
                  
                  {/* Copiar Link (Apenas Ícone) */}
                  <Button variant="secondary" size="icon" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {/* FIM DOS BOTÕES COMPACTOS */}

                {currentArticle.tags && currentArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentArticle.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}

                {currentArticle.featured_image_url && (
                  <img 
                    src={currentArticle.featured_image_url} 
                    alt={currentArticle.title}
                    className="w-full max-h-96 object-cover rounded-lg mb-6"
                  />
                )}
              </header>

              <div 
                className="content text-justify leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentArticle.content }}
              />
              
              {/* Galeria de Imagens */}
              {currentArticle.gallery_images && currentArticle.gallery_images.length > 0 && (
                <div className="mt-10">
                    <NewsGallery 
                        images={currentArticle.gallery_images} 
                        title={currentArticle.title} 
                    />
                </div>
              )}
            </article>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Página de listagem de notícias
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Notícias</h1>
          <p className="text-muted-foreground">Acompanhe as últimas novidades da Diocese de São Miguel Paulista</p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma notícia encontrada.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="p-0">
                    {article.featured_image_url && (
                      <img 
                        src={article.featured_image_url} 
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Tags acima do título */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="default" className="text-xs bg-secondary hover:bg-secondary/80">{tag}</Badge>
                          ))}
                        </div>
                    )}
                    
                    <CardTitle className="mb-2 line-clamp-2">
                      <Link 
                        to={`/noticias/${article.slug}`} 
                        className="hover:text-primary transition-colors text-lg"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-4 border-t pt-4">
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">
                                {format(new Date(article.published_at), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                        </div>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Componente de Paginação */}
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline"
                disabled
              >
                Página {currentPage}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={articles.length < articlesPerPage}
              >
                Próxima
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default NoticiasPage;

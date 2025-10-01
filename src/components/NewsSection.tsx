import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  published_at: string;
  featured_image_url?: string;
  tags?: string[];
}

const NewsSection = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const fetchLatestArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, author, published_at, featured_image_url, tags')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Notícias da Diocese
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Acompanhe as principais atividades, eventos e ações pastorais da nossa comunidade diocesana.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Notícias da Diocese
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acompanhe as principais atividades, eventos e ações pastorais da nossa comunidade diocesana.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma notícia publicada ainda.</p>
            <Button variant="outline" asChild>
              <Link to="/noticias">Ver Todas as Notícias</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.map((article) => (
                <Card key={article.id} className="shadow-soft hover:shadow-medium transition-smooth group cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      {article.featured_image_url ? (
                        <img
                          src={article.featured_image_url}
                          alt={article.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {article.tags && article.tags.length > 0 && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                            {article.tags[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-primary mb-3 group-hover:text-accent transition-smooth line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {article.excerpt?.replace(/<[^>]*>/g, '') || ''}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(article.published_at), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 pb-6">
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to={`/noticias/${article.slug}`}>
                        Ler Mais
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="default" size="lg" asChild>
                <Link to="/noticias">
                  Ver Todas as Notícias
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
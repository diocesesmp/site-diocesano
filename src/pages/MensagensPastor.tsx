import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Play, FileText, ArrowLeft, Share2, Volume2 } from "lucide-react";

interface PastorMessage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  content_type: 'texto' | 'video' | 'audio';
  media_url?: string;
  thumbnail_url?: string;
  is_featured: boolean;
  published_at: string;
}

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video': return Play;
    case 'audio': return Volume2;
    default: return FileText;
  }
};

const getContentTypeText = (type: string) => {
  switch (type) {
    case 'video': return 'Vídeo';
    case 'audio': return 'Áudio';
    default: return 'Texto';
  }
};

const MensagensPastorPage = () => {
  const { slug } = useParams();
  const [messages, setMessages] = useState<PastorMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<PastorMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 9;

  useEffect(() => {
    if (slug) {
      fetchMessage();
    } else {
      fetchMessages();
    }
  }, [slug, currentPage]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('pastor_messages')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .range((currentPage - 1) * messagesPerPage, currentPage * messagesPerPage - 1);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('pastor_messages')
        .select('*')
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .single();

      if (error) throw error;
      setCurrentMessage(data);
    } catch (error) {
      console.error('Erro ao carregar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && currentMessage) {
      try {
        await navigator.share({
          title: currentMessage.title,
          text: `Mensagem do Pastor: ${currentMessage.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Página individual da mensagem
  if (slug && currentMessage) {
    const ContentIcon = getContentTypeIcon(currentMessage.content_type);
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/mensagens-do-pastor">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Mensagens
                </Button>
              </Link>
            </div>

            <article>
              <header className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <ContentIcon className="h-6 w-6 text-primary" />
                  <Badge variant="outline">{getContentTypeText(currentMessage.content_type)}</Badge>
                </div>
                
                <h1 className="text-4xl font-bold text-primary mb-4">{currentMessage.title}</h1>
                
                <div className="flex items-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(currentMessage.published_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </header>

              <div className="mb-8">
                {currentMessage.content_type === 'video' && currentMessage.media_url && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-full"
                      poster={currentMessage.thumbnail_url}
                    >
                      <source src={currentMessage.media_url} type="video/mp4" />
                      Seu navegador não suporta reprodução de vídeo.
                    </video>
                  </div>
                )}

                {currentMessage.content_type === 'audio' && currentMessage.media_url && (
                  <div className="bg-muted rounded-lg p-6">
                    <audio controls className="w-full">
                      <source src={currentMessage.media_url} type="audio/mpeg" />
                      Seu navegador não suporta reprodução de áudio.
                    </audio>
                  </div>
                )}
              </div>

              {currentMessage.content && (
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: currentMessage.content }} />
                </div>
              )}
            </article>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Página de listagem de mensagens
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
          <h1 className="text-4xl font-bold text-primary mb-4">Mensagens do Pastor</h1>
          <p className="text-muted-foreground">Reflexões e orientações espirituais do nosso Pastor</p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma mensagem encontrada.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {messages.map((message) => {
                const ContentIcon = getContentTypeIcon(message.content_type);
                
                return (
                  <Card key={message.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      {message.thumbnail_url ? (
                        <div className="relative">
                          <img 
                            src={message.thumbnail_url} 
                            alt={message.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-t-lg">
                            <ContentIcon className="h-12 w-12 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                          <ContentIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <ContentIcon className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {getContentTypeText(message.content_type)}
                        </Badge>
                      </div>
                      
                      <CardTitle className="mb-3 line-clamp-2">
                        <Link 
                          to={`/mensagens-do-pastor/${message.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {message.title}
                        </Link>
                      </CardTitle>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(message.published_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={messages.length < messagesPerPage}
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

export default MensagensPastorPage;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, ArrowRight } from "lucide-react";

interface Bishop {
  id: string;
  name: string;
  title: string;
  motto?: string;
  photo_url?: string;
}

const BishopCard = () => {
  const [bishop, setBishop] = useState<Bishop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBishop();
  }, []);

  const fetchBishop = async () => {
    try {
      const { data, error } = await supabase
        .from('bishop')
        .select('id, name, title, motto, photo_url')
        .single();

      if (error) throw error;
      setBishop(data);
    } catch (error) {
      console.error('Erro ao carregar dados do bispo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft hover:shadow-medium transition-smooth">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bishop) {
    return null;
  }

  return (
    <Card className="shadow-soft hover:shadow-medium transition-smooth group cursor-pointer">
      <Link to="/bispo">
        <CardHeader className="text-center pb-4">
          <div className="relative mx-auto mb-4">
            {bishop.photo_url ? (
              <img
                src={bishop.photo_url}
                alt={bishop.name}
                className="w-32 h-32 rounded-full mx-auto object-cover shadow-medium group-hover:scale-105 transition-smooth"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto bg-muted flex items-center justify-center group-hover:scale-105 transition-smooth">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl text-primary group-hover:text-accent transition-smooth">
            {bishop.name}
          </CardTitle>
          <Badge variant="outline" className="mx-auto">{bishop.title}</Badge>
        </CardHeader>
        <CardContent className="text-center">
          {bishop.motto && (
            <blockquote className="italic text-muted-foreground mb-4 text-sm">
              "{bishop.motto}"
            </blockquote>
          )}
          <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
            Conheça Nosso Pastor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
};

export default BishopCard;
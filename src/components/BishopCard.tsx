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
    <Card className="overflow-hidden border-2 shadow-elegant hover:shadow-glow transition-smooth group cursor-pointer bg-gradient-to-br from-card to-card/80">
      <Link to="/bispo" className="block">
        <div className="relative h-32 bg-gradient-subtle">
          <div className="absolute inset-0 bg-primary/5" />
        </div>
        
        <CardHeader className="text-center -mt-20 pb-4 relative z-10">
          <div className="relative mx-auto mb-6">
            {bishop.photo_url ? (
              <div className="relative">
                <img
                  src={bishop.photo_url}
                  alt={bishop.name}
                  className="w-36 h-36 rounded-full mx-auto object-cover shadow-elegant border-4 border-background group-hover:scale-105 group-hover:border-primary/20 transition-smooth"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent group-hover:from-primary/20 transition-smooth" />
              </div>
            ) : (
              <div className="w-36 h-36 rounded-full mx-auto bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center shadow-elegant border-4 border-background group-hover:scale-105 group-hover:border-primary/20 transition-smooth">
                <User className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold text-primary group-hover:text-accent transition-smooth mb-2">
            {bishop.name}
          </CardTitle>
          
          <Badge variant="outline" className="mx-auto text-xs px-3 py-1 border-primary/30 bg-primary/5">
            {bishop.title}
          </Badge>
        </CardHeader>
        
        <CardContent className="text-center pt-0 pb-6">
          {bishop.motto && (
            <blockquote className="relative italic text-muted-foreground mb-6 text-sm px-6 py-3 bg-muted/30 rounded-lg">
              <span className="text-primary text-2xl absolute -top-2 left-4">"</span>
              {bishop.motto}
              <span className="text-primary text-2xl absolute -bottom-2 right-4">"</span>
            </blockquote>
          )}
          
          <Button 
            variant="default" 
            className="w-full group-hover:shadow-elegant transition-smooth"
          >
            Conheça Nosso Pastor
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-smooth" />
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
};

export default BishopCard;
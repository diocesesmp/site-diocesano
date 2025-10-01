import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GovernmentMember {
  id: string;
  name: string;
  slug: string;
  position: string;
  photo_url?: string;
}

const GovernmentSection = () => {
  const [governmentMembers, setGovernmentMembers] = useState<GovernmentMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGovernmentMembers();
  }, []);

  const fetchGovernmentMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('clergy')
        .select('id, name, slug, position, photo_url')
        .eq('is_government', true)
        .order('government_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      setGovernmentMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar governo da diocese:', error);
    } finally {
      setLoading(false);
    }
  };

  // Não renderizar a seção se não houver membros do governo
  if (loading || governmentMembers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Governo da Diocese
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conheça os membros que auxiliam nosso Bispo na administração pastoral da Diocese
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {governmentMembers.map((member) => (
            <Card key={member.id} className="shadow-soft hover:shadow-medium transition-smooth group cursor-pointer">
              <Link to={`/diretorio/clero/${member.slug}`}>
                <CardContent className="p-6 text-center">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow-medium group-hover:scale-105 transition-smooth"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center group-hover:scale-105 transition-smooth">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-smooth line-clamp-2">
                    {member.name}
                  </h3>

                  <Badge variant="outline" className="text-xs">
                    {member.position}
                  </Badge>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="default" size="lg" asChild>
            <Link to="/governo">
              <Users className="mr-2 h-5 w-5" />
              Ver Governo Completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GovernmentSection;
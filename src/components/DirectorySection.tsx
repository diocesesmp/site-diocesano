import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, ArrowRight, Church, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const DirectorySection = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Nosso Diretório
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conheça as paróquias e o clero que servem nossa comunidade diocesana
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Paróquias */}
          <Card className="shadow-soft hover:shadow-medium transition-smooth group cursor-pointer">
            <Link to="/diretorio/paroquias">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-smooth">
                  <Church className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary group-hover:text-accent transition-smooth">
                  Diretório de Paróquias
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Encontre informações sobre todas as paróquias da Diocese, incluindo horários 
                  de missa, endereços, contatos e atividades pastorais.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">25+</div>
                    <div className="text-muted-foreground">Paróquias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">100+</div>
                    <div className="text-muted-foreground">Comunidades</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                  <MapPin className="mr-2 h-4 w-4" />
                  Explorar Paróquias
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Card Clero */}
          <Card className="shadow-soft hover:shadow-medium transition-smooth group cursor-pointer">
            <Link to="/diretorio/clero">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-smooth">
                  <UserCheck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary group-hover:text-accent transition-smooth">
                  Diretório do Clero
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Conheça os sacerdotes, diáconos e demais membros do clero que servem 
                  nossa Diocese com dedicação e amor pastoral.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">50+</div>
                    <div className="text-muted-foreground">Padres</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">15+</div>
                    <div className="text-muted-foreground">Diáconos</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                  <Users className="mr-2 h-4 w-4" />
                  Conhecer o Clero
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DirectorySection;
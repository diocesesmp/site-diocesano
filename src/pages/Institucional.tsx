import { useParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Heart, Target, Users, Shield, FileText, CreditCard, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const InstitucionalPage = () => {
  const { page } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  // Determinar a página baseada na URL
  const currentPage = page || location.pathname.replace('/', '');

  const renderContent = () => {
    switch (currentPage) {
      case 'sobre':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Sobre a Diocese</h1>
              <p className="text-lg text-muted-foreground">
                Conheça a história e missão da Diocese de São Miguel Paulista
              </p>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Nossa História
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none">
                  <p>
                    A Diocese de São Miguel Paulista foi criada em 15 de agosto de 1981, pela Bula Papal 
                    "Cum Ecclesiae" do Papa João Paulo II, sendo desmembrada da Arquidiocese de São Paulo. 
                    Seu território abrange a região leste da capital paulista, uma das áreas de maior 
                    crescimento populacional da Grande São Paulo.
                  </p>
                  <p>
                    Com mais de 40 anos de história, nossa Diocese tem se dedicado ao anúncio do Evangelho 
                    e ao serviço da caridade, especialmente junto às comunidades mais necessitadas da 
                    periferia paulistana. Somos uma Igreja viva, que caminha com o povo e busca ser 
                    sinal de esperança e transformação social.
                  </p>
                  <p>
                    Atualmente, a Diocese conta com dezenas de paróquias, comunidades eclesiais de base, 
                    movimentos pastorais e obras sociais que atendem milhares de famílias em toda a região.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Território
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Nossa Diocese abrange os seguintes bairros e regiões da zona leste de São Paulo:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <span>• São Miguel Paulista</span>
                    <span>• Itaim Paulista</span>
                    <span>• Guaianases</span>
                    <span>• Cidade Tiradentes</span>
                    <span>• São Mateus</span>
                    <span>• Iguatemi</span>
                    <span>• Ermelino Matarazzo</span>
                    <span>• Ponte Rasa</span>
                    <span>• Jardim Helena</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'missao':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Missão e Visão</h1>
              <p className="text-lg text-muted-foreground">
                Nossa identidade e propósito como Igreja local
              </p>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Nossa Missão
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none">
                  <blockquote className="border-l-4 border-primary pl-6 italic text-lg mb-6">
                    "Anunciar o Evangelho de Jesus Cristo, promover a comunhão fraterna e 
                    servir aos mais necessitados, sendo Igreja em saída que caminha com o povo."
                  </blockquote>
                  <p>
                    Como Diocese de São Miguel Paulista, somos chamados a ser uma comunidade missionária 
                    que vive e anuncia a Boa Nova de Jesus Cristo. Nossa missão se concretiza através da:
                  </p>
                  <ul>
                    <li><strong>Evangelização:</strong> Anúncio da Palavra de Deus e formação cristã</li>
                    <li><strong>Liturgia:</strong> Celebração dos sacramentos e da vida de fé</li>
                    <li><strong>Caridade:</strong> Serviço aos pobres e excluídos</li>
                    <li><strong>Comunhão:</strong> Construção de uma Igreja fraterna e participativa</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Nossa Visão
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none">
                  <p>
                    Ser uma Diocese missionária, profética e transformadora, que seja referência 
                    na evangelização, na promoção humana e na construção de uma sociedade mais 
                    justa e fraterna na zona leste de São Paulo.
                  </p>
                  <p>
                    Queremos ser uma Igreja próxima das pessoas, especialmente dos mais pobres, 
                    que sabe escutar, acolher e caminhar junto, sendo sinal visível do amor 
                    misericordioso de Deus.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Nossos Valores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Fé, Esperança e Caridade</h4>
                        <p className="text-sm text-muted-foreground">
                          Virtudes teologais que fundamentam nossa vida cristã
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Opção pelos Pobres</h4>
                        <p className="text-sm text-muted-foreground">
                          Compromisso preferencial com os excluídos e marginalizados
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Participação</h4>
                        <p className="text-sm text-muted-foreground">
                          Igreja de comunhão onde todos têm lugar e missão
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Profetismo</h4>
                        <p className="text-sm text-muted-foreground">
                          Coragem de denunciar injustiças e anunciar esperança
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Inculturação</h4>
                        <p className="text-sm text-muted-foreground">
                          Respeito às culturas locais e diversidade
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Sustentabilidade</h4>
                        <p className="text-sm text-muted-foreground">
                          Cuidado com a Casa Comum e ecologia integral
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'contato':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Contato</h1>
              <p className="text-lg text-muted-foreground">
                Entre em contato conosco
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Cúria Diocesana</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-sm text-muted-foreground">
                        Rua Padre Alonso de Monroy, 143<br />
                        Vila Jacuí - São Miguel Paulista<br />
                        CEP: 08090-170 - São Paulo/SP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <a href="tel:+551120516000" className="text-sm text-primary hover:underline">
                        (11) 2051-6000
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">E-mail</p>
                      <a href="mailto:contato@diocesesaomiguel.org.br" className="text-sm text-primary hover:underline">
                        contato@diocesesaomiguel.org.br
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horários de Atendimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Segunda a Sexta-feira</p>
                      <p className="text-sm text-muted-foreground">8h às 17h</p>
                    </div>
                    <div>
                      <p className="font-medium">Sábados</p>
                      <p className="text-sm text-muted-foreground">8h às 12h</p>
                    </div>
                    <div>
                      <p className="font-medium">Domingos e Feriados</p>
                      <p className="text-sm text-muted-foreground">Fechado</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Para assuntos urgentes fora do horário de atendimento, 
                      entre em contato através do telefone de plantão pastoral.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'doacoes':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Doações</h1>
              <p className="text-lg text-muted-foreground">
                Apoie a missão da Diocese com sua contribuição
              </p>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Como Contribuir
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none">
                  <p>
                    Sua generosidade nos ajuda a manter viva a missão evangelizadora da Diocese 
                    e a continuar servindo às comunidades mais necessitadas. Toda contribuição, 
                    independente do valor, faz a diferença.
                  </p>
                  
                  <h4>Formas de Doação:</h4>
                  <ul>
                    <li>Transferência bancária (dados abaixo)</li>
                    <li>PIX (chave: doacoes@diocesesaomiguel.org.br)</li>
                    <li>Depósito em conta corrente</li>
                    <li>Dízimo mensal através das paróquias</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Dados Bancários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium mb-1">Banco</p>
                        <p className="text-sm">Banco do Brasil</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Agência</p>
                        <p className="text-sm">1234-5</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Conta Corrente</p>
                        <p className="text-sm">12345-6</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">CNPJ</p>
                        <p className="text-sm">12.345.678/0001-90</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="font-medium mb-1">Favorecido</p>
                      <p className="text-sm">Diocese de São Miguel Paulista</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <p className="text-sm">
                      <strong>PIX:</strong> doacoes@diocesesaomiguel.org.br
                    </p>
                  </div>
                  
                  <div className="mt-6 p-6 border-2 border-accent/30 rounded-lg bg-accent/5">
                    <h4 className="font-semibold mb-3 text-accent">Código PIX Copia e Cola</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use este código no seu aplicativo bancário para fazer uma doação via PIX:
                    </p>
                    <div className="bg-muted rounded-lg p-4 mb-4">
                      <code className="text-xs break-all font-mono">
                        00020126530014BR.GOV.BCB.PIX0131doacoes@diocesesaomiguel.org.br5204000053039865802BR5924MITRA DIOCESANA S.MIGUEL6009Sao Paulo62160512MITRASMPDOAC63046B22
                      </code>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        variant="accent" 
                        onClick={() => {
                          navigator.clipboard.writeText('00020126530014BR.GOV.BCB.PIX0131doacoes@diocesesaomiguel.org.br5204000053039865802BR5924MITRA DIOCESANA S.MIGUEL6009Sao Paulo62160512MITRASMPDOAC63046B22');
                          toast({
                            title: "Código PIX copiado!",
                            description: "Cole no seu aplicativo bancário para fazer a doação.",
                          });
                        }}
                        className="flex-1"
                      >
                        Copiar Código PIX
                      </Button>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Como usar:</strong> Abra seu aplicativo bancário, vá em PIX → Copia e Cola, 
                        cole o código copiado e confirme a doação.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Destino dos Recursos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Atividades Pastorais</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Formação de lideranças</li>
                        <li>• Catequese e evangelização</li>
                        <li>• Juventude e vocações</li>
                        <li>• Comunicação diocesana</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Obras Sociais</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Assistência aos necessitados</li>
                        <li>• Projetos comunitários</li>
                        <li>• Manutenção de templos</li>
                        <li>• Apoio às paróquias</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'politica-privacidade':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Política de Privacidade</h1>
              <p className="text-lg text-muted-foreground">
                Como tratamos seus dados pessoais
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Proteção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                <p>
                  A Diocese de São Miguel Paulista está comprometida com a proteção da privacidade 
                  e dos dados pessoais de todos os usuários de nossos serviços digitais, em 
                  conformidade com a Lei Geral de Proteção de Dados (LGPD).
                </p>

                <h3>Coleta de Dados</h3>
                <p>
                  Coletamos apenas os dados necessários para a prestação de nossos serviços, como:
                </p>
                <ul>
                  <li>Nome e dados de contato para comunicação</li>
                  <li>Informações de navegação para melhorar nosso site</li>
                  <li>Dados para inscrições em eventos e atividades</li>
                </ul>

                <h3>Uso dos Dados</h3>
                <p>Utilizamos seus dados para:</p>
                <ul>
                  <li>Comunicação sobre atividades diocesanas</li>
                  <li>Inscrições em eventos e cursos</li>
                  <li>Melhoria de nossos serviços</li>
                  <li>Cumprimento de obrigações legais</li>
                </ul>

                <h3>Compartilhamento</h3>
                <p>
                  Não compartilhamos seus dados pessoais com terceiros, exceto quando 
                  necessário para prestação de serviços específicos ou cumprimento de 
                  obrigações legais.
                </p>

                <h3>Seus Direitos</h3>
                <p>Você tem direito a:</p>
                <ul>
                  <li>Acesso aos seus dados pessoais</li>
                  <li>Correção de dados incompletos ou incorretos</li>
                  <li>Exclusão de dados, quando aplicável</li>
                  <li>Portabilidade de dados</li>
                  <li>Revogação de consentimento</li>
                </ul>

                <h3>Contato</h3>
                <p>
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                  entre em contato através do e-mail: privacidade@diocesesaomiguel.org.br
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'termos':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Termos de Uso</h1>
              <p className="text-lg text-muted-foreground">
                Condições para uso de nossos serviços digitais
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Termos e Condições
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                <h3>1. Aceitação dos Termos</h3>
                <p>
                  Ao acessar e usar o site da Diocese de São Miguel Paulista, você concorda 
                  em cumprir estes termos de uso e todas as leis aplicáveis.
                </p>

                <h3>2. Uso Permitido</h3>
                <p>
                  Este site destina-se a fornecer informações sobre as atividades da Diocese 
                  e promover a evangelização. O uso deve ser feito de forma respeitosa e em 
                  conformidade com os valores cristãos.
                </p>

                <h3>3. Propriedade Intelectual</h3>
                <p>
                  Todo o conteúdo deste site, incluindo textos, imagens, logotipos e materiais 
                  audiovisuais, é propriedade da Diocese de São Miguel Paulista ou de seus 
                  licenciados, protegido por direitos autorais.
                </p>

                <h3>4. Responsabilidades do Usuário</h3>
                <p>Os usuários comprometem-se a:</p>
                <ul>
                  <li>Usar o site de forma respeitosa e legal</li>
                  <li>Não publicar conteúdo ofensivo ou inadequado</li>
                  <li>Respeitar os direitos de propriedade intelectual</li>
                  <li>Não tentar violar a segurança do site</li>
                </ul>

                <h3>5. Limitação de Responsabilidade</h3>
                <p>
                  A Diocese não se responsabiliza por danos diretos ou indiretos resultantes 
                  do uso do site, incluindo interrupções temporárias do serviço.
                </p>

                <h3>6. Modificações</h3>
                <p>
                  Estes termos podem ser atualizados periodicamente. Recomendamos a consulta 
                  regular desta página para estar ciente de quaisquer alterações.
                </p>

                <h3>7. Contato</h3>
                <p>
                  Para questões sobre estes termos, entre em contato: 
                  contato@diocesesaomiguel.org.br
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="mb-6">
              <Link to="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>

            <h1 className="text-4xl font-bold text-primary mb-4">Página não encontrada</h1>
            <p className="text-muted-foreground mb-6">
              A página institucional que você está procurando não existe.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default InstitucionalPage;
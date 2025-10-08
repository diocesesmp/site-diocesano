import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const TermosUso = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-foreground mb-8">Termos de Uso</h1>
          
          <Card className="p-8 space-y-6">
            <section>
              <p className="text-muted-foreground mb-4">
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-foreground">
                Bem-vindo ao site oficial da Diocese de São Miguel Paulista. Ao acessar e utilizar este site, você concorda com os seguintes Termos de Uso. Por favor, leia-os atentamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
              <p className="text-foreground">
                Ao acessar e usar este site, você aceita e concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. Uso do Site</h2>
              <p className="text-foreground mb-2">Este site é disponibilizado para:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Divulgar informações sobre a Diocese de São Miguel Paulista</li>
                <li>Compartilhar notícias, eventos e mensagens pastorais</li>
                <li>Facilitar doações e contribuições financeiras</li>
                <li>Fornecer acesso ao diretório de paróquias e clero</li>
              </ul>
              <p className="text-foreground mt-4">
                Você concorda em usar este site apenas para fins legais e de maneira que não infrinja os direitos de terceiros ou restrinja ou iniba o uso e aproveitamento do site por outras pessoas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. Propriedade Intelectual</h2>
              <p className="text-foreground">
                Todo o conteúdo deste site, incluindo textos, imagens, logos, gráficos, vídeos e software, é propriedade da Diocese de São Miguel Paulista ou de seus licenciadores e está protegido pelas leis de direitos autorais brasileiras e internacionais.
              </p>
              <p className="text-foreground mt-2">
                É proibida a reprodução, distribuição, modificação ou uso comercial do conteúdo sem autorização expressa por escrito da Diocese.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. Doações e Pagamentos</h2>
              <p className="text-foreground mb-2">
                As doações realizadas através deste site são processadas e administradas pela <strong>Stripe</strong>, uma plataforma de pagamentos segura e certificada internacionalmente.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mt-3">
                <li>A Diocese não armazena dados completos de cartão de crédito em seus servidores</li>
                <li>Todas as transações são criptografadas e seguem os padrões de segurança PCI-DSS</li>
                <li>As doações são voluntárias e não geram obrigação de contrapartida</li>
                <li>Em caso de dúvidas sobre transações, entre em contato através dos canais oficiais</li>
                <li>A Diocese emitirá recibos de doação quando solicitado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. Privacidade e Proteção de Dados</h2>
              <p className="text-foreground">
                A coleta, uso e proteção de seus dados pessoais estão descritos em nossa <a href="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</a>, elaborada em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">6. Conduta do Usuário</h2>
              <p className="text-foreground mb-2">Ao utilizar este site, você concorda em NÃO:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Publicar ou transmitir conteúdo ofensivo, difamatório, obsceno ou ilegal</li>
                <li>Violar direitos de propriedade intelectual de terceiros</li>
                <li>Transmitir vírus, malware ou qualquer código malicioso</li>
                <li>Tentar acessar áreas restritas do site sem autorização</li>
                <li>Usar o site para fins comerciais não autorizados</li>
                <li>Fazer uso indevido dos dados de outros usuários</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">7. Links para Sites Externos</h2>
              <p className="text-foreground">
                Este site pode conter links para sites de terceiros. A Diocese não tem controle sobre o conteúdo desses sites e não se responsabiliza por suas práticas de privacidade ou conteúdo. O acesso a sites externos é de sua inteira responsabilidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">8. Limitação de Responsabilidade</h2>
              <p className="text-foreground">
                A Diocese de São Miguel Paulista não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mt-2">
                <li>Interrupções ou indisponibilidade do site</li>
                <li>Erros ou imprecisões no conteúdo</li>
                <li>Danos resultantes do uso ou incapacidade de usar o site</li>
                <li>Problemas técnicos decorrentes de conexão à internet</li>
              </ul>
              <p className="text-foreground mt-3">
                Envidamos esforços para manter o site atualizado e seguro, mas não garantimos que estará sempre livre de erros ou interrupções.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">9. Modificações nos Termos</h2>
              <p className="text-foreground">
                A Diocese reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site. O uso continuado do site após modificações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">10. Legislação Aplicável</h2>
              <p className="text-foreground">
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa relacionada a estes termos será submetida à jurisdição exclusiva dos tribunais competentes de São Paulo/SP.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">11. Contato</h2>
              <p className="text-foreground">
                Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em contato:
              </p>
              <div className="mt-3 text-foreground">
                <p><strong>Diocese de São Miguel Paulista</strong></p>
                <p><strong>E-mail:</strong> contato@diocesesmp.org.br</p>
                <p><strong>Telefone:</strong> (11) 2051-6000</p>
                <p><strong>Endereço:</strong> Tv. Guilherme de Aguiar, 57, São Miguel Paulista - São Paulo/SP, CEP: 08011-030</p>
              </div>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Ao utilizar este site, você declara ter lido, compreendido e concordado com estes Termos de Uso e com a Política de Privacidade da Diocese de São Miguel Paulista.
              </p>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosUso;

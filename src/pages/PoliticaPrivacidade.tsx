import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const PoliticaPrivacidade = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>
          
          <Card className="p-8 space-y-6">
            <section>
              <p className="text-muted-foreground mb-4">
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-foreground">
                A Diocese de São Miguel Paulista está comprometida com a proteção da privacidade e dos dados pessoais de seus visitantes e usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Responsável pelo Tratamento de Dados</h2>
              <p className="text-foreground">
                A Diocese de São Miguel Paulista, inscrita sob o CNPJ [número do CNPJ], com sede na Tv. Guilherme de Aguiar, 57, São Miguel Paulista - São Paulo/SP, CEP: 08011-030, é a responsável pelo tratamento dos dados pessoais coletados através deste site.
              </p>
              <p className="text-foreground mt-2">
                <strong>Contato do Encarregado de Dados (DPO):</strong> contato@diocesesmp.org.br
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. Dados Coletados</h2>
              <p className="text-foreground mb-2">Coletamos os seguintes tipos de dados:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li><strong>Dados de Navegação:</strong> endereço IP, tipo de navegador, páginas visitadas, data e hora de acesso</li>
                <li><strong>Dados de Cadastro:</strong> nome, e-mail, telefone (quando fornecidos voluntariamente)</li>
                <li><strong>Dados de Doações:</strong> informações necessárias para processar doações, administradas pela Stripe</li>
                <li><strong>Cookies:</strong> utilizados para melhorar a experiência do usuário</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. Finalidade do Tratamento de Dados</h2>
              <p className="text-foreground mb-2">Os dados pessoais coletados são utilizados para:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Melhorar a experiência de navegação no site</li>
                <li>Enviar comunicações sobre eventos, notícias e atividades da Diocese</li>
                <li>Processar doações e contribuições financeiras</li>
                <li>Responder a solicitações de contato</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. Compartilhamento de Dados</h2>
              <p className="text-foreground mb-2">
                Seus dados pessoais não serão vendidos, alugados ou compartilhados com terceiros, exceto:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li><strong>Processamento de Pagamentos:</strong> Os dados de pagamento são processados e administrados pela <strong>Stripe</strong>, uma plataforma de pagamentos segura que opera em conformidade com as mais rigorosas normas de segurança internacionais (PCI-DSS). A Diocese não armazena dados completos de cartão de crédito em seus servidores.</li>
                <li>Quando exigido por lei ou por autoridades competentes</li>
                <li>Para proteção dos direitos, propriedade ou segurança da Diocese</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. Segurança dos Dados</h2>
              <p className="text-foreground">
                Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado, perda, destruição ou alteração. Utilizamos criptografia SSL/TLS para proteger a transmissão de dados sensíveis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">6. Seus Direitos (LGPD)</h2>
              <p className="text-foreground mb-2">
                De acordo com a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li><strong>Confirmação:</strong> direito de saber se tratamos seus dados</li>
                <li><strong>Acesso:</strong> direito de acessar seus dados pessoais</li>
                <li><strong>Correção:</strong> direito de corrigir dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários, excessivos ou tratados em desconformidade</li>
                <li><strong>Portabilidade:</strong> direito de solicitar a transferência de seus dados a outro fornecedor</li>
                <li><strong>Eliminação:</strong> direito de solicitar a exclusão de dados pessoais, exceto quando houver obrigação legal de retenção</li>
                <li><strong>Revogação do consentimento:</strong> direito de revogar o consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> direito de se opor ao tratamento de dados em determinadas situações</li>
              </ul>
              <p className="text-foreground mt-4">
                Para exercer seus direitos, entre em contato através do e-mail: <strong>contato@diocesesmp.org.br</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">7. Retenção de Dados</h2>
              <p className="text-foreground">
                Seus dados pessoais serão mantidos apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados, incluindo requisitos legais, contábeis ou de relatórios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">8. Cookies</h2>
              <p className="text-foreground">
                Utilizamos cookies para melhorar a experiência de navegação. Você pode gerenciar ou desabilitar cookies através das configurações do seu navegador. No entanto, isso pode afetar algumas funcionalidades do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">9. Alterações na Política de Privacidade</h2>
              <p className="text-foreground">
                Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que você revise esta página regularmente para se manter informado sobre como protegemos seus dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">10. Contato</h2>
              <p className="text-foreground">
                Para dúvidas, solicitações ou reclamações relacionadas à privacidade e proteção de dados, entre em contato:
              </p>
              <div className="mt-3 text-foreground">
                <p><strong>E-mail:</strong> contato@diocesesmp.org.br</p>
                <p><strong>Telefone:</strong> (11) 2051-6000</p>
                <p><strong>Endereço:</strong> Tv. Guilherme de Aguiar, 57, São Miguel Paulista - São Paulo/SP, CEP: 08011-030</p>
              </div>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e outras legislações aplicáveis.
              </p>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;

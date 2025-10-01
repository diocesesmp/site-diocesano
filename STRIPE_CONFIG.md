# Configuração do Sistema de Doações com Stripe

## Visão Geral

O sistema de doações está totalmente implementado e integrado com o Stripe para processar pagamentos de forma segura.

## Configuração Inicial

### 1. Obter Chaves do Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Faça login ou crie uma conta
3. Vá para **Desenvolvedores** > **Chaves de API**
4. Você verá 4 tipos de chaves:

#### Chaves de Teste (para desenvolvimento)
- **Chave Publicável de Teste**: `pk_test_...`
- **Chave Secreta de Teste**: `sk_test_...`

#### Chaves de Produção (para pagamentos reais)
- **Chave Publicável de Produção**: `pk_live_...`
- **Chave Secreta de Produção**: `sk_live_...`

### 2. Configurar no Painel Administrativo

1. Acesse: `https://seu-dominio.com/admin`
2. Faça login com suas credenciais
3. Clique na aba **"Stripe"**
4. Cole as chaves obtidas nos campos correspondentes:
   - Chaves de Teste
   - Chaves de Produção
5. Selecione o ambiente ativo:
   - **Teste (Sandbox)**: Para testes sem processar pagamentos reais
   - **Produção (Live)**: Para processar pagamentos reais
6. Clique em **"Salvar"**

### 3. Configurar Webhooks do Stripe

Os webhooks permitem que o Stripe notifique seu sistema sobre eventos de pagamento.

#### URL do Webhook

```
https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/stripe-webhook
```

#### Passos para Configurar:

1. No Dashboard do Stripe, vá para **Desenvolvedores** > **Webhooks**
2. Clique em **"Adicionar endpoint"**
3. Cole a URL do webhook acima
4. Selecione os seguintes eventos para escutar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Clique em **"Adicionar endpoint"**
6. Copie a **Chave de assinatura do webhook** (começa com `whsec_...`)

**Importante**: Configure webhooks separados para teste e produção:
- Teste: Use o endpoint com suas chaves de teste
- Produção: Use o endpoint com suas chaves de produção

## Criar Campanhas de Doação

### No Painel Administrativo:

1. Acesse a aba **"Doações"**
2. Clique em **"Nova Campanha"**
3. Preencha os dados:
   - **Título**: Nome da campanha
   - **Slug**: URL amigável (gerado automaticamente)
   - **Descrição**: Detalhes sobre a campanha
   - **Imagem**: Upload via Cloudinary
   - **Valor Mínimo**: Padrão R$ 5,00
   - **Meta** (opcional): Objetivo de arrecadação
   - **Valores Sugeridos**: Ex: 10,25,50,100,250
4. Clique em **"Criar Campanha"**

### Link da Campanha:

Após criar, cada campanha terá um link único:
```
https://seu-dominio.com/doacoes/nome-da-campanha
```

Use o botão "Copiar Link" para compartilhar facilmente.

## Fluxo de Doação

### Para o Doador:

1. Acessa o link da campanha
2. Escolhe valor sugerido ou insere valor personalizado (mínimo R$ 5,00)
3. Preenche dados:
   - Nome completo
   - E-mail
   - Telefone: (00) 0000-0000 ou (00) 00000-0000
4. Clica em "Continuar para pagamento"
5. Página de checkout do Stripe:
   - Cartão de crédito/débito
   - Pix (se habilitado no Stripe)
   - Outros métodos disponíveis
6. Confirma o pagamento
7. Redirecionado para página de agradecimento
8. Pode baixar comprovante em PDF

### Comprovante em PDF:

O sistema gera automaticamente um comprovante personalizado contendo:
- Brasão da Diocese
- Dados do doador
- Valor da doação
- Data e hora
- Código da transação
- Status do pagamento

## Gerenciar Doações

### Painel Administrativo:

Na aba **"Doações"**, você pode:
- Ver estatísticas:
  - Total arrecadado
  - Número de doações
  - Valores pendentes
- Listar todas as campanhas
- Editar campanhas existentes
- Ativar/desativar campanhas
- Excluir campanhas
- Copiar links para compartilhar

### Visualizar Transações:

As transações ficam salvas na tabela `donations` do banco de dados com:
- Dados do doador
- Valor da doação
- Status (pending, completed, failed, refunded)
- ID do pagamento no Stripe
- Data e hora

## Testando o Sistema

### Modo de Teste:

1. Configure as chaves de teste no painel
2. Selecione ambiente "Teste (Sandbox)"
3. Use cartões de teste do Stripe:

#### Cartões de Teste:
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **Requer autenticação**: `4000 0025 0000 3155`

**Dados adicionais**:
- CVV: Qualquer 3 dígitos
- Data: Qualquer data futura
- CEP: Qualquer 5 dígitos

### Verificar Pagamentos:

Acesse o Dashboard do Stripe > Pagamentos para ver todas as transações.

## Segurança

### Dados Protegidos:

- Chaves secretas nunca são expostas no frontend
- Pagamentos processados diretamente pelo Stripe (PCI compliant)
- Dados sensíveis criptografados
- Row Level Security (RLS) ativo no banco de dados

### Políticas de Acesso:

- **Campanhas ativas**: Acesso público
- **Configurações Stripe**: Apenas administradores autenticados
- **Doações**: Inserção pública, leitura apenas para admins

## URLs Importantes

### Produção:
- **Painel Admin**: `https://seu-dominio.com/admin`
- **Configurações Stripe**: `https://seu-dominio.com/admin` (aba Stripe)
- **Gerenciar Doações**: `https://seu-dominio.com/admin` (aba Doações)
- **Página de Doação**: `https://seu-dominio.com/doacoes/{slug}`

### Stripe:
- **Dashboard**: https://dashboard.stripe.com/
- **Chaves de API**: https://dashboard.stripe.com/apikeys
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Documentação**: https://stripe.com/docs

## Suporte

### Problemas Comuns:

**Erro ao processar pagamento:**
- Verifique se as chaves estão corretas
- Confirme que o ambiente (teste/produção) está correto
- Verifique logs no Dashboard do Stripe

**Webhook não funciona:**
- Confirme a URL está correta
- Verifique se os eventos estão selecionados
- Teste o webhook no Dashboard do Stripe

**Doação não aparece:**
- Verifique o status no Dashboard do Stripe
- Confira os logs da Edge Function
- Verifique a conexão com o banco de dados

### Logs:

Para debug, verifique:
1. Console do navegador (F12)
2. Logs do Supabase (Functions)
3. Dashboard do Stripe (Logs)

## Custos do Stripe

### Brasil:
- **Cartão nacional**: 4,99% + R$ 0,49 por transação
- **Cartão internacional**: 6,99% + R$ 0,49 por transação
- **Pix**: 0,99% por transação (mínimo R$ 0,01)

Consulte a [página de preços do Stripe](https://stripe.com/br/pricing) para valores atualizados.

## Recursos Adicionais

- [Documentação Stripe Brasil](https://stripe.com/docs)
- [Guia de Integração](https://stripe.com/docs/payments/integration-builder)
- [Testes de Pagamento](https://stripe.com/docs/testing)
- [Webhooks](https://stripe.com/docs/webhooks)

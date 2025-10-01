# Guia Rápido - Sistema de Doações

## Erros Corrigidos

- Políticas RLS atualizadas para permitir acesso público às configurações necessárias
- Logo da página inicial agora usa o mesmo do cabeçalho (configurável no painel admin)

## Configuração Stripe - Passo a Passo

### 1. Obter Chaves do Stripe

Acesse: https://dashboard.stripe.com/apikeys

Você precisará de 4 chaves:

**Modo Teste:**
- Chave Publicável de Teste: `pk_test_...`
- Chave Secreta de Teste: `sk_test_...`

**Modo Produção:**
- Chave Publicável de Produção: `pk_live_...`
- Chave Secreta de Produção: `sk_live_...`

### 2. Configurar no Site

1. Acesse: `https://seu-dominio.com/admin`
2. Faça login
3. Clique na aba **"Stripe"**
4. Cole as 4 chaves nos campos correspondentes
5. Escolha o ambiente: **Teste** ou **Produção**
6. Clique em **"Salvar"**

### 3. Configurar Webhook no Stripe

**URL do Webhook:**
```
https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/stripe-webhook
```

**Eventos para escutar:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Como configurar:**
1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Adicionar endpoint"
3. Cole a URL acima
4. Selecione os 3 eventos listados
5. Clique em "Adicionar endpoint"

**Importante:** Configure webhooks separados para teste e produção.

## Como Criar uma Campanha

1. Acesse o painel admin: `https://seu-dominio.com/admin`
2. Clique na aba **"Doações"**
3. Clique em **"Nova Campanha"**
4. Preencha:
   - **Título:** Nome da campanha
   - **Slug:** URL (gerado automaticamente)
   - **Descrição:** Sobre a campanha
   - **Imagem:** Upload via Cloudinary
   - **Valores Sugeridos:** Ex: 10,25,50,100,250
   - **Valor Mínimo:** Padrão R$ 5,00
5. Clique em **"Criar Campanha"**

## Links das Campanhas

Cada campanha tem seu próprio link:
```
https://seu-dominio.com/doacoes/nome-da-campanha
```

Use o botão "Copiar Link" no painel para compartilhar facilmente.

## Testar o Sistema

### Cartões de Teste (use no modo Teste):

**Pagamento bem-sucedido:**
- Número: `4242 4242 4242 4242`
- CVV: Qualquer 3 dígitos
- Data: Qualquer data futura

**Pagamento com falha:**
- Número: `4000 0000 0000 0002`

**Requer autenticação:**
- Número: `4000 0025 0000 3155`

## O que os Doadores Recebem

Após a doação, o doador:
1. É redirecionado para página de agradecimento
2. Recebe e-mail de confirmação do Stripe
3. Pode baixar comprovante em PDF personalizado com:
   - Brasão da Diocese
   - Dados da doação
   - Código da transação
   - Data e hora

## Configurar Logo da Diocese

O brasão que aparece na página inicial vem da configuração do site:

1. Acesse o painel admin
2. Vá na aba **"Configurações"**
3. Em "Logo do Site", faça upload da imagem
4. Clique em "Salvar"

O mesmo logo aparecerá:
- No cabeçalho do site
- Na página inicial (hero)
- No comprovante de doação em PDF

## Suporte Técnico

**Dashboard Stripe:**
- Pagamentos: https://dashboard.stripe.com/payments
- Webhooks: https://dashboard.stripe.com/webhooks
- Logs: https://dashboard.stripe.com/logs

**Verificar Edge Functions:**
- Acesse o Supabase Dashboard
- Vá em "Edge Functions"
- Verifique logs de execução

**Custos do Stripe no Brasil:**
- Cartão nacional: 4,99% + R$ 0,49 por transação
- Cartão internacional: 6,99% + R$ 0,49 por transação
- PIX: 0,99% por transação

## Documentação Completa

Para mais detalhes, consulte o arquivo `STRIPE_CONFIG.md` neste projeto.

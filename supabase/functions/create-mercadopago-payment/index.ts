import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    
    // Se receber paymentData, é um pagamento direto (checkout transparente)
    if (body.paymentData && body.donationId) {
      return await processDirectPayment(body);
    }
    
    // Caso contrário, criar doação e retornar public key para o checkout
    return await createDonation(body, req);
  } catch (error: any) {
    console.error("Erro ao processar requisição:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function createDonation(body: any, req: Request) {
  const { amount, campaignId, campaignTitle, donorEmail, donorName, donorPhone, isTestMode } = body;

  console.log("Criando doação:", { campaignId, amount, donorEmail });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Buscar configurações do Mercado Pago
  const { data: mpSettings, error: settingsError } = await supabase
    .from("mercadopago_settings")
    .select("*")
    .limit(1)
    .single();

  if (settingsError || !mpSettings) {
    throw new Error("Configurações do Mercado Pago não encontradas");
  }

  const publicKey = isTestMode
    ? mpSettings.mp_test_public_key
    : mpSettings.mp_live_public_key;

  if (!publicKey) {
    throw new Error("Public key do Mercado Pago não configurada");
  }

  // Criar doação
  if (!campaignId || !donorEmail || !donorName) {
    throw new Error("Campos obrigatórios faltando");
  }

  const { data: donation, error: donationError } = await supabase
    .from("donations")
    .insert({
      campaign_id: campaignId,
      donor_name: donorName,
      donor_email: donorEmail,
      donor_phone: donorPhone || null,
      amount: amount,
      status: "pending",
    })
    .select("id")
    .single();

  if (donationError || !donation) {
    console.error("Erro ao criar doação:", donationError);
    throw new Error(donationError?.message || "Falha ao criar doação");
  }

  console.log("Doação criada com ID:", donation.id);

  return new Response(
    JSON.stringify({
      donationId: donation.id,
      publicKey: publicKey,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

async function processDirectPayment(body: any) {
  const { donationId, campaignId, amount, paymentData, donorEmail, donorName, donorPhone } = body;

  console.log("Processando pagamento direto:", { donationId, amount });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Buscar configurações do Mercado Pago
  const { data: mpSettings, error: settingsError } = await supabase
    .from("mercadopago_settings")
    .select("*")
    .limit(1)
    .single();

  if (settingsError || !mpSettings) {
    throw new Error("Configurações do Mercado Pago não encontradas");
  }

  const isTestMode = mpSettings.mp_environment === 'test';
  const accessToken = isTestMode
    ? mpSettings.mp_test_access_token
    : mpSettings.mp_live_access_token;

  if (!accessToken) {
    throw new Error("Access Token do Mercado Pago não configurado");
  }

  // Criar pagamento no Mercado Pago
  const paymentPayload = {
    transaction_amount: amount,
    token: paymentData.token,
    description: `Doação - Diocese`,
    installments: paymentData.installments,
    payment_method_id: paymentData.payment_method_id,
    issuer_id: paymentData.issuer_id,
    payer: {
      email: donorEmail,
      identification: paymentData.payer?.identification || undefined,
    },
    external_reference: donationId,
    notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
    statement_descriptor: "DOACAO DIOCESE",
  };

  console.log("Criando pagamento no Mercado Pago");

  const response = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": donationId,
    },
    body: JSON.stringify(paymentPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro do Mercado Pago:", errorText);
    throw new Error("Erro ao processar pagamento no Mercado Pago");
  }

  const payment = await response.json();
  console.log("Pagamento criado:", {
    id: payment.id,
    status: payment.status,
    status_detail: payment.status_detail
  });

  // Atualizar doação
  let donationStatus = "pending";
  if (payment.status === "approved") {
    donationStatus = "completed";
  } else if (payment.status === "rejected") {
    donationStatus = "failed";
  }

  await supabase
    .from("donations")
    .update({
      status: donationStatus,
      mp_payment_id: payment.id.toString(),
      mp_status: payment.status,
      mp_payment_type: payment.payment_type_id,
      mp_transaction_amount: payment.transaction_amount,
    })
    .eq("id", donationId);

  return new Response(
    JSON.stringify({
      status: payment.status,
      status_detail: payment.status_detail,
      payment_id: payment.id,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

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
    const { donationId, campaignId, amount, paymentData, donorEmail, donorName, donorPhone } = body;

    console.log("Processando pagamento Mercado Pago:", { donationId, amount, paymentData });

    // Sempre usar service role key para operações de pagamento
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: mpSettings, error: settingsError } = await supabase
      .from("mercadopago_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (settingsError || !mpSettings) {
      console.error("Erro ao buscar configurações:", settingsError);
      throw new Error("Configurações do Mercado Pago não encontradas");
    }

    const isTestMode = mpSettings.mp_environment === 'test';
    const accessToken = isTestMode
      ? mpSettings.mp_test_access_token
      : mpSettings.mp_live_access_token;

    if (!accessToken) {
      throw new Error("Access token do Mercado Pago não configurado");
    }

    console.log("Modo:", isTestMode ? "test" : "live");

    const paymentPayload: any = {
      transaction_amount: Number(amount),
      token: paymentData.token,
      description: `Doação - Campanha ID: ${campaignId}`,
      installments: Number(paymentData.installments || 1),
      payment_method_id: paymentData.payment_method_id,
      payer: {
        email: donorEmail || paymentData.payer?.email || 'doador@example.com',
      },
      external_reference: donationId,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
    };

    // Adicionar issuer_id apenas se existir
    if (paymentData.issuer_id) {
      paymentPayload.issuer_id = paymentData.issuer_id;
    }

    // Adicionar identificação se existir
    if (paymentData.payer?.identification) {
      paymentPayload.payer.identification = {
        type: paymentData.payer.identification.type,
        number: paymentData.payer.identification.number
      };
    }

    console.log("Criando pagamento no Mercado Pago...", JSON.stringify(paymentPayload, null, 2));

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": donationId,
      },
      body: JSON.stringify(paymentPayload),
    });

    const mpData = await mpResponse.json();
    console.log("Resposta do Mercado Pago:", JSON.stringify(mpData, null, 2));

    if (!mpResponse.ok) {
      console.error("Erro na API do Mercado Pago:", mpData);

      // Tratar erros específicos do Mercado Pago
      let errorMessage = "Erro ao processar pagamento";

      if (mpData.cause && mpData.cause.length > 0) {
        errorMessage = mpData.cause[0].description || errorMessage;
      } else if (mpData.message) {
        errorMessage = mpData.message;
      }

      throw new Error(errorMessage);
    }

    let donationStatus = "pending";
    if (mpData.status === "approved") {
      donationStatus = "completed";
    } else if (mpData.status === "rejected") {
      donationStatus = "failed";
    }

    const updateData: any = {
      status: donationStatus,
      mp_payment_id: mpData.id.toString(),
      mp_status: mpData.status,
      mp_status_detail: mpData.status_detail,
    };

    if (mpData.status === "approved") {
      updateData.mp_payment_type = mpData.payment_type_id;
      updateData.mp_transaction_amount = mpData.transaction_amount;
    }

    await supabase
      .from("donations")
      .update(updateData)
      .eq("id", donationId);

    console.log(`Doação ${donationId} atualizada. Status: ${mpData.status}`);

    return new Response(
      JSON.stringify({
        id: mpData.id,
        status: mpData.status,
        status_detail: mpData.status_detail,
        payment_method_id: mpData.payment_method_id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
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

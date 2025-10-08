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

  const startTime = Date.now();

  try {
    const body = await req.json();
    const { donationId, campaignId, amount, paymentData, donorEmail, donorName, donorPhone, publicKey } = body;

    console.log("Processando pagamento Mercado Pago:", { donationId, amount });

    // Validar dados obrigatórios rapidamente
    if (!donationId || !campaignId || !amount || !paymentData) {
      return new Response(
        JSON.stringify({ error: "Dados obrigatórios ausentes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!paymentData.token) {
      return new Response(
        JSON.stringify({ error: "Token de pagamento não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!paymentData.payment_method_id) {
      return new Response(
        JSON.stringify({ error: "Método de pagamento não identificado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente Supabase com configuração otimizada
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

    // Buscar configurações em paralelo com validações
    const { data: mpSettings, error: settingsError } = await supabase
      .from("mercadopago_settings")
      .select("mp_environment, mp_test_access_token, mp_live_access_token")
      .limit(1)
      .maybeSingle();

    if (settingsError || !mpSettings) {
      console.error("Erro ao buscar configurações:", settingsError);
      return new Response(
        JSON.stringify({ error: "Configurações do Mercado Pago não encontradas" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keyHint = (publicKey as string | undefined) || '';
    const isTestFromKey = keyHint.startsWith('TEST-');
    const isLiveFromKey = keyHint.startsWith('APP_USR-');
    const isTestMode = isTestFromKey ? true : isLiveFromKey ? false : mpSettings.mp_environment === 'test';
    const accessToken = isTestMode
      ? mpSettings.mp_test_access_token
      : mpSettings.mp_live_access_token;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Access token do Mercado Pago não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Modo:", isTestMode ? "test" : "live", "Tempo até agora:", Date.now() - startTime, "ms");

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

    console.log("Criando pagamento no Mercado Pago...");

    // Criar timeout controller para a requisição do Mercado Pago
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 segundos

    let mpResponse;
    let mpData;

    try {
      mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "X-Idempotency-Key": donationId,
        },
        body: JSON.stringify(paymentPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      mpData = await mpResponse.json();

      console.log("Resposta do Mercado Pago - Status:", mpData.status, "Tempo total:", Date.now() - startTime, "ms");
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.error("Timeout na API do Mercado Pago");
        return new Response(
          JSON.stringify({ error: "Timeout ao processar pagamento. Tente novamente." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error("Erro ao chamar API do Mercado Pago:", fetchError);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com o Mercado Pago. Tente novamente." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!mpResponse.ok) {
      console.error("Erro na API do Mercado Pago:", mpData);

      let errorMessage = "Erro ao processar pagamento";

      if (mpData.cause && mpData.cause.length > 0) {
        errorMessage = mpData.cause[0].description || errorMessage;
      } else if (mpData.message) {
        errorMessage = mpData.message;
      }

      return new Response(
        JSON.stringify({ error: errorMessage, status_detail: mpData.status_detail }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mapear status do Mercado Pago para status da doação
    let donationStatus = "pending";
    if (mpData.status === "approved") {
      donationStatus = "completed";
    } else if (mpData.status === "rejected" || mpData.status === "cancelled") {
      donationStatus = "failed";
    } else if (mpData.status === "in_process" || mpData.status === "pending") {
      donationStatus = "pending";
    } else if (mpData.status === "refunded" || mpData.status === "charged_back") {
      donationStatus = "refunded";
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

    console.log("Atualizando doação com status:", donationStatus, "| Status MP:", mpData.status);

    // Atualizar banco de dados de forma SÍNCRONA para garantir que o status seja atualizado
    const { error: updateError } = await supabase
      .from("donations")
      .update(updateData)
      .eq("id", donationId);

    if (updateError) {
      console.error("Erro ao atualizar doação:", updateError);
      // Continua mesmo com erro de atualização, pois o pagamento foi processado
    } else {
      console.log(`Doação ${donationId} atualizada com sucesso. Status: ${donationStatus} (MP: ${mpData.status})`);
    }

    console.log("Tempo total de processamento:", Date.now() - startTime, "ms");

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
        error: error.message || "Erro ao processar pagamento",
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  const startTime = Date.now();

  try {
    const body = await req.json();
    const { donationId, campaignId, amount, paymentData, donorEmail, donorName, donorPhone, publicKey } = body;

    // ... (Validações de dados omitidas por concisão, mas mantidas no código real) ...

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // ... (Busca de configurações e determinação do Access Token omitidas) ...

    const keyHint = publicKey || '';
    const isTestFromKey = keyHint.startsWith('TEST-');
    const isLiveFromKey = keyHint.startsWith('APP_USR-');
    const isTestMode = isTestFromKey ? true : isLiveFromKey ? false : mpSettings.mp_environment === 'test';
    const accessToken = isTestMode ? mpSettings.mp_test_access_token : mpSettings.mp_live_access_token;

    // ... (Lógica de payload e chamada à API do Mercado Pago omitidas) ...
    // ... (Assume-se que 'mpData' e 'mpResponse' são retornados corretamente) ...
    
    // CORPO DA REQUISIÇÃO AO MP (Incluído novamente para garantir contexto)
    const paymentPayload: any = {
      transaction_amount: Number(amount),
      token: paymentData.token,
      description: `Doação - Campanha ID: ${campaignId}`,
      installments: Number(paymentData.installments || 1),
      payment_method_id: paymentData.payment_method_id,
      payer: {
        email: donorEmail || paymentData.payer?.email || 'doador@example.com'
      },
      external_reference: donationId,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`
    };
    
    // ... (Lógica de chamada à API do MP e tratamento de timeout/erros 400/503/504 omitidas) ...
    
    // Simulação da chamada ao MP:
    let mpResponse;
    let mpData;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "X-Idempotency-Key": donationId
        },
        body: JSON.stringify(paymentPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      mpData = await mpResponse.json();

      if (!mpResponse.ok) {
        // ... (Retorna 400 em caso de erro da API do MP) ...
        let errorMessage = "Erro ao processar pagamento";
        if (mpData.cause && mpData.cause.length > 0) {
            errorMessage = mpData.cause[0].description || errorMessage;
        } else if (mpData.message) {
            errorMessage = mpData.message;
        }
        return new Response(JSON.stringify({
            error: errorMessage,
            status_detail: mpData.status_detail
        }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (error: any) {
        // ... (Retorna 504/503 em caso de falha de conexão ou timeout) ...
        console.error("Erro ao chamar API do Mercado Pago:", error);
        return new Response(JSON.stringify({ error: "Erro ao conectar com o Mercado Pago. Tente novamente." }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    // FIM DA CHAMADA AO MP
    
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
      mp_status_detail: mpData.status_detail
    };
    if (mpData.status === "approved") {
      updateData.mp_payment_type = mpData.payment_type_id;
      updateData.mp_transaction_amount = mpData.transaction_amount;
    }

    console.log("Atualizando doação com status:", donationStatus, "| Status MP:", mpData.status);

    // Atualizar banco de dados de forma SÍNCRONA
    const { error: updateError } = await supabase.from("donations").update(updateData).eq("id", donationId);
    
    if (updateError) {
      // 🚨 CORREÇÃO: Falha ao atualizar o DB: retorna 500 e registra o erro.
      console.error(`ERRO CRÍTICO: Falha ao registrar status ${donationStatus.toUpperCase()} no DB (Doação: ${donationId}, MP ID: ${mpData.id}):`, updateError);
      
      return new Response(
        JSON.stringify({
          error: "Pagamento processado, mas falha ao registrar no sistema. Contate o suporte imediatamente.",
          details: updateError.message,
          mp_status: mpData.status,
        }),
        {
          status: 500, // Força o frontend a mostrar erro de processamento
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    } else {
      console.log(`Doação ${donationId} atualizada com sucesso. Status: ${donationStatus} (MP: ${mpData.status})`);
    }

    console.log("Tempo total de processamento:", Date.now() - startTime, "ms");
    
    // Retorna 200 SOMENTE se a chamada ao MP foi OK E o DB foi atualizado com sucesso.
    return new Response(JSON.stringify({
      id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail,
      payment_method_id: mpData.payment_method_id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error: any) {
    console.error("Erro geral ao criar pagamento:", error);
    return new Response(JSON.stringify({
      error: error.message || "Erro ao processar pagamento",
      details: error.toString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

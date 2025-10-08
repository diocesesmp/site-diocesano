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
    // Parse seguro do corpo (alguns webhooks do MP podem vir sem JSON)
    let body: any = null;
    try {
      body = await req.json();
    } catch (_) {
      body = null;
    }
    console.log("Webhook recebido:", body);

    const url = new URL(req.url);
    const params = url.searchParams;

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

    // Suporte a ambos formatos: body.type/data.id e query params (?topic=payment&id=...)
    const topic = body?.type || params.get("type") || params.get("topic");
    const paymentId = body?.data?.id || params.get("data.id") || params.get("id");

    if (topic === "payment" && paymentId) {
      console.log("Processando pagamento:", paymentId);

      // Buscar detalhes do pagamento no Mercado Pago
      const isTest = mpSettings.mp_environment === 'test';
      const accessToken = isTest ? mpSettings.mp_test_access_token : mpSettings.mp_live_access_token;
      
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!paymentResponse.ok) {
        throw new Error("Erro ao buscar pagamento no Mercado Pago");
      }

      const payment = await paymentResponse.json();
      console.log("Detalhes do pagamento:", payment);

      const donationId = payment.external_reference;

      if (!donationId) {
        console.log("Pagamento sem external_reference, ignorando");
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mapear status do Mercado Pago para status da doação
      let donationStatus = "pending";

      if (payment.status === "approved") {
        donationStatus = "completed";
      } else if (payment.status === "rejected" || payment.status === "cancelled") {
        donationStatus = "failed";
      } else if (payment.status === "in_process" || payment.status === "pending") {
        donationStatus = "pending";
      } else if (payment.status === "refunded" || payment.status === "charged_back") {
        donationStatus = "refunded";
      }

      const updateData: any = {
        status: donationStatus,
        mp_payment_id: payment.id.toString(),
        mp_status: payment.status,
        mp_status_detail: payment.status_detail,
      };

      // Adicionar informações adicionais para pagamentos aprovados
      if (payment.status === "approved") {
        updateData.mp_payment_type = payment.payment_type_id;
        updateData.mp_transaction_amount = payment.transaction_amount;
      }

      console.log(`Webhook - Atualizando doação ${donationId}. Status MP: ${payment.status} -> Status Doação: ${donationStatus}`);

      const { error: updateError } = await supabase
        .from("donations")
        .update(updateData)
        .eq("id", donationId);

      if (updateError) {
        console.error(`Erro ao atualizar doação ${donationId}:`, updateError);
        throw new Error(`Erro ao atualizar doação: ${updateError.message}`);
      }

      console.log(`Doação ${donationId} atualizada com sucesso via webhook. Status: ${donationStatus}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Erro no webhook:", error);
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

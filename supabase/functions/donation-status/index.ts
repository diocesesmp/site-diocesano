import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { donationId, paymentIntentId } = await req.json();

    if (!donationId) {
      return new Response(JSON.stringify({ error: "donationId é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar configurações do Stripe
    const { data: stripeSettings, error: settingsError } = await supabase
      .from("stripe_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !stripeSettings?.secret_key) {
      console.error("Stripe settings not found or missing secret key");
    }

    // Buscar doação atual
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .select(
        `*, donation_campaigns(title, image_url)`
      )
      .eq("id", donationId)
      .maybeSingle();

    if (donationError) {
      throw donationError;
    }

    if (!donation) {
      return new Response(JSON.stringify({ error: "Doação não encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Se recebemos paymentIntentId, validar no Stripe e atualizar status como fallback
    if (paymentIntentId && stripeSettings?.secret_key) {
      try {
        const stripeRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
          headers: {
            Authorization: `Bearer ${stripeSettings.secret_key}`,
          },
        });
        const pi = await stripeRes.json();

        if (pi?.status === "succeeded") {
          await supabase
            .from("donations")
            .update({
              status: "completed",
              stripe_payment_intent_id: pi.id,
              stripe_charge_id: pi.latest_charge ?? null,
              receipt_url: pi.charges?.data?.[0]?.receipt_url ?? null,
            })
            .eq("id", donationId);
        }
      } catch (err) {
        console.error("Erro ao verificar PaymentIntent no Stripe:", err);
      }
    }

    // Buscar doação atualizada
    const { data: donationFinal, error: finalError } = await supabase
      .from("donations")
      .select(
        `*, donation_campaigns(title, image_url)`
      )
      .eq("id", donationId)
      .single();

    if (finalError) {
      throw finalError;
    }

    return new Response(JSON.stringify(donationFinal), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Erro na função donation-status:", error);
    return new Response(JSON.stringify({ error: error.message || "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
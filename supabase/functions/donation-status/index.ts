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
    const { donationId, paymentIntentId } = await req.json();

    if (!donationId) {
      throw new Error("Donation ID is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Se temos um payment intent ID, tenta sincronizar com o Stripe primeiro
    if (paymentIntentId) {
      const { data: stripeSettings } = await supabase
        .from("stripe_settings")
        .select("*")
        .limit(1)
        .single();

      if (stripeSettings) {
        const stripeSecretKey = stripeSettings.stripe_environment === 'test'
          ? stripeSettings.stripe_test_secret_key
          : stripeSettings.stripe_live_secret_key;

        if (stripeSecretKey) {
          try {
            // Buscar status do pagamento no Stripe
            const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
              headers: {
                "Authorization": `Bearer ${stripeSecretKey}`,
              },
            });

            if (response.ok) {
              const paymentIntent = await response.json();
              
              console.log("Payment Intent from Stripe:", paymentIntent.status);

              // Atualizar doação com base no status do Stripe
              if (paymentIntent.status === "succeeded") {
                const updateData: any = {
                  status: "completed",
                  stripe_payment_intent_id: paymentIntent.id,
                };

                if (paymentIntent.latest_charge) {
                  updateData.stripe_charge_id = paymentIntent.latest_charge;
                }

                if (paymentIntent.charges?.data?.[0]?.receipt_url) {
                  updateData.receipt_url = paymentIntent.charges.data[0].receipt_url;
                }

                await supabase
                  .from("donations")
                  .update(updateData)
                  .eq("id", donationId);

                console.log("Donation updated to completed");
              }
            }
          } catch (error) {
            console.error("Error syncing with Stripe:", error);
          }
        }
      }
    }

    // Buscar doação atualizada
    const { data: donation, error } = await supabase
      .from("donations")
      .select(`
        *,
        donation_campaigns (
          title,
          image_url
        )
      `)
      .eq("id", donationId)
      .single();

    if (error || !donation) {
      throw new Error("Donation not found");
    }

    return new Response(
      JSON.stringify(donation),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching donation status:", error);
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

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    const body = await req.text();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: stripeSettings, error: settingsError } = await supabase
      .from("stripe_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !stripeSettings) {
      throw new Error("Stripe settings not found");
    }

    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      throw new Error("Invalid JSON");
    }

    console.log("Webhook event received:", event.type);
    console.log("Event data:", JSON.stringify(event.data, null, 2));

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const donationId = paymentIntent.metadata?.donation_id;

        console.log("Payment Intent ID:", paymentIntent.id);
        console.log("Donation ID from metadata:", donationId);
        console.log("Latest charge:", paymentIntent.latest_charge);

        if (donationId) {
          const updateData: any = {
            status: "completed",
            stripe_payment_intent_id: paymentIntent.id,
          };

          if (paymentIntent.latest_charge) {
            updateData.stripe_charge_id = paymentIntent.latest_charge;
          }

          // Buscar receipt_url do charge
          if (paymentIntent.charges?.data && paymentIntent.charges.data.length > 0) {
            const charge = paymentIntent.charges.data[0];
            if (charge.receipt_url) {
              updateData.receipt_url = charge.receipt_url;
            }
          }

          const { data, error } = await supabase
            .from("donations")
            .update(updateData)
            .eq("id", donationId)
            .select();

          if (error) {
            console.error("Error updating donation:", error);
          } else {
            console.log("Donation marked as completed:", donationId, data);
          }
        } else {
          console.error("No donation_id found in payment intent metadata");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const donationId = paymentIntent.metadata.donation_id;

        if (donationId) {
          await supabase
            .from("donations")
            .update({
              status: "failed",
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq("id", donationId);

          console.log("Donation marked as failed:", donationId);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          await supabase
            .from("donations")
            .update({
              status: "refunded",
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          console.log("Donation marked as refunded:", paymentIntentId);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
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
    console.error("Webhook error:", error);
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

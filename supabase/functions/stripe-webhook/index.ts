import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const donationId = paymentIntent.metadata.donation_id;

        if (donationId) {
          await supabase
            .from("donations")
            .update({
              status: "completed",
              stripe_payment_intent_id: paymentIntent.id,
              stripe_charge_id: paymentIntent.latest_charge,
              receipt_url: paymentIntent.charges?.data[0]?.receipt_url || null,
            })
            .eq("id", donationId);

          console.log("Donation marked as completed:", donationId);
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

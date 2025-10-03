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
    const { amount, donationId, campaignId, campaignTitle, donorEmail, donorName, donorPhone, isTestMode } = await req.json();

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

    const stripeSecretKey = isTestMode
      ? stripeSettings.stripe_test_secret_key
      : stripeSettings.stripe_live_secret_key;

    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    // Ensure donation exists (create anonymously using service role if not provided)
    let donation_id = donationId;
    if (!donation_id) {
      if (!campaignId || !donorEmail || !donorName) {
        throw new Error("Missing required fields to create donation (campaignId, donorName, donorEmail)");
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
        throw new Error(donationError?.message || "Failed to create donation");
      }
      donation_id = donation.id;
    }

    const amountInCents = Math.round(amount * 100);

    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: "brl",
        "automatic_payment_methods[enabled]": "true",
        "metadata[donation_id]": donation_id,
        "metadata[campaign_id]": campaignId || "",
        "metadata[campaign_title]": campaignTitle || "",
        "metadata[donor_name]": donorName,
        "metadata[donor_email]": donorEmail,
        "metadata[donor_phone]": donorPhone || "",
        receipt_email: donorEmail,
        description: `Doação para ${campaignTitle} - ${donorName}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to create payment intent");
    }

    const paymentIntent = await response.json();

    // Update donation with payment intent id and mark as processing
    await supabase
      .from("donations")
      .update({ stripe_payment_intent_id: paymentIntent.id, status: "processing" })
      .eq("id", donation_id);

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret, donationId: donation_id }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
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

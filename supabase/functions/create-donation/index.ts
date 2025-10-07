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
    const { amount, campaignId, donorEmail, donorName, donorPhone } = body;

    console.log("Criando doa\u00e7\u00e3o:", { amount, campaignId, donorName });

    // Validar dados obrigatórios
    if (!amount || !campaignId || !donorEmail || !donorName || !donorPhone) {
      throw new Error("Dados obrigatórios ausentes: amount, campaignId, donorEmail, donorName, donorPhone");
    }

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

    // Buscar configura\u00e7\u00f5es do Mercado Pago
    const { data: mpSettings, error: settingsError } = await supabase
      .from("mercadopago_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (settingsError || !mpSettings) {
      console.error("Erro ao buscar configura\u00e7\u00f5es:", settingsError);
      throw new Error("Configura\u00e7\u00f5es do Mercado Pago n\u00e3o encontradas");
    }

    const isTestMode = mpSettings.mp_environment === 'test';
    const publicKey = isTestMode
      ? mpSettings.mp_test_public_key
      : mpSettings.mp_live_public_key;

    if (!publicKey) {
      throw new Error("Public key do Mercado Pago n\u00e3o configurado");
    }

    // Criar registro da doa\u00e7\u00e3o
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        campaign_id: campaignId,
        amount: Number(amount),
        donor_name: donorName,
        donor_email: donorEmail,
        donor_phone: donorPhone,
        status: "pending",
      })
      .select()
      .single();

    if (donationError) {
      console.error("Erro ao criar doa\u00e7\u00e3o:", donationError);
      throw new Error("Erro ao criar doa\u00e7\u00e3o");
    }

    console.log("Doa\u00e7\u00e3o criada:", donation.id);

    return new Response(
      JSON.stringify({
        donationId: donation.id,
        publicKey: publicKey,
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
    console.error("Erro ao criar doa\u00e7\u00e3o:", error);
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

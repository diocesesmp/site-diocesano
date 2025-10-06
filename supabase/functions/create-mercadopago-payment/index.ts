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
    const { amount, campaignId, campaignTitle, donorEmail, donorName, donorPhone, isTestMode } = await req.json();

    console.log("Creating Mercado Pago payment for:", { campaignId, amount, donorEmail });

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

    const accessToken = isTestMode
      ? mpSettings.mp_test_access_token
      : mpSettings.mp_live_access_token;

    if (!accessToken) {
      throw new Error("Access token do Mercado Pago não configurado");
    }

    // Criar doação anonimamente usando service role
    if (!campaignId || !donorEmail || !donorName) {
      throw new Error("Campos obrigatórios faltando (campaignId, donorName, donorEmail)");
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
      console.error("Erro ao criar doação:", donationError);
      throw new Error(donationError?.message || "Falha ao criar doação");
    }

    const donationId = donation.id;
    console.log("Doação criada com ID:", donationId);

    // Criar preferência de pagamento no Mercado Pago
    const preferenceData = {
      items: [
        {
          title: campaignTitle || "Doação",
          quantity: 1,
          unit_price: amount,
          currency_id: "BRL",
        }
      ],
      payer: {
        name: donorName,
        email: donorEmail,
        phone: {
          number: donorPhone?.replace(/\D/g, '') || ""
        }
      },
      back_urls: {
        success: `${req.headers.get("origin") || "https://diocesesmp.com.br"}/doacoes/obrigado?donation_id=${donationId}`,
        failure: `${req.headers.get("origin") || "https://diocesesmp.com.br"}/doacoes/obrigado?donation_id=${donationId}&status=failure`,
        pending: `${req.headers.get("origin") || "https://diocesesmp.com.br"}/doacoes/obrigado?donation_id=${donationId}&status=pending`,
      },
      auto_return: "approved",
      external_reference: donationId,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
      statement_descriptor: "DOACAO DIOCESE",
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro do Mercado Pago:", error);
      throw new Error(error.message || "Falha ao criar preferência de pagamento");
    }

    const preference = await response.json();
    console.log("Preferência criada:", preference.id);

    // Atualizar doação com ID da preferência
    await supabase
      .from("donations")
      .update({ 
        mp_preference_id: preference.id,
        status: "processing" 
      })
      .eq("id", donationId);

    return new Response(
      JSON.stringify({ 
        preferenceId: preference.id,
        initPoint: preference.init_point,
        donationId: donationId,
        publicKey: isTestMode ? mpSettings.mp_test_public_key : mpSettings.mp_live_public_key
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error);
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

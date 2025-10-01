import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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
    const { donationId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: donation, error } = await supabase
      .from("donations")
      .select(`
        *,
        donation_campaigns (
          title,
          description
        )
      `)
      .eq("id", donationId)
      .single();

    if (error || !donation) {
      throw new Error("Donation not found");
    }

    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #8b5cf6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #8b5cf6;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 5px 0 0 0;
    }
    .receipt-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
      font-weight: 500;
    }
    .info-value {
      color: #111827;
      font-weight: 600;
    }
    .amount {
      text-align: center;
      margin: 30px 0;
      padding: 30px;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border-radius: 12px;
      color: white;
    }
    .amount-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .amount-value {
      font-size: 48px;
      font-weight: bold;
      margin: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    .thank-you {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: #ecfdf5;
      border-radius: 8px;
      border: 1px solid #10b981;
    }
    .thank-you h2 {
      color: #065f46;
      margin: 0 0 10px 0;
    }
    .thank-you p {
      color: #047857;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Diocese de São Miguel Paulista</h1>
    <p>Comprovante de Doação</p>
  </div>

  <div class="thank-you">
    <h2>Obrigado pela sua generosidade!</h2>
    <p>Sua doação faz a diferença em nossa missão</p>
  </div>

  <div class="receipt-info">
    <div class="info-row">
      <span class="info-label">Campanha:</span>
      <span class="info-value">${donation.donation_campaigns.title}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Doador:</span>
      <span class="info-value">${donation.donor_name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">E-mail:</span>
      <span class="info-value">${donation.donor_email}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Telefone:</span>
      <span class="info-value">${donation.donor_phone}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Data:</span>
      <span class="info-value">${new Date(donation.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Código da Doação:</span>
      <span class="info-value">${donation.id}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Status:</span>
      <span class="info-value" style="color: #10b981;">${donation.status === 'completed' ? 'Concluída' : 'Pendente'}</span>
    </div>
  </div>

  <div class="amount">
    <div class="amount-label">Valor da Doação</div>
    <div class="amount-value">R$ ${donation.amount.toFixed(2)}</div>
  </div>

  <div class="footer">
    <p><strong>Diocese de São Miguel Paulista</strong></p>
    <p>Este é um comprovante digital de doação</p>
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>
</body>
</html>
    `;

    const pdfResponse = await fetch("https://api.html2pdf.app/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: receiptHTML,
        format: "A4",
        printBackground: true,
      }),
    });

    if (!pdfResponse.ok) {
      const htmlBytes = new TextEncoder().encode(receiptHTML);
      return new Response(htmlBytes, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="comprovante-doacao-${donationId}.html"`,
        },
      });
    }

    const pdfBlob = await pdfResponse.blob();

    return new Response(pdfBlob, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="comprovante-doacao-${donationId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating receipt:", error);
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    // 1. Validar token do webhook do Asaas para segurança
    const tokenHeader = req.headers.get("asaas-access-token");
    const expectedToken = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

    if (expectedToken && tokenHeader !== expectedToken) {
      console.error("Token de segurança do Asaas inválido ou não fornecido.");
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Conectar ao Supabase Client com a role de serviço para ignorar as políticas de RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const body = await req.json();
    const { event, payment, subscription } = body;

    console.log(`[Asaas Webhook] Evento recebido: ${event}`);

    let estId = payment?.externalReference || subscription?.externalReference;
    const customerId = payment?.customer || subscription?.customer;
    const subscriptionId = payment?.subscription || subscription?.id;

    // Se não temos a referência externa direta, tentamos buscar pelo subscription ID ou pelo customer ID
    if (!estId) {
      if (subscriptionId) {
        const { data } = await supabase
          .from("estabelecimentos")
          .select("id")
          .eq("billing_subscription_id", subscriptionId)
          .maybeSingle();
        if (data) estId = data.id;
      }
      
      if (!estId && customerId) {
        const { data } = await supabase
          .from("estabelecimentos")
          .select("id")
          .eq("billing_customer_id", customerId)
          .maybeSingle();
        if (data) estId = data.id;
      }
    }

    if (!estId) {
      console.warn("[Asaas Webhook] Estabelecimento não identificado para o payload:", JSON.stringify(body));
      return new Response(JSON.stringify({ error: "Estabelecimento não encontrado" }), { status: 400 });
    }

    console.log(`[Asaas Webhook] Estabelecimento identificado: ${estId}`);

    // 3. Processar o evento
    switch (event) {
      case "PAYMENT_RECEIVED":
      case "PAYMENT_CONFIRMED": {
        // Promover para premium / ativo
        const updateData: any = {
          status_assinatura: "ativo",
          plano: "premium"
        };
        if (customerId) updateData.billing_customer_id = customerId;
        if (subscriptionId) updateData.billing_subscription_id = subscriptionId;

        const { error } = await supabase
          .from("estabelecimentos")
          .update(updateData)
          .eq("id", estId);

        if (error) throw error;
        console.log(`[Asaas Webhook] Estabelecimento ${estId} atualizado para PREMIUM/ATIVO.`);
        break;
      }

      case "PAYMENT_OVERDUE": {
        // Pagamento atrasado -> suspende conta
        const { error } = await supabase
          .from("estabelecimentos")
          .update({ status_assinatura: "suspenso" })
          .eq("id", estId);

        if (error) throw error;
        console.log(`[Asaas Webhook] Estabelecimento ${estId} suspenso por atraso de pagamento.`);
        break;
      }

      case "SUBSCRIPTION_DELETED":
      case "SUBSCRIPTION_INACTIVATED": {
        // Assinatura deletada/inativada -> cancelada e volta para básico
        const { error } = await supabase
          .from("estabelecimentos")
          .update({ 
            status_assinatura: "cancelado",
            plano: "basico"
          })
          .eq("id", estId);

        if (error) throw error;
        console.log(`[Asaas Webhook] Assinatura do Estabelecimento ${estId} cancelada. Retornado ao plano básico.`);
        break;
      }

      case "PAYMENT_REFUNDED":
      case "PAYMENT_CHARGEBACK_REQUESTED": {
        // Reembolso ou chargeback -> suspende acesso
        const { error } = await supabase
          .from("estabelecimentos")
          .update({ status_assinatura: "suspenso" })
          .eq("id", estId);

        if (error) throw error;
        console.log(`[Asaas Webhook] Estabelecimento ${estId} suspenso devido a reembolso/chargeback.`);
        break;
      }

      default:
        console.log(`[Asaas Webhook] Evento não mapeado ignorado: ${event}`);
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("[Asaas Webhook] Erro ao processar webhook:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
})

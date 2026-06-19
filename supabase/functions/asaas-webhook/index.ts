// Edge Function: asaas-webhook
// Recebe eventos do Asaas e atualiza o status da assinatura no banco.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const event = await req.json()

    const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY')!
    const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!

    const supabase = createClient(SUPABASE_URL, SB_SERVICE_ROLE_KEY)

    const { event: eventType, payment } = event

    if (!payment?.customer) {
      return new Response('ok', { status: 200 })
    }

    const { data: estab } = await supabase
      .from('estabelecimentos')
      .select('id, plano')
      .eq('billing_customer_id', payment.customer)
      .maybeSingle()

    if (!estab) {
      return new Response('Estabelecimento nao encontrado', { status: 200 })
    }

    let novoStatus = null

    switch (eventType) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        novoStatus = 'ativo'
        break
      case 'PAYMENT_OVERDUE':
        novoStatus = 'suspenso'
        break
      case 'PAYMENT_DELETED':
      case 'SUBSCRIPTION_INACTIVATED':
        novoStatus = 'cancelado'
        break
    }

    if (novoStatus) {
      await supabase
        .from('estabelecimentos')
        .update({ status_assinatura: novoStatus })
        .eq('id', estab.id)
    }

    return new Response('ok', { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response('error', { status: 500 })
  }
})

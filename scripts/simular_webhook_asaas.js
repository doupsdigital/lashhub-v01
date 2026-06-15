/**
 * UTILITÁRIO DE SIMULAÇÃO DE WEBHOOK ASAAS
 * 
 * Este script permite simular a recepção de eventos do Asaas (como pagamento recebido e atrasado)
 * diretamente no banco de dados Supabase do projeto, simulando o comportamento da Edge Function.
 * 
 * Uso:
 *   node scripts/simular_webhook_asaas.js [evento] [estabelecimento_slug]
 * 
 * Eventos suportados:
 *   - active: Ativa a assinatura Premium do estúdio
 *   - suspend: Suspende a assinatura do estúdio (inadimplência)
 *   - cancel: Cancela a assinatura e retorna ao plano Básico
 *   - trial-expired: Expira o período de testes grátis (define trial_ends_at no passado)
 */

import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'db.agcfngaegopeyutjgncl.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'b20eoCxsSlhpHwHQ',
  ssl: {
    rejectUnauthorized: false
  }
});

const args = process.argv.slice(2);
const event = args[0] || 'active';
const slug = args[1] || 'brunalash';

async function run() {
  try {
    console.log(`\n=== Iniciando Simulação de Webhook Asaas ===`);
    console.log(`Evento: ${event.toUpperCase()}`);
    console.log(`Estúdio (slug): ${slug}`);
    
    await client.connect();
    console.log('Conectado ao Supabase!');

    // Buscar o estabelecimento correspondente ao slug
    const resEst = await client.query('SELECT id, nome_negocio, plano, status_assinatura FROM public.estabelecimentos WHERE slug = $1', [slug]);
    
    if (resEst.rows.length === 0) {
      console.error(`Erro: Estabelecimento com slug "${slug}" não encontrado.`);
      return;
    }

    const est = resEst.rows[0];
    console.log(`Estabelecimento encontrado: ${est.nome_negocio} (ID: ${est.id})`);

    let query = '';
    let params = [];

    switch (event) {
      case 'active':
        console.log('Simulando pagamento recebido/confirmado no Asaas...');
        query = `
          UPDATE public.estabelecimentos 
          SET status_assinatura = 'ativo', plano = 'premium', billing_subscription_id = $1, billing_customer_id = $2
          WHERE id = $3
        `;
        params = ['sub_simulated_cli_' + Date.now(), 'cus_simulated_cli_' + Date.now(), est.id];
        break;

      case 'suspend':
        console.log('Simulando cobrança vencida/inadimplente no Asaas...');
        query = `
          UPDATE public.estabelecimentos 
          SET status_assinatura = 'suspenso'
          WHERE id = $1
        `;
        params = [est.id];
        break;

      case 'cancel':
        console.log('Simulando cancelamento de assinatura no Asaas...');
        query = `
          UPDATE public.estabelecimentos 
          SET status_assinatura = 'cancelado', plano = 'basico'
          WHERE id = $1
        `;
        params = [est.id];
        break;

      case 'trial-expired':
        console.log('Simulando expiração de período de testes (14 dias)...');
        query = `
          UPDATE public.estabelecimentos 
          SET status_assinatura = 'trial', trial_ends_at = now() - INTERVAL '1 day'
          WHERE id = $1
        `;
        params = [est.id];
        break;

      default:
        console.error('Evento inválido. Use: active, suspend, cancel ou trial-expired');
        return;
    }

    await client.query(query, params);
    console.log(`Sucesso! Banco de dados atualizado.`);
    
    // Consultar o status atualizado
    const resUpdated = await client.query('SELECT plano, status_assinatura, trial_ends_at FROM public.estabelecimentos WHERE id = $1', [est.id]);
    console.log('\nStatus atual no banco:');
    console.log(resUpdated.rows[0]);
    console.log(`============================================\n`);

  } catch (err) {
    console.error('Erro na simulação:', err.message);
    console.log('\nCaso esteja sem conexão direta com o banco na sua máquina,');
    console.log('você pode rodar a seguinte instrução SQL no painel do Supabase:\n');
    
    if (event === 'suspend') {
      console.log(`UPDATE estabelecimentos SET status_assinatura = 'suspenso' WHERE slug = '${slug}';`);
    } else if (event === 'active') {
      console.log(`UPDATE estabelecimentos SET status_assinatura = 'ativo', plano = 'premium' WHERE slug = '${slug}';`);
    } else if (event === 'trial-expired') {
      console.log(`UPDATE estabelecimentos SET status_assinatura = 'trial', trial_ends_at = now() - INTERVAL '1 day' WHERE slug = '${slug}';`);
    }
  } finally {
    await client.end();
  }
}

run();

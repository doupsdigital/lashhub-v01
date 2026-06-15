-- =========================================================================
-- MIGRATION: ETAPA 5 - SUPABASE / ASAAS INTEGRATION & BILLING
-- =========================================================================

-- 1. Adicionar colunas extras na tabela de estabelecimentos
ALTER TABLE public.estabelecimentos 
  ADD COLUMN IF NOT EXISTS billing_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS billing_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- 2. Atualizar estabelecimentos existentes para garantir que possuam trial_ends_at configurado e plano premium no trial
UPDATE public.estabelecimentos 
SET 
  trial_ends_at = COALESCE(created_at, now()) + INTERVAL '14 days',
  plano = CASE WHEN status_assinatura = 'trial' THEN 'premium' ELSE plano END
WHERE trial_ends_at IS NULL OR status_assinatura = 'trial';

-- 3. Atualizar a função do trigger handle_new_user_onboarding para incluir o trial_ends_at de 14 dias
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS TRIGGER AS $$
DECLARE
  new_est_id UUID;
  negocio_nome TEXT;
  negocio_slug TEXT;
  user_role TEXT;
  client_uuid UUID;
BEGIN
  -- Extrair dados dos metadados fornecidos no cadastro (options.data)
  negocio_nome := new.raw_user_meta_data ->> 'nome_negocio';
  negocio_slug := new.raw_user_meta_data ->> 'slug';
  user_role := COALESCE(new.raw_user_meta_data ->> 'role', 'profissional');

  IF user_role = 'profissional' AND negocio_nome IS NOT NULL THEN
    -- 1. Criar o estabelecimento para a profissional com trial de 14 dias
    INSERT INTO public.estabelecimentos (nome_negocio, slug, plano, status_assinatura, trial_ends_at)
    VALUES (
      negocio_nome, 
      COALESCE(negocio_slug, lower(regexp_replace(negocio_nome, '[^a-zA-Z0-9]', '', 'g'))), 
      'premium', 
      'trial',
      now() + INTERVAL '14 days'
    )
    RETURNING id INTO new_est_id;

    -- 2. Vincular o usuário como profissional do estabelecimento recém-criado
    INSERT INTO public.usuarios (id, nome, email, role, estabelecimento_id)
    VALUES (new.id, negocio_nome, new.email, 'profissional', new_est_id);

    -- 3. Criar uma linha de configurações básicas padrão para este negócio
    INSERT INTO public.configuracao_negocio (estabelecimento_id, nome_negocio)
    VALUES (new_est_id, negocio_nome);

  ELSIF user_role = 'cliente' THEN
    -- Se for um cliente final cadastrando-se no portal
    client_uuid := (new.raw_user_meta_data ->> 'cliente_id')::UUID;
    
    INSERT INTO public.usuarios (id, nome, email, role, cliente_id, estabelecimento_id)
    VALUES (
      new.id,
      new.raw_user_meta_data ->> 'nome',
      new.email,
      'cliente',
      client_uuid,
      (new.raw_user_meta_data ->> 'estabelecimento_id')::UUID
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Garantir que a trigger está associada ao auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_onboarding();

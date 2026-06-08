import { supabase } from '../lib/supabase';

let currentUsuarioNome = 'Usuário do Sistema';

export const setCurrentUsuarioNome = (nome: string) => {
  currentUsuarioNome = nome;
};

export const registrarLog = async (
  acao: 'criou' | 'editou' | 'excluiu',
  entidade: string,
  entidadeId: string,
  descricao: string
) => {
  try {
    await supabase.from('logs').insert({
      usuario_nome: currentUsuarioNome,
      acao,
      entidade,
      entidade_id: entidadeId,
      descricao
    });
  } catch (err) {
    console.error('Erro ao registrar log de atividade:', err);
  }
};


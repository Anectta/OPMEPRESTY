import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://saohsjengdaepsaporwz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bTMcc3Cn8TSgEEM1ykIazQ_uA2AuWXZ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const email = 'anectta@anectta.com.br';
  const password = 'Ant102030!#';
  const nome = 'Administrador Anectta';

  console.log(`Verificando/Criando usuário: ${email}...`);

  // 1. Tenta login para ver se já existe
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInData?.user) {
    console.log('✅ Usuário já existe e login validado com sucesso!');
    const userId = signInData.user.id;

    // Atualiza profile e user_role
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      nome,
      cargo: 'Administrador Geral',
    });

    await supabase.from('user_roles').upsert({
      user_id: userId,
      role: 'admin',
    });

    console.log('✅ Perfil e permissão de admin sincronizados no Supabase!');
    return;
  }

  // 2. Se não existir, faz signUp
  console.log('Criando novo usuário via signUp...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome },
    },
  });

  if (signUpError) {
    console.error('❌ Erro no signUp:', signUpError.message);
    return;
  }

  console.log('✅ Usuário criado com sucesso no Supabase Auth:', signUpData.user?.id);

  if (signUpData.user?.id) {
    const userId = signUpData.user.id;
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      nome,
      cargo: 'Administrador Geral',
    });

    await supabase.from('user_roles').upsert({
      user_id: userId,
      role: 'admin',
    });

    console.log('✅ Perfil e permissão de admin atribuídos!');
  }
}

main().catch(console.error);

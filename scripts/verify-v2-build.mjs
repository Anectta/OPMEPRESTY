/**
 * verify-v2-build.mjs
 * Verifica se o build V2.0 compila corretamente e relata problemas
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

console.log('=== VERIFICAÇÃO BUILD V2.0 ===\n');

// 1. Verificar arquivos esperados
const expectedFiles = [
  'src/types.ts',
  'src/App.tsx',
  'src/lib/utils.ts',
  'src/lib/auth-context.tsx',
  'src/hooks/useData.ts',
  'src/services/databaseService.ts',
  'src/components/AppLayout.tsx',
  'src/components/dashboard/ExecutiveDashboard.tsx',
  'src/components/protocolos/ProtocolosOPME.tsx',
  'src/components/autorizacoes/AutorizacoesOPME.tsx',
  'src/components/mapa/MapaCirurgico.tsx',
  'src/components/estoque/GestaoEstoque.tsx',
  'src/components/equipamentos/GestaoEquipamentos.tsx',
  'src/components/logistica/GestaoLogistica.tsx',
  'src/components/logistica/GestaoRotas.tsx',
  'src/components/torre/TorreControle.tsx',
  'src/components/cadastros/CadastrosAuxiliares.tsx',
  'src/components/admin/GestaoUsuarios.tsx',
  'src/components/admin/AuditLogsView.tsx',
  'src/components/admin/ConfiguracoesSistema.tsx',
  'supabase/migrations/20261001000001_opme_v2_schema.sql',
  'supabase/migrations/20261001000002_seed_excel_data_v2.sql',
];

console.log('📁 Verificando arquivos...');
let missingFiles = [];
expectedFiles.forEach(f => {
  const fullPath = join(ROOT, f);
  if (existsSync(fullPath)) {
    console.log(`  ✅ ${f}`);
  } else {
    console.log(`  ❌ AUSENTE: ${f}`);
    missingFiles.push(f);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n⚠️  ${missingFiles.length} arquivo(s) ausente(s)!`);
}

// 2. Verificar tipos proibidos no types.ts
const fs = await import('fs');
const typesContent = fs.readFileSync(join(ROOT, 'src/types.ts'), 'utf8');
const forbiddenTypes = ['valor_custo', 'valor_venda', 'valor_total', 'preco', 'comissao', 'margem', 'financeiro'];
console.log('\n🚫 Verificando campos financeiros proibidos em types.ts...');
forbiddenTypes.forEach(f => {
  if (typesContent.toLowerCase().includes(f.toLowerCase())) {
    console.log(`  ❌ CAMPO PROIBIDO ENCONTRADO: ${f}`);
  } else {
    console.log(`  ✅ Sem ${f}`);
  }
});

// 3. Build TypeScript
console.log('\n🔨 Executando build TypeScript...');
try {
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n✅ BUILD SUCESSO! Projeto V2.0 compilado sem erros.');
} catch (err) {
  console.log('\n❌ BUILD COM ERROS — verifique os erros acima e corrija.');
  process.exit(1);
}

// 4. Executar testes
console.log('\n🧪 Executando testes...');
try {
  execSync('npm test', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n✅ TESTES PASSANDO!');
} catch (err) {
  console.log('\n⚠️  Alguns testes falharam. Revise os erros acima.');
}

console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');

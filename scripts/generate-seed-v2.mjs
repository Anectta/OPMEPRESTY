/**
 * generate-seed-v2.mjs
 * Generates SQL seed files from the Excel attachment data
 * for the OPME V2.0 migration schema
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXCEL_PATH = 'C:/Users/Amoroso/.gemini/antigravity/brain/b71c660d-2fcc-4274-8751-b971e15a4f1a/.user_uploaded/media_1790909372064.xlsx';

// Helper: escape SQL string
const esc = (s) => {
  if (s == null || s === '') return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
};

// Helper: Excel serial date to YYYY-MM-DD
const excelDateToISO = (serial) => {
  if (!serial || isNaN(serial)) return null;
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return date.toISOString().split('T')[0];
};

// Map status from Excel Observacao to V2.0 status
const mapObsToStatus = (obs) => {
  switch ((obs || '').trim().toUpperCase()) {
    case 'AUTORIZADO': return 'AUTORIZADO';
    case 'NAO AUTORIZADO': return 'CANCELADO';
    case 'SOB CONSIGNACAO': return 'AUTORIZADO'; // consignado é característica do material, não do protocolo
    default: return 'AGUARDANDO_AUTORIZACAO';
  }
};

// Map Tipo Saida to readable
const mapTipoSaida = (tipo) => {
  switch (String(tipo || '').trim()) {
    case '660': return 'ENTREGA';
    case '501': return 'CONSIGNACAO';
    case '666': return 'RETIRADA';
    default: return 'ENTREGA';
  }
};

console.log('Reading Excel file...');
const wb = XLSX.readFile(EXCEL_PATH);
const base = XLSX.utils.sheet_to_json(wb.Sheets['BASE']);
console.log(`Total rows in BASE: ${base.length}`);

// ===================================================================
// 1. EXTRACT UNIQUE LOOKUP DATA
// ===================================================================
const hospitalsSet = new Set();
const medicosSet = new Set();
const vendedoresSet = new Set();
const procedimentosSet = new Set();
const produtosMap = {};
const conveniosSet = new Set(); // from Cliente field codes
const protocolosMap = {};

base.forEach(row => {
  if (row['Nome']) hospitalsSet.add(row['Nome'].trim());
  if (row['Medico']) medicosSet.add(row['Medico'].trim());
  if (row['Nome Vend']) vendedoresSet.add(row['Nome Vend'].trim());
  if (row['Procedimento']) procedimentosSet.add(row['Procedimento'].trim());
  if (row['Cliente']) conveniosSet.add(row['Cliente'].trim());
  
  if (row['Produto'] && row['Descricao']) {
    produtosMap[row['Produto'].trim()] = row['Descricao'].trim();
  }
  
  const num = String(row['Numero'] || '').trim();
  if (!num) return;
  
  if (!protocolosMap[num]) {
    protocolosMap[num] = {
      numero: num,
      hospital_nome: (row['Nome'] || '').trim(),
      medico_nome: (row['Medico'] || '').trim(),
      paciente: (row['Paciente'] || '').trim(),
      convenio_codigo: (row['Cliente'] || '').trim(),
      procedimento: (row['Procedimento'] || '').trim(),
      vendedor_nome: (row['Nome Vend'] || '').trim(),
      observacao: (row['Observacao'] || '').trim(),
      dt_emissao: row['DT Emissao'],
      dt_cirurgia: row['Dt. Cirurgia'],
      dt_entrega: row['Dt.Entrega'],
      tipo_saida: row['Tipo Saida'],
      itens: [],
    };
  }
  
  protocolosMap[num].itens.push({
    numero_it: (row['Numero It'] || '').trim(),
    produto_codigo: (row['Produto'] || '').trim(),
    descricao: (row['Descricao'] || '').trim(),
    quantidade: Number(row['Quantidade'] || 1),
    indicacao: (row['Indicacao'] || '').trim(),
    motivo_canc: (row['Motivo Canc'] || '').trim(),
    comentarios: (row['Comentarios'] || '').trim(),
  });
});

const hospitals = [...hospitalsSet].sort();
const medicos = [...medicosSet].sort();
const vendedores = [...vendedoresSet].sort();
const procedimentos = [...procedimentosSet].sort();
const protocolos = Object.values(protocolosMap);

console.log(`Unique: hospitals=${hospitals.length}, medicos=${medicos.length}, vendedores=${vendedores.length}, procedimentos=${procedimentos.length}`);
console.log(`Products: ${Object.keys(produtosMap).length}, Protocolos: ${protocolos.length}`);

// ===================================================================
// 2. GENERATE SEED SQL
// ===================================================================
let sql = `-- =====================================================================
-- OPME V2.0 - SEED DATA FROM EXCEL IMPORT
-- Generated: ${new Date().toISOString()}
-- Source: BASE sheet with ${base.length} rows → ${protocolos.length} protocolos únicos
-- =====================================================================

-- Disable triggers for faster import
SET session_replication_role = replica;

-- ===================================================================
-- SEED: HOSPITAIS (${hospitals.length} registros)
-- ===================================================================
INSERT INTO public.hospitais (nome, ativo) VALUES
`;

sql += hospitals.slice(0, 112).map(h => 
  `  (${esc(h)}, TRUE)`
).join(',\n');
sql += `\nON CONFLICT (nome) DO NOTHING;\n\n`;

// ===================================================================
// SEED: MEDICOS
// ===================================================================
sql += `-- ===================================================================
-- SEED: MEDICOS (${medicos.length} registros)
-- ===================================================================
INSERT INTO public.medicos (nome, crm, especialidade, ativo) VALUES
`;
sql += medicos.slice(0, 200).map((m, i) => 
  `  (${esc(m)}, ${esc(`CRM-${100000 + i}`)}, 'Cirurgia', TRUE)`
).join(',\n');
sql += `\nON CONFLICT DO NOTHING;\n\n`;

// ===================================================================
// SEED: VENDEDORES
// ===================================================================
sql += `-- ===================================================================
-- SEED: VENDEDORES (${vendedores.length} registros)
-- ===================================================================
INSERT INTO public.vendedores (nome, email, ativo) VALUES
`;
sql += vendedores.map((v, i) => {
  const email = v.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/, '') + `@opme.com.br`;
  return `  (${esc(v)}, ${esc(email)}, TRUE)`;
}).join(',\n');
sql += `\nON CONFLICT DO NOTHING;\n\n`;

// ===================================================================
// SEED: PROCEDIMENTOS
// ===================================================================
sql += `-- ===================================================================
-- SEED: PROCEDIMENTOS (${procedimentos.length} registros)
-- ===================================================================
INSERT INTO public.procedimentos (codigo, descricao, especialidade, ativo) VALUES
`;
sql += procedimentos.map((p, i) => 
  `  (${esc(`PROC-${String(i+1).padStart(3,'0')}`)}, ${esc(p)}, 'Cirurgia', TRUE)`
).join(',\n');
sql += `\nON CONFLICT DO NOTHING;\n\n`;

// ===================================================================
// SEED: PRODUTOS (MATERIAIS OPME)
// ===================================================================
const produtosEntries = Object.entries(produtosMap).slice(0, 200);
sql += `-- ===================================================================
-- SEED: PRODUTOS/MATERIAIS OPME (${produtosEntries.length} registros)
-- ===================================================================
INSERT INTO public.produtos (codigo, descricao, categoria, unidade, ativo) VALUES
`;
sql += produtosEntries.map(([codigo, descricao]) => 
  `  (${esc(codigo)}, ${esc(descricao)}, 'OPME', 'UN', TRUE)`
).join(',\n');
sql += `\nON CONFLICT (codigo) DO NOTHING;\n\n`;

// ===================================================================
// SEED: PROTOCOLOS OPME (agrupados)
// ===================================================================
const BATCH_SIZE = 100;

sql += `-- ===================================================================
-- SEED: PROTOCOLOS OPME (${protocolos.length} registros)
-- ===================================================================
-- Using a function to resolve FKs by name
DO $$
DECLARE
  v_prot_id UUID;
  v_hosp_id UUID;
  v_med_id UUID;
  v_vend_id UUID;
  v_proc_id UUID;
BEGIN
`;

// Generate first 500 protocolos in PL/pgSQL
protocolos.slice(0, 500).forEach((prot, idx) => {
  const status = mapObsToStatus(prot.observacao);
  const dtEmissao = excelDateToISO(prot.dt_emissao);
  const dtCirurgia = excelDateToISO(prot.dt_cirurgia) || excelDateToISO(prot.dt_entrega);
  const numero_it = prot.numero;
  
  sql += `
  -- Protocolo ${idx + 1}: ${numero_it}
  SELECT id INTO v_hosp_id FROM public.hospitais WHERE nome = ${esc(prot.hospital_nome)} LIMIT 1;
  SELECT id INTO v_med_id FROM public.medicos WHERE nome = ${esc(prot.medico_nome)} LIMIT 1;
  SELECT id INTO v_vend_id FROM public.vendedores WHERE nome = ${esc(prot.vendedor_nome)} LIMIT 1;
  SELECT id INTO v_proc_id FROM public.procedimentos WHERE descricao = ${esc(prot.procedimento)} LIMIT 1;
  
  INSERT INTO public.protocolos_opme (
    numero_it, numero_protocolo, hospital_id, hospital_nome,
    medico_id, medico_nome, paciente, procedimento_id, procedimento_nome,
    vendedor_id, vendedor_nome, status, observacoes, data_protocolo${dtCirurgia ? ', data_cirurgia' : ''}
  ) VALUES (
    ${esc(numero_it)}, ${esc(`PROT-${numero_it}`)}, v_hosp_id, ${esc(prot.hospital_nome)},
    v_med_id, ${esc(prot.medico_nome)}, ${esc(prot.paciente)}, v_proc_id, ${esc(prot.procedimento)},
    v_vend_id, ${esc(prot.vendedor_nome)}, ${esc(status)}, ${esc(prot.observacao)},
    ${dtEmissao ? esc(dtEmissao) : 'CURRENT_DATE'}${dtCirurgia ? `, ${esc(dtCirurgia)}` : ''}
  ) ON CONFLICT (numero_it) DO NOTHING
  RETURNING id INTO v_prot_id;
`;

  // Add itens for this protocolo
  prot.itens.forEach(item => {
    if (!item.produto_codigo) return;
    sql += `
  IF v_prot_id IS NOT NULL THEN
    INSERT INTO public.protocolo_itens (
      protocolo_id, numero_it, produto_codigo, descricao_produto,
      quantidade, indicacao
    ) VALUES (
      v_prot_id, ${esc(item.numero_it)}, ${esc(item.produto_codigo)}, ${esc(item.descricao)},
      ${item.quantidade}, ${esc(item.indicacao)}
    ) ON CONFLICT DO NOTHING;
  END IF;
`;
  });
});

sql += `
END $$;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Summary counts
SELECT 'hospitais' as tabela, COUNT(*) as total FROM public.hospitais
UNION ALL SELECT 'medicos', COUNT(*) FROM public.medicos  
UNION ALL SELECT 'vendedores', COUNT(*) FROM public.vendedores
UNION ALL SELECT 'procedimentos', COUNT(*) FROM public.procedimentos
UNION ALL SELECT 'produtos', COUNT(*) FROM public.produtos
UNION ALL SELECT 'protocolos_opme', COUNT(*) FROM public.protocolos_opme
UNION ALL SELECT 'protocolo_itens', COUNT(*) FROM public.protocolo_itens;
`;

const seedPath = join(__dirname, '..', 'supabase', 'migrations', '20261001000002_seed_excel_data_v2.sql');
writeFileSync(seedPath, sql, 'utf8');
console.log(`\n✅ Seed SQL generated: ${seedPath}`);
console.log(`   Total SQL size: ${(sql.length / 1024).toFixed(1)} KB`);

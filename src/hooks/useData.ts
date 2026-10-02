import { useState, useEffect, useCallback } from 'react';
import {
  Cirurgia,
  Protocolo,
  Produto,
  ProdutoLote,
  MovimentoEstoque,
  Venda,
  Veiculo,
  Condutor,
  ChecklistFrota,
  Hospital,
  Medico,
  Convenio,
  Vendedor,
} from '../types';
import {
  hospitaisService,
  medicosService,
  conveniosService,
  vendedoresService,
  cirurgiasService,
  protocolosService,
  produtosService,
  estoqueService,
  vendasService,
  frotaService,
} from '../services/databaseService';
import { IS_SUPABASE_CONFIGURED } from '../lib/supabase/client';

// Baseline fallback data for immediate render & seeding
const INITIAL_HOSPITAIS: Hospital[] = [
  { id: 'a1000000-0000-0000-0000-000000000001', nome: 'Hospital Israelita Albert Einstein', cnpj: '60.765.823/0001-30', cidade: 'São Paulo', estado: 'SP', contato: 'Centro Cirúrgico OPME - (11) 2151-1234', ativo: true },
  { id: 'a1000000-0000-0000-0000-000000000002', nome: 'Hospital Sírio-Libanês', cnpj: '62.970.389/0001-15', cidade: 'São Paulo', estado: 'SP', contato: 'Farmácia Satélite OPME - (11) 3394-5000', ativo: true },
  { id: 'a1000000-0000-0000-0000-000000000003', nome: 'HCor - Hospital do Coração', cnpj: '60.884.855/0001-54', cidade: 'São Paulo', estado: 'SP', contato: 'Almoxarifado Consignado - (11) 3053-6600', ativo: true },
  { id: 'a1000000-0000-0000-0000-000000000004', nome: 'Hospital Alemão Oswaldo Cruz', cnpj: '60.884.111/0001-20', cidade: 'São Paulo', estado: 'SP', contato: 'SAD / Bloco Cirúrgico - (11) 3549-1000', ativo: true },
];

const INITIAL_MEDICOS: Medico[] = [
  { id: 'b1000000-0000-0000-0000-000000000001', nome: 'Dr. Roberto Silva Mendes', crm: '145892', uf_crm: 'SP', especialidade: 'Cirurgia da Coluna e Joelho', telefone: '(11) 99123-4455', email: 'roberto.mendes@medicos.com.br', ativo: true },
  { id: 'b1000000-0000-0000-0000-000000000002', nome: 'Dra. Patricia Alencar', crm: '178920', uf_crm: 'SP', especialidade: 'Artroplastia de Quadril', telefone: '(11) 98877-6655', email: 'patricia.alencar@ortopedia.com.br', ativo: true },
  { id: 'b1000000-0000-0000-0000-000000000003', nome: 'Dr. Fernando Vasconcelos', crm: '123410', uf_crm: 'SP', especialidade: 'Traumatologia Complexa', telefone: '(11) 97111-2233', email: 'f.vasconcelos@trauma.com.br', ativo: true },
];

const INITIAL_CONVENIOS: Convenio[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', nome: 'Bradesco Saúde', ans_codigo: '005711', ativo: true },
  { id: 'c1000000-0000-0000-0000-000000000002', nome: 'SulAmérica Saúde', ans_codigo: '006246', ativo: true },
  { id: 'c1000000-0000-0000-0000-000000000003', nome: 'Amil Assistência Médica', ans_codigo: '326305', ativo: true },
  { id: 'c1000000-0000-0000-0000-000000000004', nome: 'Porto Seguro Saúde', ans_codigo: '000582', ativo: true },
];

const INITIAL_VENDEDORES: Vendedor[] = [
  { id: 'd1000000-0000-0000-0000-000000000001', nome: 'Lucas Guimarães', email: 'lucas.g@prestymedick.com.br', comissao_padrao_pct: 6.0, ativo: true },
  { id: 'd1000000-0000-0000-0000-000000000002', nome: 'Mariana Duarte', email: 'mariana.d@prestymedick.com.br', comissao_padrao_pct: 5.5, ativo: true },
  { id: 'd1000000-0000-0000-0000-000000000003', nome: 'Rodrigo Santoro', email: 'rodrigo.s@prestymedick.com.br', comissao_padrao_pct: 5.0, ativo: true },
];

const INITIAL_CIRURGIAS: Cirurgia[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    data: new Date().toISOString().split('T')[0],
    horario: '08:00',
    hospital_id: 'a1000000-0000-0000-0000-000000000001',
    hospital_nome: 'Hospital Israelita Albert Einstein',
    medico_id: 'b1000000-0000-0000-0000-000000000001',
    medico_nome: 'Dr. Roberto Silva Mendes',
    paciente: 'Maria das Graças Oliveira',
    paciente_cpf: '234.567.890-11',
    convenio_id: 'c1000000-0000-0000-0000-000000000001',
    convenio_nome: 'Bradesco Saúde',
    vendedor_id: 'd1000000-0000-0000-0000-000000000001',
    vendedor_nome: 'Lucas Guimarães',
    situacao: 'Confirmada',
    equipamento: 'Motor Cirúrgico Stryker TPS',
    acessorio: 'Caixa de Brocas de Coluna',
    ld_ct: 'Liberado com Autorização Guia nº 883921',
    material_previsto: 'Kit Gaiola Cervical PEEK + Parafusos Pediculares Titanium',
    tecnico_nome: 'André Santos (Técnico Instrumentador OPME)',
    observacao: 'Caixas entregues na farmácia central 24h antes para esterilização.',
    empresa_id: 'a0000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    data: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    horario: '10:30',
    hospital_id: 'a1000000-0000-0000-0000-000000000002',
    hospital_nome: 'Hospital Sírio-Libanês',
    medico_id: 'b1000000-0000-0000-0000-000000000002',
    medico_nome: 'Dra. Patricia Alencar',
    paciente: 'Carlos Eduardo Fontes',
    paciente_cpf: '456.789.012-33',
    convenio_id: 'c1000000-0000-0000-0000-000000000002',
    convenio_nome: 'SulAmérica Saúde',
    vendedor_id: 'd1000000-0000-0000-0000-000000000002',
    vendedor_nome: 'Mariana Duarte',
    situacao: 'Agendada',
    equipamento: 'Arthrocare Coblator II',
    acessorio: 'Ponteira de Radiofrequência',
    ld_ct: 'Com Termo de Faturamento Direto',
    material_previsto: 'Prótese Total de Quadril Ceramica/Polietileno Crosslinked',
    tecnico_nome: 'Felipe Neves (Técnico)',
    observacao: 'Verificar lote de hastes femorais nº 11 e 12 no estoque.',
    empresa_id: 'a0000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_PRODUTOS: Produto[] = [
  {
    id: 'f1000000-0000-0000-0000-000000000001',
    codigo: 'OPME-COL-001',
    descricao: 'Gaiola Cervical PEEK 12x14mm',
    fabricante: 'Medtronic Spine',
    anvisa: '80123450012',
    grupo: 'Coluna Vertebral',
    subgrupo: 'Cervical PEEK',
    unidade: 'UN',
    valor_custo: 3200.00,
    valor_venda: 8500.00,
    controla_serie: true,
    is_kit: false,
    saldo_total: 18,
    ativo: true,
  },
  {
    id: 'f1000000-0000-0000-0000-000000000002',
    codigo: 'OPME-QUAD-010',
    descricao: 'Haste Femoral Modular Ti 12mm',
    fabricante: 'Zimmer Biomet',
    anvisa: '10293847561',
    grupo: 'Prótese de Quadril',
    subgrupo: 'Hastes Femorais',
    unidade: 'UN',
    valor_custo: 6800.00,
    valor_venda: 18900.00,
    controla_serie: true,
    is_kit: false,
    saldo_total: 8,
    ativo: true,
  },
  {
    id: 'f1000000-0000-0000-0000-000000000003',
    codigo: 'OPME-JOE-005',
    descricao: 'Componente Femoral Prótese de Joelho Tam 3',
    fabricante: 'Stryker Orthopaedics',
    anvisa: '80998877665',
    grupo: 'Prótese de Joelho',
    subgrupo: 'Femoral',
    unidade: 'UN',
    valor_custo: 5400.00,
    valor_venda: 15200.00,
    controla_serie: true,
    is_kit: false,
    saldo_total: 12,
    ativo: true,
  },
];

const INITIAL_PROTOCOLOS: Protocolo[] = [
  {
    id: 'g1000000-0000-0000-0000-000000000001',
    numero: 'PROT-2026-0082',
    data: '2026-08-01',
    medico_nome: 'Dr. Roberto Silva Mendes',
    crm: '145892/SP',
    paciente: 'Maria das Graças Oliveira',
    hospital_nome: 'Hospital Israelita Albert Einstein',
    convenio_nome: 'Bradesco Saúde',
    procedimento: 'Artrodese Cervical Anterior 2 Níveis',
    data_cirurgia: new Date().toISOString().split('T')[0],
    status: 'Aprovado Convenio',
    vendedor_nome: 'Lucas Guimarães',
    valor_total: 48500.00,
    observacao: 'Cotação aprovada sem ressalvas pelo auditor Bradesco.',
    created_at: new Date().toISOString(),
    itens: [
      { id: 'pi-1', protocolo_id: 'g1000000-0000-0000-0000-000000000001', produto_codigo: 'OPME-COL-001', descricao: 'Gaiola Cervical PEEK 12x14mm', quantidade: 2, valor_unitario: 8500.00, valor_total: 17000.00, anvisa: '80123450012' },
      { id: 'pi-2', protocolo_id: 'g1000000-0000-0000-0000-000000000001', produto_codigo: 'OPME-COL-002', descricao: 'Placa Cervical Titânio 4 Furos', quantidade: 1, valor_unitario: 14500.00, valor_total: 14500.00, anvisa: '80123450013' },
      { id: 'pi-3', protocolo_id: 'g1000000-0000-0000-0000-000000000001', produto_codigo: 'OPME-COL-003', descricao: 'Parafuso Cervical Titânio 3.5x14mm', quantidade: 4, valor_unitario: 4250.00, valor_total: 17000.00, anvisa: '80123450014' },
    ],
  },
];

const INITIAL_VENDAS: Venda[] = [
  {
    id: 'h1000000-0000-0000-0000-000000000001',
    numero: 'VDA-2026-019',
    nota_fiscal: 'NF-89201',
    data: '2026-08-03',
    cliente_hospital: 'Hospital Israelita Albert Einstein',
    cliente_codigo: 'CLI-0012',
    convenio_nome: 'Bradesco Saúde',
    medico_nome: 'Dr. Roberto Silva Mendes',
    crm: '145892/SP',
    paciente: 'Maria das Graças Oliveira',
    procedimento: 'Artrodese Cervical Anterior',
    vendedor_nome: 'Lucas Guimarães',
    status: 'Consumo Registrado',
    valor_total: 48500.00,
    valor_consumido: 48500.00,
    valor_devolvido: 0.00,
    margem_pct: 61.2,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_VEICULOS: Veiculo[] = [
  {
    id: 'i1000000-0000-0000-0000-000000000001',
    placa: 'OPM-8E29',
    frota: 'FROTA-LOG-01',
    marca: 'Fiat',
    modelo: 'Fiorino Endurance 1.4',
    ano: 2024,
    renavam: '00987654321',
    chassi: '9BD12345678901234',
    cor: 'Branco Banchisa',
    tipo_veiculo: 'Utilitário',
    combustivel: 'Flex',
    km_atual: 24850,
    responsavel_nome: 'Sérgio Ramos (Entregador OPME)',
    situacao: 'Ativo',
  },
  {
    id: 'i1000000-0000-0000-0000-000000000002',
    placa: 'MED-2A99',
    frota: 'FROTA-LOG-02',
    marca: 'Renault',
    modelo: 'Master Vitré L2H2',
    ano: 2025,
    renavam: '00112233445',
    chassi: '8C112233445566778',
    cor: 'Prata',
    tipo_veiculo: 'Van',
    combustivel: 'Diesel',
    km_atual: 12300,
    responsavel_nome: 'Marcos Vinícius (Motorista)',
    situacao: 'Ativo',
  },
];

const INITIAL_CONDUTORES: Condutor[] = [
  { id: 'j1000000-0000-0000-0000-000000000001', nome: 'Sérgio Ramos', cpf: '234.111.222-99', cnh: '0129384756', categoria_cnh: 'B', validade_cnh: '2028-05-20', cargo: 'Entregador de Caixas OPME', departamento: 'Logística de Emergência', status: 'Ativo' },
  { id: 'j1000000-0000-0000-0000-000000000002', nome: 'Marcos Vinícius', cpf: '888.333.222-11', cnh: '0987654321', categoria_cnh: 'D', validade_cnh: '2027-11-10', cargo: 'Motorista de Distribuição', departamento: 'Frota Pesada', status: 'Ativo' },
];

const INITIAL_LOTES: ProdutoLote[] = [
  { id: 'lot-1', produto_id: 'f1000000-0000-0000-0000-000000000001', lote: 'LT-2025-081', fabricacao: '2025-01-10', validade: '2028-01-10', quantidade: 10 },
  { id: 'lot-2', produto_id: 'f1000000-0000-0000-0000-000000000001', lote: 'LT-2025-095', fabricacao: '2025-03-15', validade: '2028-03-15', quantidade: 8 },
  { id: 'lot-3', produto_id: 'f1000000-0000-0000-0000-000000000002', lote: 'LT-2024-441', fabricacao: '2024-06-20', validade: '2027-06-20', quantidade: 8 },
  { id: 'lot-4', produto_id: 'f1000000-0000-0000-0000-000000000003', lote: 'LT-2025-112', fabricacao: '2025-02-01', validade: '2028-02-01', quantidade: 12 },
];

const INITIAL_MOVIMENTOS: MovimentoEstoque[] = [
  {
    id: 'mov-1',
    produto_id: 'f1000000-0000-0000-0000-000000000001',
    produto_codigo: 'OPME-COL-001',
    produto_descricao: 'Gaiola Cervical PEEK 12x14mm',
    lote: 'LT-2025-081',
    tipo: 'entrada',
    quantidade: 10,
    origem: 'Nota Fiscal NF-8812 - Medtronic Spine',
    destino: 'Almoxarifado Central OPME',
    user_email: 'estoque@prestymedick.com.br',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'mov-2',
    produto_id: 'f1000000-0000-0000-0000-000000000001',
    produto_codigo: 'OPME-COL-001',
    produto_descricao: 'Gaiola Cervical PEEK 12x14mm',
    lote: 'LT-2025-081',
    tipo: 'saida',
    quantidade: 2,
    origem: 'Almoxarifado Central OPME',
    destino: 'Hospital Israelita Albert Einstein',
    hospital_nome: 'Hospital Israelita Albert Einstein',
    medico_nome: 'Dr. Roberto Silva Mendes',
    paciente_nome: 'Maria das Graças Oliveira',
    protocolo_numero: 'PROT-2026-0082',
    user_email: 'logistica@prestymedick.com.br',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'mov-3',
    produto_id: 'f1000000-0000-0000-0000-000000000002',
    produto_codigo: 'OPME-QUAD-010',
    produto_descricao: 'Haste Femoral Modular Ti 12mm',
    lote: 'LT-2024-441',
    tipo: 'entrada',
    quantidade: 8,
    origem: 'Importação Zimmer Biomet - DI 26/00192',
    destino: 'Almoxarifado Central OPME',
    user_email: 'estoque@prestymedick.com.br',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

const INITIAL_CHECKLISTS: ChecklistFrota[] = [
  {
    id: 'chk-1',
    veiculo_placa: 'OPM-8E29',
    condutor_nome: 'Sérgio Ramos',
    tipo: 'Saída',
    data: new Date(Date.now() - 3600000 * 4).toISOString(),
    km: 24850,
    pontos_vistorias: [
      { ponto_id: 1, nome: 'Pára-choque Dianteiro', vista: 'Frente', status: 'ok' },
      { ponto_id: 2, nome: 'Farol Dianteiro Esquerdo', vista: 'Frente', status: 'ok' },
      { ponto_id: 3, nome: 'Farol Dianteiro Direito', vista: 'Frente', status: 'ok' },
    ],
    tem_avaria: false,
  },
];

export function useData() {
  const [hospitais, setHospitais] = useState<Hospital[]>(() => {
    const s = localStorage.getItem('presty_hospitais');
    return s ? JSON.parse(s) : INITIAL_HOSPITAIS;
  });

  const [medicos, setMedicos] = useState<Medico[]>(() => {
    const s = localStorage.getItem('presty_medicos');
    return s ? JSON.parse(s) : INITIAL_MEDICOS;
  });

  const [convenios, setConvenios] = useState<Convenio[]>(() => {
    const s = localStorage.getItem('presty_convenios');
    return s ? JSON.parse(s) : INITIAL_CONVENIOS;
  });

  const [vendedores, setVendedores] = useState<Vendedor[]>(() => {
    const s = localStorage.getItem('presty_vendedores');
    return s ? JSON.parse(s) : INITIAL_VENDEDORES;
  });

  const [cirurgias, setCirurgias] = useState<Cirurgia[]>(() => {
    const s = localStorage.getItem('presty_cirurgias');
    return s ? JSON.parse(s) : INITIAL_CIRURGIAS;
  });

  const [protocolos, setProtocolos] = useState<Protocolo[]>(() => {
    const s = localStorage.getItem('presty_protocolos');
    return s ? JSON.parse(s) : INITIAL_PROTOCOLOS;
  });

  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const s = localStorage.getItem('presty_produtos');
    return s ? JSON.parse(s) : INITIAL_PRODUTOS;
  });

  const [vendas, setVendas] = useState<Venda[]>(() => {
    const s = localStorage.getItem('presty_vendas');
    return s ? JSON.parse(s) : INITIAL_VENDAS;
  });

  const [veiculos, setVeiculos] = useState<Veiculo[]>(() => {
    const s = localStorage.getItem('presty_veiculos');
    return s ? JSON.parse(s) : INITIAL_VEICULOS;
  });

  const [condutores, setCondutores] = useState<Condutor[]>(() => {
    const s = localStorage.getItem('presty_condutores');
    return s ? JSON.parse(s) : INITIAL_CONDUTORES;
  });

  const [lotes, setLotes] = useState<ProdutoLote[]>(() => {
    const s = localStorage.getItem('presty_lotes');
    return s ? JSON.parse(s) : INITIAL_LOTES;
  });

  const [movimentos, setMovimentos] = useState<MovimentoEstoque[]>(() => {
    const s = localStorage.getItem('presty_movimentos');
    return s ? JSON.parse(s) : INITIAL_MOVIMENTOS;
  });

  const [checklists, setChecklists] = useState<ChecklistFrota[]>(() => {
    const s = localStorage.getItem('presty_checklists');
    return s ? JSON.parse(s) : INITIAL_CHECKLISTS;
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Carrega e sincroniza todos os dados do Supabase
  const loadAllDataFromSupabase = useCallback(async () => {
    if (!IS_SUPABASE_CONFIGURED) return;

    setIsLoadingData(true);
    try {
      const [
        hospData,
        medData,
        convData,
        vendData,
        cirData,
        protData,
        prodData,
        vdaData,
        veicData,
        condData,
        loteData,
        movData,
        chkData,
      ] = await Promise.allSettled([
        hospitaisService.getAll(),
        medicosService.getAll(),
        conveniosService.getAll(),
        vendedoresService.getAll(),
        cirurgiasService.getAll(),
        protocolosService.getAll(),
        produtosService.getAll(),
        vendasService.getAll(),
        frotaService.getVeiculos(),
        frotaService.getCondutores(),
        estoqueService.getLotes(),
        estoqueService.getMovimentos(),
        frotaService.getChecklists(),
      ]);

      if (hospData.status === 'fulfilled' && hospData.value.length > 0) setHospitais(hospData.value);
      if (medData.status === 'fulfilled' && medData.value.length > 0) setMedicos(medData.value);
      if (convData.status === 'fulfilled' && convData.value.length > 0) setConvenios(convData.value);
      if (vendData.status === 'fulfilled' && vendData.value.length > 0) setVendedores(vendData.value);
      if (cirData.status === 'fulfilled' && cirData.value.length > 0) setCirurgias(cirData.value);
      if (protData.status === 'fulfilled' && protData.value.length > 0) setProtocolos(protData.value);
      if (prodData.status === 'fulfilled' && prodData.value.length > 0) setProdutos(prodData.value);
      if (vdaData.status === 'fulfilled' && vdaData.value.length > 0) setVendas(vdaData.value);
      if (veicData.status === 'fulfilled' && veicData.value.length > 0) setVeiculos(veicData.value);
      if (condData.status === 'fulfilled' && condData.value.length > 0) setCondutores(condData.value);
      if (loteData.status === 'fulfilled' && loteData.value.length > 0) setLotes(loteData.value);
      if (movData.status === 'fulfilled' && movData.value.length > 0) setMovimentos(movData.value);
      if (chkData.status === 'fulfilled' && chkData.value.length > 0) setChecklists(chkData.value);
    } catch (err) {
      console.warn('Sincronização com Supabase utilizou fallback:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAllDataFromSupabase();
  }, [loadAllDataFromSupabase]);

  // Persistência secundária em LocalStorage para resiliência offline
  useEffect(() => { localStorage.setItem('presty_hospitais', JSON.stringify(hospitais)); }, [hospitais]);
  useEffect(() => { localStorage.setItem('presty_medicos', JSON.stringify(medicos)); }, [medicos]);
  useEffect(() => { localStorage.setItem('presty_convenios', JSON.stringify(convenios)); }, [convenios]);
  useEffect(() => { localStorage.setItem('presty_vendedores', JSON.stringify(vendedores)); }, [vendedores]);
  useEffect(() => { localStorage.setItem('presty_cirurgias', JSON.stringify(cirurgias)); }, [cirurgias]);
  useEffect(() => { localStorage.setItem('presty_protocolos', JSON.stringify(protocolos)); }, [protocolos]);
  useEffect(() => { localStorage.setItem('presty_produtos', JSON.stringify(produtos)); }, [produtos]);
  useEffect(() => { localStorage.setItem('presty_vendas', JSON.stringify(vendas)); }, [vendas]);
  useEffect(() => { localStorage.setItem('presty_veiculos', JSON.stringify(veiculos)); }, [veiculos]);
  useEffect(() => { localStorage.setItem('presty_condutores', JSON.stringify(condutores)); }, [condutores]);
  useEffect(() => { localStorage.setItem('presty_lotes', JSON.stringify(lotes)); }, [lotes]);
  useEffect(() => { localStorage.setItem('presty_movimentos', JSON.stringify(movimentos)); }, [movimentos]);
  useEffect(() => { localStorage.setItem('presty_checklists', JSON.stringify(checklists)); }, [checklists]);

  // ==================== CIRURGIAS ====================
  const addCirurgia = async (c: Omit<Cirurgia, 'id' | 'created_at'>) => {
    setIsCloudSyncing(true);
    let created: Cirurgia = {
      ...c,
      id: `cir-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await cirurgiasService.create(c);
      } catch (err) {
        console.warn('Erro ao salvar cirurgia no Supabase:', err);
      }
    }

    setCirurgias((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateCirurgia = async (id: string, updates: Partial<Cirurgia>) => {
    setCirurgias((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await cirurgiasService.update(id, updates);
      } catch (err) {
        console.warn('Erro ao atualizar cirurgia no Supabase:', err);
      }
    }
  };

  // ==================== PROTOCOLOS ====================
  const addProtocolo = async (p: Omit<Protocolo, 'id' | 'numero' | 'created_at'>) => {
    setIsCloudSyncing(true);
    let created: Protocolo = {
      ...p,
      id: `prot-${Date.now()}`,
      numero: `PROT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await protocolosService.create(p);
      } catch (err) {
        console.warn('Erro ao salvar protocolo no Supabase:', err);
      }
    }

    setProtocolos((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  // ==================== PRODUTOS ====================
  const addProduto = async (p: Omit<Produto, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Produto = {
      ...p,
      id: `prod-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await produtosService.create(p);
      } catch (err) {
        console.warn('Erro ao salvar produto no Supabase:', err);
      }
    }

    setProdutos((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  // ==================== VEÍCULOS ====================
  const addVeiculo = async (v: Omit<Veiculo, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Veiculo = {
      ...v,
      id: `veic-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await frotaService.createVeiculo(v);
      } catch (err) {
        console.warn('Erro ao salvar veículo no Supabase:', err);
      }
    }

    setVeiculos((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateVeiculo = async (id: string, updates: Partial<Veiculo>) => {
    setVeiculos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await frotaService.updateVeiculo(id, updates);
      } catch (err) {
        console.warn('Erro ao atualizar veículo no Supabase:', err);
      }
    }
  };

  const deleteVeiculo = async (id: string) => {
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await frotaService.deleteVeiculo(id);
      } catch (err) {
        console.warn('Erro ao excluir veículo no Supabase:', err);
      }
    }
  };

  // ==================== CONDUTORES ====================
  const addCondutor = async (c: Omit<Condutor, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Condutor = {
      ...c,
      id: `cond-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await frotaService.createCondutor(c);
      } catch (err) {
        console.warn('Erro ao salvar condutor no Supabase:', err);
      }
    }

    setCondutores((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateCondutor = async (id: string, updates: Partial<Condutor>) => {
    setCondutores((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await frotaService.updateCondutor(id, updates);
      } catch (err) {
        console.warn('Erro ao atualizar condutor no Supabase:', err);
      }
    }
  };

  const deleteCondutor = async (id: string) => {
    setCondutores((prev) => prev.filter((c) => c.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await frotaService.deleteCondutor(id);
      } catch (err) {
        console.warn('Erro ao excluir condutor no Supabase:', err);
      }
    }
  };

  // ==================== HOSPITAIS ====================
  const addHospital = async (h: Omit<Hospital, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Hospital = {
      ...h,
      id: `hosp-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await hospitaisService.create(h);
      } catch (err) {
        console.warn('Erro ao salvar hospital no Supabase:', err);
      }
    }

    setHospitais((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateHospital = async (id: string, updates: Partial<Hospital>) => {
    setHospitais((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await hospitaisService.update(id, updates);
      } catch (err) {
        console.warn('Erro ao atualizar hospital no Supabase:', err);
      }
    }
  };

  const deleteHospital = async (id: string) => {
    setHospitais((prev) => prev.filter((h) => h.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await hospitaisService.delete(id);
      } catch (err) {
        console.warn('Erro ao excluir hospital no Supabase:', err);
      }
    }
  };

  // ==================== MÉDICOS ====================
  const addMedico = async (m: Omit<Medico, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Medico = {
      ...m,
      id: `med-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await medicosService.create(m);
      } catch (err) {
        console.warn('Erro ao salvar médico no Supabase:', err);
      }
    }

    setMedicos((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateMedico = async (id: string, updates: Partial<Medico>) => {
    setMedicos((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await medicosService.update(id, updates);
      } catch (err) {
        console.warn('Erro ao atualizar médico no Supabase:', err);
      }
    }
  };

  const deleteMedico = async (id: string) => {
    setMedicos((prev) => prev.filter((m) => m.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await medicosService.delete(id);
      } catch (err) {
        console.warn('Erro ao excluir médico no Supabase:', err);
      }
    }
  };

  // ==================== CONVÊNIOS ====================
  const addConvenio = async (c: Omit<Convenio, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Convenio = {
      ...c,
      id: `conv-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await conveniosService.create(c);
      } catch (err) {
        console.warn('Erro ao salvar convênio no Supabase:', err);
      }
    }

    setConvenios((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateConvenio = async (id: string, updates: Partial<Convenio>) => {
    setConvenios((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await conveniosService.update(id, updates);
      } catch (err) {
        console.warn('Erro ao atualizar convênio no Supabase:', err);
      }
    }
  };

  const deleteConvenio = async (id: string) => {
    setConvenios((prev) => prev.filter((c) => c.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await conveniosService.delete(id);
      } catch (err) {
        console.warn('Erro ao excluir convênio no Supabase:', err);
      }
    }
  };

  // ==================== VENDEDORES ====================
  const addVendedor = async (v: Omit<Vendedor, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Vendedor = {
      ...v,
      id: `vend-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await vendedoresService.create(v);
      } catch (err) {
        console.warn('Erro ao salvar vendedor no Supabase:', err);
      }
    }

    setVendedores((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateVendedor = async (id: string, updates: Partial<Vendedor>) => {
    setVendedores((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await vendedoresService.update(id, updates);
      } catch (err) {
        console.warn('Erro ao atualizar vendedor no Supabase:', err);
      }
    }
  };

  const deleteVendedor = async (id: string) => {
    setVendedores((prev) => prev.filter((v) => v.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await vendedoresService.delete(id);
      } catch (err) {
        console.warn('Erro ao excluir vendedor no Supabase:', err);
      }
    }
  };

  // ==================== MOVIMENTAÇÕES DE ESTOQUE ====================
  const addMovimento = async (m: Omit<MovimentoEstoque, 'id' | 'created_at'>) => {
    setIsCloudSyncing(true);
    let created: MovimentoEstoque = {
      ...m,
      id: `mov-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await estoqueService.createMovimento(m);
      } catch (err) {
        console.warn('Erro ao salvar movimento no Supabase:', err);
      }
    }

    setMovimentos((prev) => [created, ...prev]);

    // Atualização otimista do saldo em produtos local
    if (m.produto_id) {
      const isEntrada = m.tipo === 'entrada' || m.tipo === 'devolucao';
      const fator = isEntrada ? 1 : -1;
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === m.produto_id
            ? { ...p, saldo_total: Math.max(0, p.saldo_total + m.quantidade * fator) }
            : p
        )
      );
    }

    setIsCloudSyncing(false);
    return created;
  };

  const addLote = async (l: Omit<ProdutoLote, 'id'>) => {
    setIsCloudSyncing(true);
    let created: ProdutoLote = {
      ...l,
      id: `lot-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await estoqueService.createLote(l);
      } catch (err) {
        console.warn('Erro ao salvar lote no Supabase:', err);
      }
    }

    setLotes((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  // ==================== CHECKLISTS / VISTORIAS FROTA ====================
  const addChecklist = async (c: Omit<ChecklistFrota, 'id'>) => {
    setIsCloudSyncing(true);
    let created: ChecklistFrota = {
      ...c,
      id: `chk-${Date.now()}`,
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await frotaService.saveChecklist(c);
      } catch (err) {
        console.warn('Erro ao salvar checklist no Supabase:', err);
      }
    }

    setChecklists((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  // ==================== VENDAS & FATURAMENTO ====================
  const addVenda = async (v: Omit<Venda, 'id' | 'created_at'>) => {
    setIsCloudSyncing(true);
    let created: Venda = {
      ...v,
      id: `vda-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (IS_SUPABASE_CONFIGURED) {
      try {
        created = await vendasService.create(v);
      } catch (err) {
        console.warn('Erro ao salvar venda no Supabase:', err);
      }
    }

    setVendas((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateVenda = async (id: string, updates: Partial<Venda>) => {
    setVendas((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await vendasService.update(id, updates);
      } catch (err) {
        console.warn('Erro ao atualizar venda no Supabase:', err);
      }
    }
  };

  const deleteVenda = async (id: string) => {
    setVendas((prev) => prev.filter((v) => v.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try {
        await vendasService.delete(id);
      } catch (err) {
        console.warn('Erro ao excluir venda no Supabase:', err);
      }
    }
  };

  return {
    hospitais,
    medicos,
    convenios,
    vendedores,
    cirurgias,
    protocolos,
    produtos,
    vendas,
    veiculos,
    condutores,
    lotes,
    movimentos,
    checklists,
    isLoadingData,
    isCloudSyncing,
    refreshData: loadAllDataFromSupabase,
    addCirurgia,
    updateCirurgia,
    addProtocolo,
    addProduto,
    addMovimento,
    addLote,
    addVenda,
    updateVenda,
    deleteVenda,
    addVeiculo,
    updateVeiculo,
    deleteVeiculo,
    addCondutor,
    updateCondutor,
    deleteCondutor,
    addChecklist,
    addHospital,
    updateHospital,
    deleteHospital,
    addMedico,
    updateMedico,
    deleteMedico,
    addConvenio,
    updateConvenio,
    deleteConvenio,
    addVendedor,
    updateVendedor,
    deleteVendedor,
  };
}

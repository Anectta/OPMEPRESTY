import { useState, useEffect } from 'react';
import {
  Cirurgia,
  Protocolo,
  Produto,
  ProdutoLote,
  MovimentoEstoque,
  Venda,
  ComissaoRegra,
  MetaVenda,
  Veiculo,
  Condutor,
  ChecklistFrota,
  Hospital,
  Medico,
  Convenio,
  Vendedor,
} from '../types';

// Mock Initial Data for Presty Medick
const INITIAL_HOSPITAIS: Hospital[] = [
  { id: 'hosp-1', nome: 'Hospital Israelita Albert Einstein', cnpj: '60.765.823/0001-30', cidade: 'São Paulo', estado: 'SP', contato: 'Centro Cirúrgico OPME - (11) 2151-1234', ativo: true },
  { id: 'hosp-2', nome: 'Hospital Sírio-Libanês', cnpj: '62.970.389/0001-15', cidade: 'São Paulo', estado: 'SP', contato: 'Farmácia Satélite OPME - (11) 3394-5000', ativo: true },
  { id: 'hosp-3', nome: 'HCor - Hospital do Coração', cnpj: '60.884.855/0001-54', cidade: 'São Paulo', estado: 'SP', contato: 'Almoxarifado Consignado - (11) 3053-6600', ativo: true },
  { id: 'hosp-4', nome: 'Hospital Alemão Oswaldo Cruz', cnpj: '60.884.111/0001-20', cidade: 'São Paulo', estado: 'SP', contato: 'SAD / Bloco Cirúrgico - (11) 3549-1000', ativo: true },
];

const INITIAL_MEDICOS: Medico[] = [
  { id: 'med-1', nome: 'Dr. Roberto Silva Mendes', crm: '145892', uf_crm: 'SP', especialidade: 'Cirurgia da Coluna e Joelho', telefone: '(11) 99123-4455', email: 'roberto.mendes@medicos.com.br', ativo: true },
  { id: 'med-2', nome: 'Dra. Patricia Alencar', crm: '178920', uf_crm: 'SP', especialidade: 'Artroplastia de Quadril', telefone: '(11) 98877-6655', email: 'patricia.alencar@ortopedia.com.br', ativo: true },
  { id: 'med-3', nome: 'Dr. Fernando Vasconcelos', crm: '123410', uf_crm: 'SP', especialidade: 'Traumatologia Complexa', telefone: '(11) 97111-2233', email: 'f.vasconcelos@trauma.com.br', ativo: true },
];

const INITIAL_CONVENIOS: Convenio[] = [
  { id: 'conv-1', nome: 'Bradesco Saúde', ans_codigo: '005711', ativo: true },
  { id: 'conv-2', nome: 'SulAmérica Saúde', ans_codigo: '006246', ativo: true },
  { id: 'conv-3', nome: 'Amil Assistência Médica', ans_codigo: '326305', ativo: true },
  { id: 'conv-4', nome: 'Porto Seguro Saúde', ans_codigo: '000582', ativo: true },
];

const INITIAL_VENDEDORES: Vendedor[] = [
  { id: 'vend-1', nome: 'Lucas Guimarães', email: 'lucas.g@prestymedick.com.br', comissao_padrao_pct: 6.0, ativo: true },
  { id: 'vend-2', nome: 'Mariana Duarte', email: 'mariana.d@prestymedick.com.br', comissao_padrao_pct: 5.5, ativo: true },
  { id: 'vend-3', nome: 'Rodrigo Santoro', email: 'rodrigo.s@prestymedick.com.br', comissao_padrao_pct: 5.0, ativo: true },
];

const INITIAL_CIRURGIAS: Cirurgia[] = [
  {
    id: 'CIR-2026-089',
    data: new Date().toISOString().split('T')[0],
    horario: '08:00',
    hospital_id: 'hosp-1',
    hospital_nome: 'Hospital Israelita Albert Einstein',
    medico_id: 'med-1',
    medico_nome: 'Dr. Roberto Silva Mendes',
    paciente: 'Maria das Graças Oliveira',
    paciente_cpf: '234.567.890-11',
    convenio_id: 'conv-1',
    convenio_nome: 'Bradesco Saúde',
    vendedor_id: 'vend-1',
    vendedor_nome: 'Lucas Guimarães',
    situacao: 'Confirmada',
    equipamento: 'Motor Cirúrgico Stryker TPS',
    acessorio: 'Caixa de Brocas de Coluna',
    ld_ct: 'Liberado com Autorização Guia nº 883921',
    material_previsto: 'Kit Gaiola Cervical PEEK + Parafusos Pediculares Titanium',
    tecnico_nome: 'André Santos (Técnico Instrumentador OPME)',
    observacao: 'Caixas entregues na farmácia central 24h antes para esterilização.',
    empresa_id: 'emp-001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'CIR-2026-090',
    data: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    horario: '10:30',
    hospital_id: 'hosp-2',
    hospital_nome: 'Hospital Sírio-Libanês',
    medico_id: 'med-2',
    medico_nome: 'Dra. Patricia Alencar',
    paciente: 'Carlos Eduardo Fontes',
    paciente_cpf: '456.789.012-33',
    convenio_id: 'conv-2',
    convenio_nome: 'SulAmérica Saúde',
    vendedor_id: 'vend-2',
    vendedor_nome: 'Mariana Duarte',
    situacao: 'Agendada',
    equipamento: 'Arthrocare Coblator II',
    acessorio: 'Ponteira de Radiofrequência',
    ld_ct: 'Com Termo de Faturamento Direto',
    material_previsto: 'Prótese Total de Quadril Ceramica/Polietileno Crosslinked',
    tecnico_nome: 'Felipe Neves (Técnico)',
    observacao: 'Verificar lote de hastes femorais nº 11 e 12 no estoque.',
    empresa_id: 'emp-001',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_PROTOCOLOS: Protocolo[] = [
  {
    id: 'prot-1',
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
      { id: 'pi-1', protocolo_id: 'prot-1', produto_codigo: 'OPME-COL-001', descricao: 'Gaiola Cervical PEEK 12x14mm', quantidade: 2, valor_unitario: 8500.00, valor_total: 17000.00, anvisa: '80123450012' },
      { id: 'pi-2', protocolo_id: 'prot-1', produto_codigo: 'OPME-COL-002', descricao: 'Placa Cervical Titânio 4 Furos', quantidade: 1, valor_unitario: 14500.00, valor_total: 14500.00, anvisa: '80123450013' },
      { id: 'pi-3', protocolo_id: 'prot-1', produto_codigo: 'OPME-COL-003', descricao: 'Parafuso Cervical Titânio 3.5x14mm', quantidade: 4, valor_unitario: 4250.00, valor_total: 17000.00, anvisa: '80123450014' },
    ],
  },
];

const INITIAL_PRODUTOS: Produto[] = [
  {
    id: 'p-1',
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
    id: 'p-2',
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
    id: 'p-3',
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

const INITIAL_VENDAS: Venda[] = [
  {
    id: 'vda-1',
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
    id: 'veic-1',
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
    id: 'veic-2',
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
  { id: 'cond-1', nome: 'Sérgio Ramos', cpf: '234.111.222-99', cnh: '0129384756', categoria_cnh: 'B', validade_cnh: '2028-05-20', cargo: 'Entregador de Cixas OPME', departamento: 'Logística de Emergência', status: 'Ativo' },
  { id: 'cond-2', nome: 'Marcos Vinícius', cpf: '888.333.222-11', cnh: '0987654321', categoria_cnh: 'D', validade_cnh: '2027-11-10', cargo: 'Motorista de Distribuição', departamento: 'Frota Pesada', status: 'Ativo' },
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

  // Save to LocalStorage on changes
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

  // Handler functions
  const addCirurgia = (c: Omit<Cirurgia, 'id' | 'created_at'>) => {
    const newC: Cirurgia = {
      ...c,
      id: `CIR-2026-0${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString(),
    };
    setCirurgias((prev) => [newC, ...prev]);
    return newC;
  };

  const updateCirurgia = (id: string, updates: Partial<Cirurgia>) => {
    setCirurgias((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const addProtocolo = (p: Omit<Protocolo, 'id' | 'numero' | 'created_at'>) => {
    const newP: Protocolo = {
      ...p,
      id: `prot-${Date.now()}`,
      numero: `PROT-2026-0${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString(),
    };
    setProtocolos((prev) => [newP, ...prev]);
    return newP;
  };

  const addProduto = (p: Omit<Produto, 'id'>) => {
    const newP: Produto = {
      ...p,
      id: `p-${Date.now()}`,
    };
    setProdutos((prev) => [newP, ...prev]);
    return newP;
  };

  // VEÍCULOS CRUD
  const addVeiculo = (v: Omit<Veiculo, 'id'>) => {
    const newV: Veiculo = {
      ...v,
      id: `veic-${Date.now()}`,
    };
    setVeiculos((prev) => [newV, ...prev]);
    return newV;
  };

  const updateVeiculo = (id: string, updates: Partial<Veiculo>) => {
    setVeiculos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVeiculo = (id: string) => {
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
  };

  // CONDUTORES CRUD
  const addCondutor = (c: Omit<Condutor, 'id'>) => {
    const newC: Condutor = {
      ...c,
      id: `cond-${Date.now()}`,
    };
    setCondutores((prev) => [newC, ...prev]);
    return newC;
  };

  const updateCondutor = (id: string, updates: Partial<Condutor>) => {
    setCondutores((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCondutor = (id: string) => {
    setCondutores((prev) => prev.filter((c) => c.id !== id));
  };

  // HOSPITAIS CRUD
  const addHospital = (h: Omit<Hospital, 'id'>) => {
    const newH: Hospital = {
      ...h,
      id: `hosp-${Date.now()}`,
    };
    setHospitais((prev) => [newH, ...prev]);
    return newH;
  };

  const updateHospital = (id: string, updates: Partial<Hospital>) => {
    setHospitais((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHospital = (id: string) => {
    setHospitais((prev) => prev.filter((h) => h.id !== id));
  };

  // MÉDICOS CRUD
  const addMedico = (m: Omit<Medico, 'id'>) => {
    const newM: Medico = {
      ...m,
      id: `med-${Date.now()}`,
    };
    setMedicos((prev) => [newM, ...prev]);
    return newM;
  };

  const updateMedico = (id: string, updates: Partial<Medico>) => {
    setMedicos((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMedico = (id: string) => {
    setMedicos((prev) => prev.filter((m) => m.id !== id));
  };

  // CONVÊNIOS CRUD
  const addConvenio = (c: Omit<Convenio, 'id'>) => {
    const newC: Convenio = {
      ...c,
      id: `conv-${Date.now()}`,
    };
    setConvenios((prev) => [newC, ...prev]);
    return newC;
  };

  const updateConvenio = (id: string, updates: Partial<Convenio>) => {
    setConvenios((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteConvenio = (id: string) => {
    setConvenios((prev) => prev.filter((c) => c.id !== id));
  };

  // VENDEDORES CRUD
  const addVendedor = (v: Omit<Vendedor, 'id'>) => {
    const newV: Vendedor = {
      ...v,
      id: `vend-${Date.now()}`,
    };
    setVendedores((prev) => [newV, ...prev]);
    return newV;
  };

  const updateVendedor = (id: string, updates: Partial<Vendedor>) => {
    setVendedores((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVendedor = (id: string) => {
    setVendedores((prev) => prev.filter((v) => v.id !== id));
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
    addCirurgia,
    updateCirurgia,
    addProtocolo,
    addProduto,
    addVeiculo,
    updateVeiculo,
    deleteVeiculo,
    addCondutor,
    updateCondutor,
    deleteCondutor,
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

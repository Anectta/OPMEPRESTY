/**
 * useData.ts — Hook principal de dados V2.0
 * Plataforma OPME Presty — Single Tenant, sem módulos financeiros
 * Conforme Especificação Mestre V2.0
 */
import { useState, useEffect, useCallback } from 'react';
import type {
  Cirurgia,
  ProtocoloOPME,
  Produto,
  Hospital,
  Medico,
  Convenio,
  Vendedor,
  Procedimento,
  Paciente,
  Estoque,
  MovimentacaoOperacional,
  Veiculo,
  ProdutoLote,
  MovimentoEstoque,
} from '../types';
import {
  hospitaisService,
  medicosService,
  conveniosService,
  vendedoresService,
  cirurgiasService,
  protocolosService,
  produtosService,
  estoquesService,
  pacientesService,
  procedimentosService,
} from '../services/databaseService';
import { IS_SUPABASE_CONFIGURED } from '../lib/supabase/client';

import { importedExcelData } from '../data/importedExcelData';

// =====================================================================
// Dados importados da planilha Excel oficial
// =====================================================================

const INITIAL_HOSPITAIS: Hospital[] = (importedExcelData.hospitais as unknown as Hospital[]) || [];
const INITIAL_MEDICOS: Medico[] = (importedExcelData.medicos as unknown as Medico[]) || [];
const INITIAL_CONVENIOS: Convenio[] = (importedExcelData.convenios as unknown as Convenio[]) || [];
const INITIAL_PACIENTES: Paciente[] = (importedExcelData.pacientes as unknown as Paciente[]) || [];
const INITIAL_PROCEDIMENTOS: Procedimento[] = (importedExcelData.procedimentos as unknown as Procedimento[]) || [];
const INITIAL_VENDEDORES: Vendedor[] = (importedExcelData.vendedores as unknown as Vendedor[]) || [];
const INITIAL_CIRURGIAS: Cirurgia[] = (importedExcelData.cirurgias as unknown as Cirurgia[]) || [];
const INITIAL_PROTOCOLOS: ProtocoloOPME[] = (importedExcelData.protocolos as unknown as ProtocoloOPME[]) || [];
const INITIAL_PRODUTOS: Produto[] = (importedExcelData.produtos as unknown as Produto[]) || [];
const INITIAL_ESTOQUES: Estoque[] = [];
const INITIAL_LOTES: ProdutoLote[] = [];
const INITIAL_MOVIMENTOS: MovimentoEstoque[] = [];
const INITIAL_VEICULOS: Veiculo[] = [];

// Limpeza e migração para dados da planilha Excel
if (typeof window !== 'undefined' && !localStorage.getItem('presty_excel_imported_v1')) {
  [
    'v2_hospitais', 'v2_medicos', 'v2_convenios', 'v2_vendedores',
    'v2_cirurgias', 'v2_protocolos', 'v2_produtos', 'v2_estoques',
    'v2_veiculos', 'v2_lotes', 'v2_movimentos', 'v2_pacientes', 'v2_procedimentos'
  ].forEach((k) => localStorage.removeItem(k));
  localStorage.setItem('presty_excel_imported_v1', 'true');
}

// =====================================================================
// Hook useData — orquestra o estado global de dados V2.0
// =====================================================================
export function useData() {
  const [hospitais, setHospitais] = useState<Hospital[]>(() => {
    const s = localStorage.getItem('v2_hospitais');
    return s ? JSON.parse(s) : INITIAL_HOSPITAIS;
  });

  const [medicos, setMedicos] = useState<Medico[]>(() => {
    const s = localStorage.getItem('v2_medicos');
    return s ? JSON.parse(s) : INITIAL_MEDICOS;
  });

  const [convenios, setConvenios] = useState<Convenio[]>(() => {
    const s = localStorage.getItem('v2_convenios');
    return s ? JSON.parse(s) : INITIAL_CONVENIOS;
  });

  const [vendedores, setVendedores] = useState<Vendedor[]>(() => {
    const s = localStorage.getItem('v2_vendedores');
    return s ? JSON.parse(s) : INITIAL_VENDEDORES;
  });

  const [cirurgias, setCirurgias] = useState<Cirurgia[]>(() => {
    const s = localStorage.getItem('v2_cirurgias');
    if (!s) return INITIAL_CIRURGIAS;
    try {
      const parsed: Cirurgia[] = JSON.parse(s);
      return parsed.map((c, i) => ({
        ...c,
        numero_it: c.numero_it || `${559880 + i}`,
      }));
    } catch {
      return INITIAL_CIRURGIAS;
    }
  });

  const [protocolos, setProtocolos] = useState<ProtocoloOPME[]>(() => {
    const s = localStorage.getItem('v2_protocolos');
    return s ? JSON.parse(s) : INITIAL_PROTOCOLOS;
  });

  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const s = localStorage.getItem('v2_produtos');
    return s ? JSON.parse(s) : INITIAL_PRODUTOS;
  });

  const [estoques, setEstoques] = useState<Estoque[]>(() => {
    const s = localStorage.getItem('v2_estoques');
    return s ? JSON.parse(s) : INITIAL_ESTOQUES;
  });

  const [veiculos, setVeiculos] = useState<Veiculo[]>(() => {
    const s = localStorage.getItem('v2_veiculos');
    return s ? JSON.parse(s) : INITIAL_VEICULOS;
  });

  const [lotes, setLotes] = useState<ProdutoLote[]>(() => {
    const s = localStorage.getItem('v2_lotes');
    return s ? JSON.parse(s) : INITIAL_LOTES;
  });

  const [movimentos, setMovimentos] = useState<MovimentoEstoque[]>(() => {
    const s = localStorage.getItem('v2_movimentos');
    return s ? JSON.parse(s) : INITIAL_MOVIMENTOS;
  });

  const [pacientes, setPacientes] = useState<Paciente[]>(() => {
    const s = localStorage.getItem('v2_pacientes');
    return s ? JSON.parse(s) : INITIAL_PACIENTES;
  });

  const [procedimentos, setProcedimentos] = useState<Procedimento[]>(() => {
    const s = localStorage.getItem('v2_procedimentos');
    return s ? JSON.parse(s) : INITIAL_PROCEDIMENTOS;
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Carrega dados do Supabase quando configurado
  const loadAllDataFromSupabase = useCallback(async () => {
    if (!IS_SUPABASE_CONFIGURED) return;

    setIsLoadingData(true);
    try {
      const [hospData, medData, convData, vendData, cirData, protData, prodData, pacData, procData] =
        await Promise.allSettled([
          hospitaisService.getAll(),
          medicosService.getAll(),
          conveniosService.getAll(),
          vendedoresService.getAll(),
          cirurgiasService.getAll(),
          protocolosService.getAll(),
          produtosService.getAll(),
          pacientesService.getAll(),
          procedimentosService.getAll(),
        ]);

      if (hospData.status === 'fulfilled' && hospData.value.length > 0) setHospitais(hospData.value);
      if (medData.status === 'fulfilled' && medData.value.length > 0) setMedicos(medData.value);
      if (convData.status === 'fulfilled' && convData.value.length > 0) setConvenios(convData.value);
      if (vendData.status === 'fulfilled' && vendData.value.length > 0) setVendedores(vendData.value);
      if (cirData.status === 'fulfilled' && cirData.value.length > 0) setCirurgias(cirData.value);
      if (protData.status === 'fulfilled' && protData.value.length > 0) setProtocolos(protData.value);
      if (prodData.status === 'fulfilled' && prodData.value.length > 0) setProdutos(prodData.value);
      if (pacData.status === 'fulfilled' && pacData.value.length > 0) setPacientes(pacData.value);
      if (procData.status === 'fulfilled' && procData.value.length > 0) setProcedimentos(procData.value);
    } catch (err) {
      console.warn('Sincronização com Supabase utilizou fallback local:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAllDataFromSupabase();
  }, [loadAllDataFromSupabase]);

  // Persistência em LocalStorage (chave v2_ para não conflitar com dados V1)
  useEffect(() => { localStorage.setItem('v2_hospitais', JSON.stringify(hospitais)); }, [hospitais]);
  useEffect(() => { localStorage.setItem('v2_medicos', JSON.stringify(medicos)); }, [medicos]);
  useEffect(() => { localStorage.setItem('v2_convenios', JSON.stringify(convenios)); }, [convenios]);
  useEffect(() => { localStorage.setItem('v2_vendedores', JSON.stringify(vendedores)); }, [vendedores]);
  useEffect(() => { localStorage.setItem('v2_pacientes', JSON.stringify(pacientes)); }, [pacientes]);
  useEffect(() => { localStorage.setItem('v2_procedimentos', JSON.stringify(procedimentos)); }, [procedimentos]);
  useEffect(() => { localStorage.setItem('v2_cirurgias', JSON.stringify(cirurgias)); }, [cirurgias]);
  useEffect(() => { localStorage.setItem('v2_protocolos', JSON.stringify(protocolos)); }, [protocolos]);
  useEffect(() => { localStorage.setItem('v2_produtos', JSON.stringify(produtos)); }, [produtos]);
  useEffect(() => { localStorage.setItem('v2_estoques', JSON.stringify(estoques)); }, [estoques]);
  useEffect(() => { localStorage.setItem('v2_veiculos', JSON.stringify(veiculos)); }, [veiculos]);
  useEffect(() => { localStorage.setItem('v2_lotes', JSON.stringify(lotes)); }, [lotes]);
  useEffect(() => { localStorage.setItem('v2_movimentos', JSON.stringify(movimentos)); }, [movimentos]);

  // ==================== CIRURGIAS ====================
  const addCirurgia = async (c: Omit<Cirurgia, 'id' | 'created_at'>) => {
    setIsCloudSyncing(true);
    const numero_it = c.numero_it || `${Math.floor(550000 + Math.random() * 50000)}`;
    let created: Cirurgia = { ...c, numero_it, id: `cir-${Date.now()}`, created_at: new Date().toISOString() };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await cirurgiasService.create(c); }
      catch (err) { console.warn('Supabase cirurgia create:', err); }
    }

    setCirurgias((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateCirurgia = async (id: string, updates: Partial<Cirurgia>) => {
    setCirurgias((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await cirurgiasService.update(id, updates); }
      catch (err) { console.warn('Supabase cirurgia update:', err); }
    }
  };

  // ==================== PROTOCOLOS OPME ====================
  const addProtocolo = async (p: Omit<ProtocoloOPME, 'id' | 'created_at'>) => {
    setIsCloudSyncing(true);
    const numero_it = p.numero_it || `${Date.now()}`;
    let created: ProtocoloOPME = {
      ...p,
      id: `prot-${Date.now()}`,
      numero_protocolo: `PROT-${numero_it}`,
      created_at: new Date().toISOString(),
    };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await protocolosService.create(p); }
      catch (err) { console.warn('Supabase protocolo create:', err); }
    }

    setProtocolos((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateProtocolo = async (id: string, updates: Partial<ProtocoloOPME>) => {
    setProtocolos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await protocolosService.update(id, updates); }
      catch (err) { console.warn('Supabase protocolo update:', err); }
    }
  };

  // ==================== PRODUTOS ====================
  const addProduto = async (p: Omit<Produto, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Produto = { ...p, id: `prod-${Date.now()}` };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await produtosService.create(p); }
      catch (err) { console.warn('Supabase produto create:', err); }
    }

    setProdutos((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await produtosService.update(id, updates); }
      catch (err) { console.warn('Supabase produto update:', err); }
    }
  };

  const deleteProduto = async (id: string) => {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try { await produtosService.delete(id); }
      catch (err) { console.warn('Supabase produto delete:', err); }
    }
  };

  // ==================== LOTES E MOVIMENTOS ====================
  const addLote = async (l: Omit<ProdutoLote, 'id'>) => {
    const created: ProdutoLote = { ...l, id: `lot-${Date.now()}` };
    setLotes((prev) => [created, ...prev]);
    return created;
  };

  const addMovimento = async (m: Omit<MovimentoEstoque, 'id' | 'created_at'>) => {
    const created: MovimentoEstoque = {
      ...m,
      id: `mov-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setMovimentos((prev) => [created, ...prev]);

    // Atualiza saldo do produto correspondente
    setProdutos((prev) =>
      prev.map((p) => {
        if (p.id !== m.produto_id) return p;
        const currentSaldo = p.saldo_total ?? 0;
        const isEntrada = m.tipo === 'entrada' || m.tipo === 'devolucao';
        const novoSaldo = isEntrada ? currentSaldo + m.quantidade : Math.max(0, currentSaldo - m.quantidade);
        return { ...p, saldo_total: novoSaldo };
      })
    );

    return created;
  };

  // ==================== HOSPITAIS ====================
  const addHospital = async (h: Omit<Hospital, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Hospital = { ...h, id: `hosp-${Date.now()}` };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await hospitaisService.create(h); }
      catch (err) { console.warn('Supabase hospital create:', err); }
    }

    setHospitais((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateHospital = async (id: string, updates: Partial<Hospital>) => {
    setHospitais((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await hospitaisService.update(id, updates); }
      catch (err) { console.warn('Supabase hospital update:', err); }
    }
  };

  const deleteHospital = async (id: string) => {
    setHospitais((prev) => prev.filter((h) => h.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try { await hospitaisService.delete(id); }
      catch (err) { console.warn('Supabase hospital delete:', err); }
    }
  };

  // ==================== MÉDICOS ====================
  const addMedico = async (m: Omit<Medico, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Medico = { ...m, id: `med-${Date.now()}` };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await medicosService.create(m); }
      catch (err) { console.warn('Supabase medico create:', err); }
    }

    setMedicos((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateMedico = async (id: string, updates: Partial<Medico>) => {
    setMedicos((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await medicosService.update(id, updates); }
      catch (err) { console.warn('Supabase medico update:', err); }
    }
  };

  const deleteMedico = async (id: string) => {
    setMedicos((prev) => prev.filter((m) => m.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try { await medicosService.delete(id); }
      catch (err) { console.warn('Supabase medico delete:', err); }
    }
  };

  // ==================== CONVÊNIOS ====================
  const addConvenio = async (c: Omit<Convenio, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Convenio = { ...c, id: `conv-${Date.now()}` };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await conveniosService.create(c); }
      catch (err) { console.warn('Supabase convenio create:', err); }
    }

    setConvenios((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateConvenio = async (id: string, updates: Partial<Convenio>) => {
    setConvenios((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await conveniosService.update(id, updates); }
      catch (err) { console.warn('Supabase convenio update:', err); }
    }
  };

  const deleteConvenio = async (id: string) => {
    setConvenios((prev) => prev.filter((c) => c.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try { await conveniosService.delete(id); }
      catch (err) { console.warn('Supabase convenio delete:', err); }
    }
  };

  // ==================== VENDEDORES ====================
  const addVendedor = async (v: Omit<Vendedor, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Vendedor = { ...v, id: `vend-${Date.now()}` };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await vendedoresService.create(v); }
      catch (err) { console.warn('Supabase vendedor create:', err); }
    }

    setVendedores((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateVendedor = async (id: string, updates: Partial<Vendedor>) => {
    setVendedores((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await vendedoresService.update(id, updates); }
      catch (err) { console.warn('Supabase vendedor update:', err); }
    }
  };

  const deleteVendedor = async (id: string) => {
    setVendedores((prev) => prev.filter((v) => v.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try { await vendedoresService.delete(id); }
      catch (err) { console.warn('Supabase vendedor delete:', err); }
    }
  };

  // ==================== PACIENTES ====================
  const addPaciente = async (p: Omit<Paciente, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Paciente = { ...p, id: `pac-${Date.now()}`, created_at: new Date().toISOString() };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await pacientesService.create(p); }
      catch (err) { console.warn('Supabase paciente create:', err); }
    }

    setPacientes((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updatePaciente = async (id: string, updates: Partial<Paciente>) => {
    setPacientes((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await pacientesService.update(id, updates); }
      catch (err) { console.warn('Supabase paciente update:', err); }
    }
  };

  const deletePaciente = async (id: string) => {
    setPacientes((prev) => prev.filter((p) => p.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try { await pacientesService.delete(id); }
      catch (err) { console.warn('Supabase paciente delete:', err); }
    }
  };

  // ==================== PROCEDIMENTOS ====================
  const addProcedimento = async (p: Omit<Procedimento, 'id'>) => {
    setIsCloudSyncing(true);
    let created: Procedimento = { ...p, id: `proc-${Date.now()}` };

    if (IS_SUPABASE_CONFIGURED) {
      try { created = await procedimentosService.create(p); }
      catch (err) { console.warn('Supabase procedimento create:', err); }
    }

    setProcedimentos((prev) => [created, ...prev]);
    setIsCloudSyncing(false);
    return created;
  };

  const updateProcedimento = async (id: string, updates: Partial<Procedimento>) => {
    setProcedimentos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (IS_SUPABASE_CONFIGURED) {
      try { await procedimentosService.update(id, updates); }
      catch (err) { console.warn('Supabase procedimento update:', err); }
    }
  };

  const deleteProcedimento = async (id: string) => {
    setProcedimentos((prev) => prev.filter((p) => p.id !== id));
    if (IS_SUPABASE_CONFIGURED) {
      try { await procedimentosService.delete(id); }
      catch (err) { console.warn('Supabase procedimento delete:', err); }
    }
  };

  /**
   * Zera todas as informações do banco de dados local (localStorage e estado em memória)
   */
  const zerarBancoDados = () => {
    [
      'v2_hospitais', 'v2_medicos', 'v2_convenios', 'v2_vendedores',
      'v2_cirurgias', 'v2_protocolos', 'v2_produtos', 'v2_estoques',
      'v2_veiculos', 'v2_lotes', 'v2_movimentos', 'v2_pacientes', 'v2_procedimentos'
    ].forEach((k) => localStorage.setItem(k, '[]'));
    localStorage.setItem('presty_excel_imported_v1', 'true');

    setHospitais([]);
    setMedicos([]);
    setConvenios([]);
    setVendedores([]);
    setCirurgias([]);
    setProtocolos([]);
    setProdutos([]);
    setEstoques([]);
    setVeiculos([]);
    setLotes([]);
    setMovimentos([]);
    setPacientes([]);
    setProcedimentos([]);
  };

  /**
   * Importa e restaura os dados da planilha Excel oficial
   */
  const importarDadosExcel = () => {
    [
      'v2_hospitais', 'v2_medicos', 'v2_convenios', 'v2_vendedores',
      'v2_cirurgias', 'v2_protocolos', 'v2_produtos', 'v2_estoques',
      'v2_veiculos', 'v2_lotes', 'v2_movimentos', 'v2_pacientes', 'v2_procedimentos'
    ].forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('presty_excel_imported_v1', 'true');

    setHospitais(INITIAL_HOSPITAIS);
    setMedicos(INITIAL_MEDICOS);
    setConvenios(INITIAL_CONVENIOS);
    setVendedores(INITIAL_VENDEDORES);
    setPacientes(INITIAL_PACIENTES);
    setProcedimentos(INITIAL_PROCEDIMENTOS);
    setProdutos(INITIAL_PRODUTOS);
    setCirurgias(INITIAL_CIRURGIAS);
    setProtocolos(INITIAL_PROTOCOLOS);
    setEstoques([]);
    setVeiculos([]);
    setLotes([]);
    setMovimentos([]);
  };

  return {
    // Estado
    hospitais, medicos, convenios, vendedores, pacientes, procedimentos, cirurgias, protocolos,
    produtos, estoques, veiculos, lotes, movimentos, isLoadingData, isCloudSyncing,

    // Cirurgias
    addCirurgia, updateCirurgia,

    // Protocolos OPME
    addProtocolo, updateProtocolo,

    // Produtos & Estoque
    addProduto, updateProduto, deleteProduto, addLote, addMovimento,

    // Cadastros
    addHospital, updateHospital, deleteHospital,
    addMedico, updateMedico, deleteMedico,
    addConvenio, updateConvenio, deleteConvenio,
    addVendedor, updateVendedor, deleteVendedor,
    addPaciente, updatePaciente, deletePaciente,
    addProcedimento, updateProcedimento, deleteProcedimento,

    // Zerar / Reset / Import
    zerarBancoDados,
    importarDadosExcel,

    // Sync manual
    reloadData: loadAllDataFromSupabase,
  };
}

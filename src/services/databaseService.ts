import { supabase } from '../lib/supabase/client';
import {
  Hospital,
  Medico,
  Convenio,
  Vendedor,
  Cirurgia,
  Protocolo,
  Produto,
  Venda,
  Veiculo,
  Condutor,
  ChecklistFrota,
} from '../types';

// =====================================================================
// HOSPITAIS SERVICE
// =====================================================================
export const hospitaisService = {
  async getAll(): Promise<Hospital[]> {
    const { data, error } = await supabase
      .from('hospitais')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data as Hospital[]) || [];
  },

  async create(h: Omit<Hospital, 'id'>): Promise<Hospital> {
    const { data, error } = await supabase
      .from('hospitais')
      .insert({
        nome: h.nome,
        cnpj: h.cnpj,
        cidade: h.cidade,
        estado: h.estado,
        contato: h.contato,
        ativo: h.ativo ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Hospital;
  },

  async update(id: string, updates: Partial<Hospital>): Promise<Hospital> {
    const { data, error } = await supabase
      .from('hospitais')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Hospital;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('hospitais').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// MÉDICOS SERVICE
// =====================================================================
export const medicosService = {
  async getAll(): Promise<Medico[]> {
    const { data, error } = await supabase
      .from('medicos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data as Medico[]) || [];
  },

  async create(m: Omit<Medico, 'id'>): Promise<Medico> {
    const { data, error } = await supabase
      .from('medicos')
      .insert({
        nome: m.nome,
        crm: m.crm,
        uf_crm: m.uf_crm,
        especialidade: m.especialidade,
        telefone: m.telefone,
        email: m.email,
        ativo: m.ativo ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Medico;
  },

  async update(id: string, updates: Partial<Medico>): Promise<Medico> {
    const { data, error } = await supabase
      .from('medicos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Medico;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('medicos').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// CONVÊNIOS SERVICE
// =====================================================================
export const conveniosService = {
  async getAll(): Promise<Convenio[]> {
    const { data, error } = await supabase
      .from('convenios')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data as Convenio[]) || [];
  },

  async create(c: Omit<Convenio, 'id'>): Promise<Convenio> {
    const { data, error } = await supabase
      .from('convenios')
      .insert({
        nome: c.nome,
        ans_codigo: c.ans_codigo,
        ativo: c.ativo ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Convenio;
  },

  async update(id: string, updates: Partial<Convenio>): Promise<Convenio> {
    const { data, error } = await supabase
      .from('convenios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Convenio;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('convenios').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// VENDEDORES SERVICE
// =====================================================================
export const vendedoresService = {
  async getAll(): Promise<Vendedor[]> {
    const { data, error } = await supabase
      .from('vendedores')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data as Vendedor[]) || [];
  },

  async create(v: Omit<Vendedor, 'id'>): Promise<Vendedor> {
    const { data, error } = await supabase
      .from('vendedores')
      .insert({
        nome: v.nome,
        email: v.email,
        comissao_padrao_pct: v.comissao_padrao_pct,
        ativo: v.ativo ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Vendedor;
  },

  async update(id: string, updates: Partial<Vendedor>): Promise<Vendedor> {
    const { data, error } = await supabase
      .from('vendedores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Vendedor;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('vendedores').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// CIRURGIAS SERVICE
// =====================================================================
export const cirurgiasService = {
  async getAll(): Promise<Cirurgia[]> {
    const { data, error } = await supabase
      .from('cirurgias')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw error;
    return (data as Cirurgia[]) || [];
  },

  async create(c: Omit<Cirurgia, 'id' | 'created_at'>): Promise<Cirurgia> {
    const { data, error } = await supabase
      .from('cirurgias')
      .insert({
        data: c.data,
        horario: c.horario,
        hospital_id: c.hospital_id || null,
        hospital_nome: c.hospital_nome,
        medico_id: c.medico_id || null,
        medico_nome: c.medico_nome,
        paciente: c.paciente,
        paciente_cpf: c.paciente_cpf,
        convenio_id: c.convenio_id || null,
        convenio_nome: c.convenio_nome,
        vendedor_id: c.vendedor_id || null,
        vendedor_nome: c.vendedor_nome,
        situacao: c.situacao || 'Agendada',
        equipamento: c.equipamento,
        acessorio: c.acessorio,
        ld_ct: c.ld_ct,
        material_previsto: c.material_previsto,
        tecnico_nome: c.tecnico_nome,
        observacao: c.observacao,
        empresa_id: c.empresa_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Cirurgia;
  },

  async update(id: string, updates: Partial<Cirurgia>): Promise<Cirurgia> {
    const { data, error } = await supabase
      .from('cirurgias')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Cirurgia;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('cirurgias').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// PROTOCOLOS & COTAÇÕES SERVICE
// =====================================================================
export const protocolosService = {
  async getAll(): Promise<Protocolo[]> {
    const { data: protocolosData, error } = await supabase
      .from('protocolos')
      .select('*, itens:protocolo_itens(*)')
      .order('data', { ascending: false });

    if (error) throw error;
    return (protocolosData as Protocolo[]) || [];
  },

  async create(p: Omit<Protocolo, 'id' | 'numero' | 'created_at'>): Promise<Protocolo> {
    const numero = `PROT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: prot, error: protError } = await supabase
      .from('protocolos')
      .insert({
        numero,
        data: p.data || new Date().toISOString().split('T')[0],
        medico_nome: p.medico_nome,
        crm: p.crm,
        paciente: p.paciente,
        hospital_nome: p.hospital_nome,
        convenio_nome: p.convenio_nome,
        procedimento: p.procedimento,
        data_cirurgia: p.data_cirurgia,
        status: p.status || 'Rascunho',
        vendedor_nome: p.vendedor_nome,
        valor_total: p.valor_total || 0,
        observacao: p.observacao,
      })
      .select()
      .single();

    if (protError) throw protError;

    // Se houver itens vinculados
    if (p.itens && p.itens.length > 0) {
      const itensInsert = p.itens.map((it) => ({
        protocolo_id: prot.id,
        produto_codigo: it.produto_codigo,
        descricao: it.descricao,
        quantidade: it.quantidade,
        valor_unitario: it.valor_unitario,
        anvisa: it.anvisa,
      }));

      const { data: itensCriados, error: itensError } = await supabase
        .from('protocolo_itens')
        .insert(itensInsert)
        .select();

      if (!itensError && itensCriados) {
        prot.itens = itensCriados;
      }
    }

    return prot as Protocolo;
  },
};

// =====================================================================
// ESTOQUE & PRODUTOS SERVICE
// =====================================================================
export const produtosService = {
  async getAll(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('descricao', { ascending: true });

    if (error) throw error;
    return (data as Produto[]) || [];
  },

  async create(p: Omit<Produto, 'id'>): Promise<Produto> {
    const { data, error } = await supabase
      .from('produtos')
      .insert({
        codigo: p.codigo,
        descricao: p.descricao,
        fabricante: p.fabricante,
        anvisa: p.anvisa,
        grupo: p.grupo,
        subgrupo: p.subgrupo,
        unidade: p.unidade || 'UN',
        valor_custo: p.valor_custo,
        valor_venda: p.valor_venda,
        controla_serie: p.controla_serie ?? false,
        is_kit: p.is_kit ?? false,
        saldo_total: p.saldo_total ?? 0,
        ativo: p.ativo ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Produto;
  },

  async update(id: string, updates: Partial<Produto>): Promise<Produto> {
    const { data, error } = await supabase
      .from('produtos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Produto;
  },
};

// =====================================================================
// VENDAS SERVICE
// =====================================================================
export const vendasService = {
  async getAll(): Promise<Venda[]> {
    const { data, error } = await supabase
      .from('vendas')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw error;
    return (data as Venda[]) || [];
  },

  async create(v: Omit<Venda, 'id' | 'created_at'>): Promise<Venda> {
    const { data, error } = await supabase
      .from('vendas')
      .insert(v)
      .select()
      .single();

    if (error) throw error;
    return data as Venda;
  },
};

// =====================================================================
// FROTA & VEÍCULOS SERVICE
// =====================================================================
export const frotaService = {
  async getVeiculos(): Promise<Veiculo[]> {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .order('placa', { ascending: true });

    if (error) throw error;
    return (data as Veiculo[]) || [];
  },

  async createVeiculo(v: Omit<Veiculo, 'id'>): Promise<Veiculo> {
    const { data, error } = await supabase
      .from('veiculos')
      .insert(v)
      .select()
      .single();

    if (error) throw error;
    return data as Veiculo;
  },

  async updateVeiculo(id: string, updates: Partial<Veiculo>): Promise<Veiculo> {
    const { data, error } = await supabase
      .from('veiculos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Veiculo;
  },

  async deleteVeiculo(id: string): Promise<void> {
    const { error } = await supabase.from('veiculos').delete().eq('id', id);
    if (error) throw error;
  },

  async getCondutores(): Promise<Condutor[]> {
    const { data, error } = await supabase
      .from('condutores')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data as Condutor[]) || [];
  },

  async createCondutor(c: Omit<Condutor, 'id'>): Promise<Condutor> {
    const { data, error } = await supabase
      .from('condutores')
      .insert(c)
      .select()
      .single();

    if (error) throw error;
    return data as Condutor;
  },

  async updateCondutor(id: string, updates: Partial<Condutor>): Promise<Condutor> {
    const { data, error } = await supabase
      .from('condutores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Condutor;
  },

  async deleteCondutor(id: string): Promise<void> {
    const { error } = await supabase.from('condutores').delete().eq('id', id);
    if (error) throw error;
  },

  async saveChecklist(c: Omit<ChecklistFrota, 'id'>): Promise<ChecklistFrota> {
    const { data, error } = await supabase
      .from('checklists')
      .insert(c)
      .select()
      .single();

    if (error) throw error;
    return data as ChecklistFrota;
  },
};

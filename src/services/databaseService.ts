import { supabase } from '../lib/supabase/client';
import type {
  Hospital,
  Medico,
  Convenio,
  Vendedor,
  Procedimento,
  Paciente,
  Produto,
  Estoque,
  ProtocoloOPME,
  ProtocoloItem,
  Autorizacao,
  Cirurgia,
  Reserva,
  Equipamento,
  OrdemServico,
  Rota,
  OperationalEvent,
  Notification,
  StatusProtocolo,
  StatusCirurgia,
  StatusEquipamento,
  StatusOS,
  StatusAutorizacao,
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
        endereco: h.endereco,
        bairro: h.bairro,
        cidade: h.cidade,
        estado: h.estado,
        cep: h.cep,
        telefone: h.telefone,
        email: h.email,
        contato_principal: h.contato_principal,
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
        registro: c.registro,
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
        user_id: v.user_id,
        nome: v.nome,
        email: v.email,
        telefone: v.telefone,
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
// PROCEDIMENTOS SERVICE
// =====================================================================
export const procedimentosService = {
  async getAll(): Promise<Procedimento[]> {
    const { data, error } = await supabase
      .from('procedimentos')
      .select('*')
      .order('descricao', { ascending: true });

    if (error) throw error;
    return (data as Procedimento[]) || [];
  },

  async create(p: Omit<Procedimento, 'id'>): Promise<Procedimento> {
    const { data, error } = await supabase
      .from('procedimentos')
      .insert({
        codigo: p.codigo,
        descricao: p.descricao,
        especialidade: p.especialidade,
        ativo: p.ativo ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Procedimento;
  },

  async update(id: string, updates: Partial<Procedimento>): Promise<Procedimento> {
    const { data, error } = await supabase
      .from('procedimentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Procedimento;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('procedimentos').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// PACIENTES SERVICE
// =====================================================================
export const pacientesService = {
  async getAll(): Promise<Paciente[]> {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data as Paciente[]) || [];
  },

  async create(p: Omit<Paciente, 'id'>): Promise<Paciente> {
    const { data, error } = await supabase
      .from('pacientes')
      .insert({
        nome: p.nome,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Paciente;
  },

  /** Busca por nome parcial (case-insensitive) */
  async search(nome: string): Promise<Paciente[]> {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .ilike('nome', `%${nome}%`)
      .order('nome', { ascending: true })
      .limit(20);

    if (error) throw error;
    return (data as Paciente[]) || [];
  },

  async update(id: string, updates: Partial<Paciente>): Promise<Paciente> {
    const { data, error } = await supabase
      .from('pacientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Paciente;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================================
// PRODUTOS SERVICE (SEM campos financeiros)
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
        categoria_id: p.categoria_id,
        fabricante_id: p.fabricante_id,
        unidade_id: p.unidade_id,
        unidade: p.unidade || 'UN',
        anvisa: p.anvisa,
        controla_lote: p.controla_lote ?? false,
        controla_validade: p.controla_validade ?? false,
        controla_serie: p.controla_serie ?? false,
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

  async getByCode(codigo: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error) throw error;
    return data as Produto | null;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================================
// ESTOQUES SERVICE
// =====================================================================
export const estoquesService = {
  async getByProduto(produto_id: string): Promise<Estoque[]> {
    const { data, error } = await supabase
      .from('estoques')
      .select('*')
      .eq('produto_id', produto_id)
      .order('validade', { ascending: true });

    if (error) throw error;
    return (data as Estoque[]) || [];
  },

  /** Retorna apenas registros com saldo disponível > 0 */
  async getBySaldo(): Promise<Estoque[]> {
    const { data, error } = await supabase
      .from('estoques')
      .select('*')
      .gt('quantidade_disponivel', 0)
      .order('validade', { ascending: true });

    if (error) throw error;
    return (data as Estoque[]) || [];
  },

  async create(e: Omit<Estoque, 'id'>): Promise<Estoque> {
    const { data, error } = await supabase
      .from('estoques')
      .insert({
        produto_id: e.produto_id,
        localizacao_id: e.localizacao_id,
        lote: e.lote,
        numero_serie: e.numero_serie,
        validade: e.validade,
        fabricacao: e.fabricacao,
        quantidade_disponivel: e.quantidade_disponivel ?? 0,
        quantidade_reservada: e.quantidade_reservada ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Estoque;
  },
};

// =====================================================================
// PROTOCOLOS SERVICE
// =====================================================================
export const protocolosService = {
  async getAll(): Promise<ProtocoloOPME[]> {
    const { data, error } = await supabase
      .from('protocolos')
      .select('*, itens:protocolo_itens(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as ProtocoloOPME[]) || [];
  },

  async getById(id: string): Promise<ProtocoloOPME | null> {
    const { data, error } = await supabase
      .from('protocolos')
      .select('*, itens:protocolo_itens(*), autorizacao:autorizacoes(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ProtocoloOPME | null;
  },

  async create(p: Omit<ProtocoloOPME, 'id' | 'created_at'>): Promise<ProtocoloOPME> {
    const { data: prot, error: protError } = await supabase
      .from('protocolos')
      .insert({
        numero_it: p.numero_it,
        numero_protocolo: p.numero_protocolo,
        hospital_id: p.hospital_id,
        hospital_nome: p.hospital_nome,
        medico_id: p.medico_id,
        medico_nome: p.medico_nome,
        paciente_id: p.paciente_id,
        paciente: p.paciente,
        procedimento_id: p.procedimento_id,
        procedimento_nome: p.procedimento_nome,
        convenio_id: p.convenio_id,
        convenio_nome: p.convenio_nome,
        vendedor_id: p.vendedor_id,
        vendedor_nome: p.vendedor_nome,
        status: p.status || 'RASCUNHO',
        data_protocolo: p.data_protocolo,
        data_cirurgia: p.data_cirurgia,
        observacoes: p.observacoes,
        documentos: p.documentos,
        created_by: p.created_by,
      })
      .select()
      .single();

    if (protError) throw protError;

    if (p.itens && p.itens.length > 0) {
      const itensInsert = p.itens.map((it) => ({
        protocolo_id: prot.id,
        numero_it: it.numero_it,
        produto_id: it.produto_id,
        produto_codigo: it.produto_codigo,
        descricao_produto: it.descricao_produto,
        quantidade: it.quantidade,
        indicacao: it.indicacao,
        observacoes: it.observacoes,
      }));

      const { error: itensError } = await supabase
        .from('protocolo_itens')
        .insert(itensInsert);

      if (itensError) throw itensError;
    }

    return prot as ProtocoloOPME;
  },

  async update(id: string, updates: Partial<ProtocoloOPME>): Promise<ProtocoloOPME> {
    const { data, error } = await supabase
      .from('protocolos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProtocoloOPME;
  },

  async updateStatus(id: string, status: StatusProtocolo): Promise<ProtocoloOPME> {
    const { data, error } = await supabase
      .from('protocolos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProtocoloOPME;
  },
};

// =====================================================================
// AUTORIZAÇÕES SERVICE
// =====================================================================
export const autorizacoesService = {
  async getAll(): Promise<Autorizacao[]> {
    const { data, error } = await supabase
      .from('autorizacoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Autorizacao[]) || [];
  },

  async getByProtocolo(protocolo_id: string): Promise<Autorizacao | null> {
    const { data, error } = await supabase
      .from('autorizacoes')
      .select('*')
      .eq('protocolo_id', protocolo_id)
      .maybeSingle();

    if (error) throw error;
    return data as Autorizacao | null;
  },

  async create(a: Omit<Autorizacao, 'id' | 'created_at'>): Promise<Autorizacao> {
    const { data, error } = await supabase
      .from('autorizacoes')
      .insert({
        protocolo_id: a.protocolo_id,
        numero_autorizacao: a.numero_autorizacao,
        status: a.status || 'PENDENTE',
        data_autorizacao: a.data_autorizacao,
        data_validade: a.data_validade,
        responsavel_autorizacao: a.responsavel_autorizacao,
        observacoes: a.observacoes,
        responsavel_id: a.responsavel_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Autorizacao;
  },

  async update(id: string, updates: Partial<Autorizacao>): Promise<Autorizacao> {
    const { data, error } = await supabase
      .from('autorizacoes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Autorizacao;
  },

  /** Autoriza e atualiza o status do protocolo para AUTORIZADO */
  async autorizar(
    id: string,
    numero_autorizacao: string,
    data_validade?: string,
    responsavel_id?: string,
  ): Promise<Autorizacao> {
    const { data, error } = await supabase
      .from('autorizacoes')
      .update({
        status: 'AUTORIZADA' as StatusAutorizacao,
        numero_autorizacao,
        data_autorizacao: new Date().toISOString().split('T')[0],
        data_validade,
        responsavel_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Autorizacao;
  },

  /** Nega a autorização */
  async negar(id: string, observacoes: string, responsavel_id?: string): Promise<Autorizacao> {
    const { data, error } = await supabase
      .from('autorizacoes')
      .update({
        status: 'NAO_AUTORIZADA' as StatusAutorizacao,
        observacoes,
        responsavel_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Autorizacao;
  },
};

// =====================================================================
// CIRURGIAS SERVICE — MAPA CIRÚRGICO
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

  async getById(id: string): Promise<Cirurgia | null> {
    const { data, error } = await supabase
      .from('cirurgias')
      .select('*, materiais:cirurgia_materiais(*), equipamentos:cirurgia_equipamentos(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Cirurgia | null;
  },

  async create(c: Omit<Cirurgia, 'id' | 'created_at'>): Promise<Cirurgia> {
    const { data, error } = await supabase
      .from('cirurgias')
      .insert({
        numero_it: c.numero_it,
        protocolo_id: c.protocolo_id,
        autorizacao_id: c.autorizacao_id,
        status: c.status || 'AGUARDANDO_AUTORIZACAO',
        data: c.data,
        horario: c.horario,
        hospital_id: c.hospital_id,
        hospital_nome: c.hospital_nome,
        centro_cirurgico_id: c.centro_cirurgico_id,
        sala: c.sala,
        medico_id: c.medico_id,
        medico_nome: c.medico_nome,
        paciente: c.paciente,
        procedimento_id: c.procedimento_id,
        procedimento_nome: c.procedimento_nome,
        convenio_id: c.convenio_id,
        convenio_nome: c.convenio_nome,
        vendedor_id: c.vendedor_id,
        vendedor_nome: c.vendedor_nome,
        observacoes: c.observacoes,
        created_by: c.created_by,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Cirurgia;
  },

  async update(id: string, updates: Partial<Cirurgia>): Promise<Cirurgia> {
    const { data, error } = await supabase
      .from('cirurgias')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Cirurgia;
  },

  async updateStatus(id: string, status: StatusCirurgia): Promise<Cirurgia> {
    const { data, error } = await supabase
      .from('cirurgias')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Cirurgia;
  },

  /** Busca cirurgias por data específica (YYYY-MM-DD) */
  async getByData(data: string): Promise<Cirurgia[]> {
    const { data: rows, error } = await supabase
      .from('cirurgias')
      .select('*')
      .eq('data', data)
      .order('horario', { ascending: true });

    if (error) throw error;
    return (rows as Cirurgia[]) || [];
  },

  /** Retorna as cirurgias do dia atual */
  async getToday(): Promise<Cirurgia[]> {
    const today = new Date().toISOString().split('T')[0];
    return cirurgiasService.getByData(today);
  },
};

// =====================================================================
// RESERVAS SERVICE
// =====================================================================
export const reservasService = {
  async getAll(): Promise<Reserva[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('*, itens:reserva_itens(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Reserva[]) || [];
  },

  async getByCirurgia(cirurgia_id: string): Promise<Reserva[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('*, itens:reserva_itens(*)')
      .eq('cirurgia_id', cirurgia_id);

    if (error) throw error;
    return (data as Reserva[]) || [];
  },

  async create(r: Omit<Reserva, 'id' | 'created_at'>): Promise<Reserva> {
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert({
        cirurgia_id: r.cirurgia_id,
        protocolo_id: r.protocolo_id,
        status: r.status || 'PENDENTE',
        data_reserva: r.data_reserva,
        data_necessidade: r.data_necessidade,
        observacoes: r.observacoes,
        created_by: r.created_by,
      })
      .select()
      .single();

    if (reservaError) throw reservaError;

    if (r.itens && r.itens.length > 0) {
      const itensInsert = r.itens.map((it) => ({
        reserva_id: reserva.id,
        produto_id: it.produto_id,
        estoque_id: it.estoque_id,
        quantidade_solicitada: it.quantidade_solicitada,
        quantidade_reservada: it.quantidade_reservada ?? 0,
        quantidade_separada: it.quantidade_separada ?? 0,
        quantidade_utilizada: it.quantidade_utilizada ?? 0,
        quantidade_retornada: it.quantidade_retornada ?? 0,
        lote: it.lote,
        numero_serie: it.numero_serie,
        status: it.status || 'PENDENTE',
        observacoes: it.observacoes,
      }));

      const { error: itensError } = await supabase
        .from('reserva_itens')
        .insert(itensInsert);

      if (itensError) throw itensError;
    }

    return reserva as Reserva;
  },

  async confirmReserva(id: string): Promise<Reserva> {
    const { data, error } = await supabase
      .from('reservas')
      .update({ status: 'CONFIRMADA', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Reserva;
  },
};

// =====================================================================
// EQUIPAMENTOS SERVICE
// =====================================================================
export const equipamentosService = {
  async getAll(): Promise<Equipamento[]> {
    const { data, error } = await supabase
      .from('equipamentos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data as Equipamento[]) || [];
  },

  async getDisponiveis(): Promise<Equipamento[]> {
    const { data, error } = await supabase
      .from('equipamentos')
      .select('*')
      .eq('status', 'DISPONIVEL')
      .eq('ativo', true)
      .eq('disponivel_para_reserva', true)
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data as Equipamento[]) || [];
  },

  async update(id: string, updates: Partial<Equipamento>): Promise<Equipamento> {
    const { data, error } = await supabase
      .from('equipamentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Equipamento;
  },

  async updateStatus(id: string, status: StatusEquipamento): Promise<Equipamento> {
    const { data, error } = await supabase
      .from('equipamentos')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Equipamento;
  },
};

// =====================================================================
// ORDENS DE SERVIÇO SERVICE
// =====================================================================
export const ordensServicoService = {
  async getAll(): Promise<OrdemServico[]> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*, itens:os_itens(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as OrdemServico[]) || [];
  },

  async getByStatus(status: StatusOS): Promise<OrdemServico[]> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*, itens:os_itens(*)')
      .eq('status', status)
      .order('data_planejada', { ascending: true });

    if (error) throw error;
    return (data as OrdemServico[]) || [];
  },

  async create(os: Omit<OrdemServico, 'id' | 'created_at'>): Promise<OrdemServico> {
    const { data: ordemData, error: osError } = await supabase
      .from('ordens_servico')
      .insert({
        numero: os.numero,
        cirurgia_id: os.cirurgia_id,
        hospital_id: os.hospital_id,
        hospital_nome: os.hospital_nome,
        endereco_entrega: os.endereco_entrega,
        tipo: os.tipo,
        motorista_id: os.motorista_id,
        motorista_nome: os.motorista_nome,
        veiculo_id: os.veiculo_id,
        veiculo_placa: os.veiculo_placa,
        data_planejada: os.data_planejada,
        horario_planejado: os.horario_planejado,
        status: os.status || 'PENDENTE',
        observacoes: os.observacoes,
        created_by: os.created_by,
      })
      .select()
      .single();

    if (osError) throw osError;

    if (os.itens && os.itens.length > 0) {
      const itensInsert = os.itens.map((it) => ({
        os_id: ordemData.id,
        tipo: it.tipo,
        produto_id: it.produto_id,
        equipamento_id: it.equipamento_id,
        descricao: it.descricao,
        quantidade: it.quantidade,
        lote: it.lote,
        numero_serie: it.numero_serie,
        divergencia: it.divergencia ?? false,
        divergencia_descricao: it.divergencia_descricao,
      }));

      const { error: itensError } = await supabase
        .from('os_itens')
        .insert(itensInsert);

      if (itensError) throw itensError;
    }

    return ordemData as OrdemServico;
  },

  async update(id: string, updates: Partial<OrdemServico>): Promise<OrdemServico> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as OrdemServico;
  },

  async concluir(id: string, comprovante_url?: string, responsavel_recebimento?: string): Promise<OrdemServico> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .update({
        status: 'CONCLUIDA' as StatusOS,
        data_execucao: new Date().toISOString(),
        comprovante_url,
        responsavel_recebimento,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as OrdemServico;
  },
};

// =====================================================================
// ROTAS SERVICE
// =====================================================================
export const rotasService = {
  async getAll(): Promise<Rota[]> {
    const { data, error } = await supabase
      .from('rotas')
      .select('*, paradas:rota_paradas(*)')
      .order('data', { ascending: false });

    if (error) throw error;
    return (data as Rota[]) || [];
  },

  async getByData(data: string): Promise<Rota[]> {
    const { data: rows, error } = await supabase
      .from('rotas')
      .select('*, paradas:rota_paradas(*)')
      .eq('data', data)
      .order('horario_partida_planejado', { ascending: true });

    if (error) throw error;
    return (rows as Rota[]) || [];
  },

  async create(r: Omit<Rota, 'id'>): Promise<Rota> {
    const { data, error } = await supabase
      .from('rotas')
      .insert({
        numero: r.numero,
        data: r.data,
        motorista_id: r.motorista_id,
        veiculo_id: r.veiculo_id,
        status: r.status || 'PLANEJADA',
        horario_partida_planejado: r.horario_partida_planejado,
        horario_retorno_planejado: r.horario_retorno_planejado,
        observacoes: r.observacoes,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Rota;
  },

  async update(id: string, updates: Partial<Rota>): Promise<Rota> {
    const { data, error } = await supabase
      .from('rotas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Rota;
  },
};

// =====================================================================
// OPERATIONAL EVENTS SERVICE (Timeline)
// =====================================================================
export const operationalEventsService = {
  async getByCirurgia(cirurgia_id: string): Promise<OperationalEvent[]> {
    const { data, error } = await supabase
      .from('operational_events')
      .select('*')
      .eq('cirurgia_id', cirurgia_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as OperationalEvent[]) || [];
  },

  async getByProtocolo(protocolo_id: string): Promise<OperationalEvent[]> {
    const { data, error } = await supabase
      .from('operational_events')
      .select('*')
      .eq('protocolo_id', protocolo_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as OperationalEvent[]) || [];
  },

  async createEvent(event: Omit<OperationalEvent, 'id' | 'created_at'>): Promise<OperationalEvent> {
    const { data, error } = await supabase
      .from('operational_events')
      .insert({
        tipo: event.tipo,
        descricao: event.descricao,
        protocolo_id: event.protocolo_id,
        autorizacao_id: event.autorizacao_id,
        cirurgia_id: event.cirurgia_id,
        reserva_id: event.reserva_id,
        os_id: event.os_id,
        usuario_id: event.usuario_id,
        metadados: event.metadados,
      })
      .select()
      .single();

    if (error) throw error;
    return data as OperationalEvent;
  },
};

// =====================================================================
// NOTIFICATIONS SERVICE
// =====================================================================
export const notificationsService = {
  async getByUser(usuario_id: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('usuario_id', usuario_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Notification[]) || [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('id', id);

    if (error) throw error;
  },

  async create(n: Omit<Notification, 'id' | 'created_at' | 'lida'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        usuario_id: n.usuario_id,
        tipo: n.tipo,
        titulo: n.titulo,
        mensagem: n.mensagem,
        lida: false,
        protocolo_id: n.protocolo_id,
        cirurgia_id: n.cirurgia_id,
        link_acao: n.link_acao,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },
};

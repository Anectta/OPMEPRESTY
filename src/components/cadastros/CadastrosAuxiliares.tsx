import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Hospital, Medico, Convenio, Vendedor, Paciente, Procedimento, Produto } from '../../types';
import { Layers, Building2, Stethoscope, HeartHandshake, UserCheck, Users, Activity, Package, Plus, Edit2, Trash2, X, Search } from 'lucide-react';

export const CadastrosAuxiliares: React.FC = () => {
  const {
    hospitais, medicos, convenios, vendedores, pacientes, procedimentos, produtos,
    addHospital, updateHospital, deleteHospital,
    addMedico, updateMedico, deleteMedico,
    addConvenio, updateConvenio, deleteConvenio,
    addVendedor, updateVendedor, deleteVendedor,
    addPaciente, updatePaciente, deletePaciente,
    addProcedimento, updateProcedimento, deleteProcedimento,
    addProduto, updateProduto, deleteProduto,
  } = useData();
  const { logAuditEvent } = useAuth();

  const [activeTab, setActiveTab] = useState<'hospitais' | 'medicos' | 'pacientes' | 'procedimentos' | 'produtos' | 'convenios' | 'vendedores'>('hospitais');

  // Modal states
  const [modalType, setModalType] = useState<'hospital' | 'medico' | 'convenio' | 'vendedor' | 'paciente' | 'procedimento' | 'produto' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [pacienteSearch, setPacienteSearch] = useState('');
  const [procedimentoSearch, setProcedimentoSearch] = useState('');
  const [produtoSearch, setProdutoSearch] = useState('');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [medicoSearch, setMedicoSearch] = useState('');
  const [convenioSearch, setConvenioSearch] = useState('');
  const [vendedorSearch, setVendedorSearch] = useState('');

  // Forms
  const [hospitalForm, setHospitalForm] = useState({
    nome: '',
    cnpj: '',
    cidade: 'São Paulo',
    estado: 'SP',
    contato: '',
    ativo: true,
  });

  const [medicoForm, setMedicoForm] = useState({
    nome: '',
    crm: '',
    uf_crm: 'SP',
    especialidade: 'Ortopedia e Traumatologia',
    telefone: '',
    email: '',
    ativo: true,
  });

  const [convenioForm, setConvenioForm] = useState({
    nome: '',
    ans_codigo: '',
    ativo: true,
  });

  const [vendedorForm, setVendedorForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    ativo: true,
  });

  const [pacienteForm, setPacienteForm] = useState({
    nome: '',
  });

  const [procedimentoForm, setProcedimentoForm] = useState({
    codigo: '',
    descricao: '',
    especialidade: 'Ortopedia e Traumatologia',
    ativo: true,
  });

  const [produtoForm, setProdutoForm] = useState({
    codigo: '',
    descricao: '',
    unidade: 'UN',
    ativo: true,
  });

  // Open Handlers
  const handleOpenHospitalModal = (h?: Hospital) => {
    if (h) {
      setEditingItem(h);
      setHospitalForm({ nome: h.nome, cnpj: h.cnpj || '', cidade: h.cidade || '', estado: h.estado || '', contato: h.contato_principal || '', ativo: h.ativo });
    } else {
      setEditingItem(null);
      setHospitalForm({ nome: '', cnpj: '', cidade: 'São Paulo', estado: 'SP', contato: '', ativo: true });
    }
    setModalType('hospital');
  };

  const handleOpenMedicoModal = (m?: Medico) => {
    if (m) {
      setEditingItem(m);
      setMedicoForm({ nome: m.nome, crm: m.crm, uf_crm: m.uf_crm, especialidade: m.especialidade, telefone: m.telefone || '', email: m.email || '', ativo: m.ativo });
    } else {
      setEditingItem(null);
      setMedicoForm({ nome: 'Dr. ', crm: '', uf_crm: 'SP', especialidade: 'Ortopedia e Traumatologia', telefone: '', email: '', ativo: true });
    }
    setModalType('medico');
  };

  const handleOpenConvenioModal = (c?: Convenio) => {
    if (c) {
      setEditingItem(c);
      setConvenioForm({ nome: c.nome, ans_codigo: c.ans_codigo, ativo: c.ativo });
    } else {
      setEditingItem(null);
      setConvenioForm({ nome: '', ans_codigo: '', ativo: true });
    }
    setModalType('convenio');
  };

  const handleOpenVendedorModal = (v?: Vendedor) => {
    if (v) {
      setEditingItem(v);
      setVendedorForm({ nome: v.nome, email: v.email || '', telefone: v.telefone || '', ativo: v.ativo });
    } else {
      setEditingItem(null);
      setVendedorForm({ nome: '', email: '', telefone: '', ativo: true });
    }
    setModalType('vendedor');
  };

  const handleOpenPacienteModal = (p?: Paciente) => {
    if (p) {
      setEditingItem(p);
      setPacienteForm({ nome: p.nome });
    } else {
      setEditingItem(null);
      setPacienteForm({ nome: '' });
    }
    setModalType('paciente');
  };

  const handleOpenProcedimentoModal = (p?: Procedimento) => {
    if (p) {
      setEditingItem(p);
      setProcedimentoForm({
        codigo: p.codigo,
        descricao: p.descricao,
        especialidade: p.especialidade || 'Ortopedia e Traumatologia',
        ativo: p.ativo,
      });
    } else {
      setEditingItem(null);
      setProcedimentoForm({
        codigo: '',
        descricao: '',
        especialidade: 'Ortopedia e Traumatologia',
        ativo: true,
      });
    }
    setModalType('procedimento');
  };

  const handleOpenProdutoModal = (p?: Produto) => {
    if (p) {
      setEditingItem(p);
      setProdutoForm({
        codigo: p.codigo,
        descricao: p.descricao,
        unidade: p.unidade || 'UN',
        ativo: p.ativo ?? true,
      });
    } else {
      setEditingItem(null);
      setProdutoForm({
        codigo: '',
        descricao: '',
        unidade: 'UN',
        ativo: true,
      });
    }
    setModalType('produto');
  };

  // Submit Handlers
  const handleHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateHospital(editingItem.id, hospitalForm);
      logAuditEvent('UPDATE_HOSPITAL', 'Cadastros', editingItem.nome, { cnpj: hospitalForm.cnpj });
    } else {
      addHospital(hospitalForm);
      logAuditEvent('CREATE_HOSPITAL', 'Cadastros', hospitalForm.nome, { cnpj: hospitalForm.cnpj });
    }
    setModalType(null);
  };

  const handleMedicoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMedico(editingItem.id, medicoForm);
      logAuditEvent('UPDATE_MEDICO', 'Cadastros', editingItem.nome, { crm: medicoForm.crm });
    } else {
      addMedico(medicoForm);
      logAuditEvent('CREATE_MEDICO', 'Cadastros', medicoForm.nome, { crm: medicoForm.crm });
    }
    setModalType(null);
  };

  const handleConvenioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateConvenio(editingItem.id, convenioForm);
      logAuditEvent('UPDATE_CONVENIO', 'Cadastros', editingItem.nome, { ans: convenioForm.ans_codigo });
    } else {
      addConvenio(convenioForm);
      logAuditEvent('CREATE_CONVENIO', 'Cadastros', convenioForm.nome, { ans: convenioForm.ans_codigo });
    }
    setModalType(null);
  };

  const handleVendedorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateVendedor(editingItem.id, vendedorForm);
      logAuditEvent('UPDATE_VENDEDOR', 'Cadastros', editingItem.nome, { email: vendedorForm.email });
    } else {
      addVendedor(vendedorForm);
      logAuditEvent('CREATE_VENDEDOR', 'Cadastros', vendedorForm.nome, { email: vendedorForm.email });
    }
    setModalType(null);
  };

  const handlePacienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteForm.nome.trim()) return;
    if (editingItem) {
      updatePaciente(editingItem.id, { nome: pacienteForm.nome.trim() });
      logAuditEvent('UPDATE_PACIENTE', 'Cadastros', pacienteForm.nome.trim());
    } else {
      addPaciente({ nome: pacienteForm.nome.trim() });
      logAuditEvent('CREATE_PACIENTE', 'Cadastros', pacienteForm.nome.trim());
    }
    setModalType(null);
  };

  const handleProcedimentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedimentoForm.descricao.trim()) return;
    if (editingItem) {
      updateProcedimento(editingItem.id, procedimentoForm);
      logAuditEvent('UPDATE_PROCEDIMENTO', 'Cadastros', editingItem.descricao, { codigo: procedimentoForm.codigo });
    } else {
      addProcedimento(procedimentoForm);
      logAuditEvent('CREATE_PROCEDIMENTO', 'Cadastros', procedimentoForm.descricao, { codigo: procedimentoForm.codigo });
    }
    setModalType(null);
  };

  const handleProdutoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoForm.descricao.trim()) return;
    const cod = produtoForm.codigo.trim() || `OPME-${Date.now().toString().slice(-4)}`;
    if (editingItem) {
      updateProduto(editingItem.id, {
        codigo: cod,
        descricao: produtoForm.descricao.trim(),
        unidade: produtoForm.unidade || 'UN',
        ativo: produtoForm.ativo,
      });
      logAuditEvent('UPDATE_PRODUTO', 'Cadastros', produtoForm.descricao.trim(), { codigo: cod });
    } else {
      addProduto({
        codigo: cod,
        descricao: produtoForm.descricao.trim(),
        unidade: produtoForm.unidade || 'UN',
        controla_lote: true,
        controla_validade: true,
        controla_serie: true,
        ativo: produtoForm.ativo,
      });
      logAuditEvent('CREATE_PRODUTO', 'Cadastros', produtoForm.descricao.trim(), { codigo: cod });
    }
    setModalType(null);
  };

  // Delete Handlers
  const handleDeleteHospital = (h: Hospital) => {
    if (confirm(`Excluir o hospital "${h.nome}"?`)) {
      deleteHospital(h.id);
      logAuditEvent('DELETE_HOSPITAL', 'Cadastros', h.nome);
    }
  };

  const handleDeleteMedico = (m: Medico) => {
    if (confirm(`Excluir o médico "${m.nome}"?`)) {
      deleteMedico(m.id);
      logAuditEvent('DELETE_MEDICO', 'Cadastros', m.nome);
    }
  };

  const handleDeleteConvenio = (c: Convenio) => {
    if (confirm(`Excluir o convênio "${c.nome}"?`)) {
      deleteConvenio(c.id);
      logAuditEvent('DELETE_CONVENIO', 'Cadastros', c.nome);
    }
  };

  const handleDeleteVendedor = (v: Vendedor) => {
    if (confirm(`Excluir o vendedor "${v.nome}"?`)) {
      deleteVendedor(v.id);
      logAuditEvent('DELETE_VENDEDOR', 'Cadastros', v.nome);
    }
  };

  const handleDeletePaciente = (p: Paciente) => {
    if (confirm(`Excluir o paciente "${p.nome}"?`)) {
      deletePaciente(p.id);
      logAuditEvent('DELETE_PACIENTE', 'Cadastros', p.nome);
    }
  };

  const handleDeleteProcedimento = (p: Procedimento) => {
    if (confirm(`Excluir o procedimento "${p.descricao}"?`)) {
      deleteProcedimento(p.id);
      logAuditEvent('DELETE_PROCEDIMENTO', 'Cadastros', p.descricao);
    }
  };

  const handleDeleteProduto = (p: Produto) => {
    if (confirm(`Excluir o produto "${p.descricao}"?`)) {
      deleteProduto(p.id);
      logAuditEvent('DELETE_PRODUTO', 'Cadastros', p.descricao);
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Cadastros Auxiliares OPME
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Gerenciamento de tabelas mestres de pacientes, hospitais, médicos cirurgiões, convênios de saúde e representantes.
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          {activeTab === 'pacientes' && (
            <button
              onClick={() => handleOpenPacienteModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Paciente
            </button>
          )}
          {activeTab === 'procedimentos' && (
            <button
              onClick={() => handleOpenProcedimentoModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Procedimento
            </button>
          )}
          {activeTab === 'produtos' && (
            <button
              onClick={() => handleOpenProdutoModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          )}
          {activeTab === 'hospitais' && (
            <button
              onClick={() => handleOpenHospitalModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Hospital
            </button>
          )}
          {activeTab === 'medicos' && (
            <button
              onClick={() => handleOpenMedicoModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Médico
            </button>
          )}
          {activeTab === 'convenios' && (
            <button
              onClick={() => handleOpenConvenioModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Convênio
            </button>
          )}
          {activeTab === 'vendedores' && (
            <button
              onClick={() => handleOpenVendedorModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Representante
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">PACIENTES</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{pacientes?.length || 0}</p>
          <p className="text-[10px] font-bold text-sky-600 mt-0.5">Base Ativa OPME</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">PROCEDIMENTOS</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{procedimentos?.length || 0}</p>
          <p className="text-[10px] font-bold text-purple-600 mt-0.5">TUSS / CBHPM</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">PRODUTOS OPME</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{produtos?.length || 0}</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Catálogo Geral</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">HOSPITAIS CREDENCIADOS</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{hospitais.length}</p>
          <p className="text-[10px] font-bold text-blue-600 mt-0.5">SP, RJ, MG & DF</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">CORPO MÉDICO REGISTRADO</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{medicos.length}</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Ortopedia & Neurocirurgia</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">OPERADORAS / ANS</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{convenios.length}</p>
          <p className="text-[10px] font-bold text-blue-600 mt-0.5">Principais Convênios</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">REPRESENTANTES</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{vendedores.length}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-0.5">Equipe Ativa</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pacientes')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pacientes' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Pacientes ({pacientes?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('procedimentos')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'procedimentos' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Procedimentos ({procedimentos?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('produtos')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'produtos' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Produtos ({produtos?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('hospitais')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'hospitais' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Hospitais ({hospitais.length})
        </button>

        <button
          onClick={() => setActiveTab('medicos')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'medicos' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          Médicos ({medicos.length})
        </button>

        <button
          onClick={() => setActiveTab('convenios')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'convenios' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          Convênios ({convenios.length})
        </button>

        <button
          onClick={() => setActiveTab('vendedores')}
          className={`pb-2 px-2.5 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'vendedores' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Vendedores ({vendedores.length})
        </button>
      </div>

      {/* Content Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-3.5">
        {activeTab === 'pacientes' && (
          <div className="space-y-3">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente por nome..."
                  value={pacienteSearch}
                  onChange={(e) => setPacienteSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {pacientes.filter(p => p.nome.toLowerCase().includes(pacienteSearch.toLowerCase())).length} pacientes cadastrados
              </span>
            </div>

            {/* Table */}
            {pacientes.filter(p => p.nome.toLowerCase().includes(pacienteSearch.toLowerCase())).length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto opacity-40 text-blue-500" />
                <p className="text-xs font-bold">Nenhum paciente encontrado</p>
                <button
                  onClick={() => handleOpenPacienteModal()}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Cadastrar primeiro paciente
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5 pl-3">Registro / ID</th>
                      <th className="p-2.5">Nome do Paciente</th>
                      <th className="p-2.5">Tipo de Registro</th>
                      <th className="p-2.5">Status Cadastral</th>
                      <th className="p-2.5 text-right pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pacientes
                      .filter(p => p.nome.toLowerCase().includes(pacienteSearch.toLowerCase()))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 pl-3 font-mono">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              PAC-{p.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium">Registro Sistema</p>
                          </td>
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white uppercase line-clamp-1">{p.nome}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 uppercase">Paciente Cirúrgico OPME</p>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              Paciente Ativo
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Conforme
                            </span>
                          </td>
                          <td className="p-2.5 text-right pr-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenPacienteModal(p)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Editar Paciente"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePaciente(p)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Excluir Paciente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'procedimentos' && (
          <div className="space-y-3">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por código, nome ou especialidade..."
                  value={procedimentoSearch}
                  onChange={(e) => setProcedimentoSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {procedimentos.filter(p =>
                  p.descricao.toLowerCase().includes(procedimentoSearch.toLowerCase()) ||
                  p.codigo.toLowerCase().includes(procedimentoSearch.toLowerCase()) ||
                  (p.especialidade && p.especialidade.toLowerCase().includes(procedimentoSearch.toLowerCase()))
                ).length} procedimentos cadastrados
              </span>
            </div>

            {/* Table */}
            {procedimentos.filter(p =>
              p.descricao.toLowerCase().includes(procedimentoSearch.toLowerCase()) ||
              p.codigo.toLowerCase().includes(procedimentoSearch.toLowerCase()) ||
              (p.especialidade && p.especialidade.toLowerCase().includes(procedimentoSearch.toLowerCase()))
            ).length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Activity className="w-8 h-8 mx-auto opacity-40 text-purple-500" />
                <p className="text-xs font-bold">Nenhum procedimento encontrado</p>
                <button
                  onClick={() => handleOpenProcedimentoModal()}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Cadastrar primeiro procedimento
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5 pl-3">Cód. TUSS / Rol</th>
                      <th className="p-2.5">Descrição do Procedimento Cirúrgico</th>
                      <th className="p-2.5">Especialidade Médica</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {procedimentos
                      .filter(p =>
                        p.descricao.toLowerCase().includes(procedimentoSearch.toLowerCase()) ||
                        p.codigo.toLowerCase().includes(procedimentoSearch.toLowerCase()) ||
                        (p.especialidade && p.especialidade.toLowerCase().includes(procedimentoSearch.toLowerCase()))
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 pl-3 font-mono">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">TUSS {p.codigo}</span>
                            <p className="text-[9px] text-slate-400 font-medium">CBHPM / TUSS</p>
                          </td>
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white uppercase line-clamp-1">{p.descricao}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 uppercase">Protocolos & Mapa Cirúrgico</p>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              {p.especialidade || 'Ortopedia'}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              p.ativo
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {p.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right pr-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenProcedimentoModal(p)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProcedimento(p)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'produtos' && (
          <div className="space-y-3">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar produto por código ou descrição..."
                  value={produtoSearch}
                  onChange={(e) => setProdutoSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {produtos.filter(p =>
                  p.descricao.toLowerCase().includes(produtoSearch.toLowerCase()) ||
                  p.codigo?.toLowerCase().includes(produtoSearch.toLowerCase()) ||
                  (p.fabricante && p.fabricante.toLowerCase().includes(produtoSearch.toLowerCase()))
                ).length} produtos cadastrados
              </span>
            </div>

            {/* Table */}
            {produtos.filter(p =>
              p.descricao.toLowerCase().includes(produtoSearch.toLowerCase()) ||
              p.codigo?.toLowerCase().includes(produtoSearch.toLowerCase()) ||
              (p.fabricante && p.fabricante.toLowerCase().includes(produtoSearch.toLowerCase()))
            ).length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Package className="w-8 h-8 mx-auto opacity-40 text-emerald-500" />
                <p className="text-xs font-bold">Nenhum produto encontrado</p>
                <button
                  onClick={() => handleOpenProdutoModal()}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Cadastrar primeiro produto
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5 pl-3">Código OPME</th>
                      <th className="p-2.5">Descrição do Material</th>
                      <th className="p-2.5">Categoria / Grupo</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {produtos
                      .filter(p =>
                        p.descricao.toLowerCase().includes(produtoSearch.toLowerCase()) ||
                        p.codigo?.toLowerCase().includes(produtoSearch.toLowerCase()) ||
                        (p.fabricante && p.fabricante.toLowerCase().includes(produtoSearch.toLowerCase()))
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 pl-3 font-mono">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">{p.codigo}</span>
                            <p className="text-[9px] text-slate-400 font-medium">Unidade: {p.unidade || 'UN'}</p>
                          </td>
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white uppercase line-clamp-1">{p.descricao}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 uppercase">
                              {p.fabricante || 'Fabricante Homologado'} {p.anvisa ? `• ANVISA: ${p.anvisa}` : ''}
                            </p>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              {p.categoria || p.grupo || 'Materiais Cirúrgicos'}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              p.ativo
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {p.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right pr-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenProdutoModal(p)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduto(p)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hospitais' && (
          <div className="space-y-3">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar hospital por nome, CNPJ ou cidade..."
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {hospitais.filter(h =>
                  h.nome.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
                  (h.cnpj && h.cnpj.includes(hospitalSearch)) ||
                  (h.cidade && h.cidade.toLowerCase().includes(hospitalSearch.toLowerCase()))
                ).length} hospitais cadastrados
              </span>
            </div>

            {/* Table */}
            {hospitais.filter(h =>
              h.nome.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
              (h.cnpj && h.cnpj.includes(hospitalSearch)) ||
              (h.cidade && h.cidade.toLowerCase().includes(hospitalSearch.toLowerCase()))
            ).length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Building2 className="w-8 h-8 mx-auto opacity-40 text-blue-500" />
                <p className="text-xs font-bold">Nenhum hospital encontrado</p>
                <button
                  onClick={() => handleOpenHospitalModal()}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Cadastrar primeiro hospital
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5 pl-3">ID / Registro</th>
                      <th className="p-2.5">Hospital Credenciado</th>
                      <th className="p-2.5">CNPJ</th>
                      <th className="p-2.5">Contato / Setor OPME</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {hospitais
                      .filter(h =>
                        h.nome.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
                        (h.cnpj && h.cnpj.includes(hospitalSearch)) ||
                        (h.cidade && h.cidade.toLowerCase().includes(hospitalSearch.toLowerCase()))
                      )
                      .map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 pl-3 font-mono">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              HOSP-{h.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium">Hospital Credenciado</p>
                          </td>
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white uppercase line-clamp-1">{h.nome}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 uppercase">{h.cidade} - {h.estado}</p>
                          </td>
                          <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                            {h.cnpj || '—'}
                            <p className="text-[9px] text-slate-400 font-normal">CNPJ / Inscrição</p>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              {h.contato_principal || 'Central Cirúrgica'}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              h.ativo
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${h.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {h.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right pr-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenHospitalModal(h)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteHospital(h)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medicos' && (
          <div className="space-y-3">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar médico por nome, CRM ou especialidade..."
                  value={medicoSearch}
                  onChange={(e) => setMedicoSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {medicos.filter(m =>
                  m.nome.toLowerCase().includes(medicoSearch.toLowerCase()) ||
                  m.crm.includes(medicoSearch) ||
                  (m.especialidade && m.especialidade.toLowerCase().includes(medicoSearch.toLowerCase()))
                ).length} médicos cadastrados
              </span>
            </div>

            {/* Table */}
            {medicos.filter(m =>
              m.nome.toLowerCase().includes(medicoSearch.toLowerCase()) ||
              m.crm.includes(medicoSearch) ||
              (m.especialidade && m.especialidade.toLowerCase().includes(medicoSearch.toLowerCase()))
            ).length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Stethoscope className="w-8 h-8 mx-auto opacity-40 text-blue-500" />
                <p className="text-xs font-bold">Nenhum médico encontrado</p>
                <button
                  onClick={() => handleOpenMedicoModal()}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Cadastrar primeiro médico
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5 pl-3">CRM / Conselho</th>
                      <th className="p-2.5">Médico Cirurgião</th>
                      <th className="p-2.5">Especialidade Médica</th>
                      <th className="p-2.5">Contato / Telefone</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {medicos
                      .filter(m =>
                        m.nome.toLowerCase().includes(medicoSearch.toLowerCase()) ||
                        m.crm.includes(medicoSearch) ||
                        (m.especialidade && m.especialidade.toLowerCase().includes(medicoSearch.toLowerCase()))
                      )
                      .map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 pl-3 font-mono">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              CRM {m.crm}/{m.uf_crm}
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium">Cirurgião Registrado</p>
                          </td>
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white uppercase line-clamp-1">{m.nome}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 uppercase">{m.email || 'Médico Cirurgião OPME'}</p>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              {m.especialidade}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                            {m.telefone || '—'}
                            <p className="text-[9px] text-slate-400 font-normal">Contato Direto</p>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              m.ativo
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${m.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {m.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right pr-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenMedicoModal(m)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedico(m)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'convenios' && (
          <div className="space-y-3">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar operadora por nome ou código ANS..."
                  value={convenioSearch}
                  onChange={(e) => setConvenioSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {convenios.filter(c =>
                  c.nome.toLowerCase().includes(convenioSearch.toLowerCase()) ||
                  (c.ans_codigo && c.ans_codigo.includes(convenioSearch))
                ).length} convênios cadastrados
              </span>
            </div>

            {/* Table */}
            {convenios.filter(c =>
              c.nome.toLowerCase().includes(convenioSearch.toLowerCase()) ||
              (c.ans_codigo && c.ans_codigo.includes(convenioSearch))
            ).length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <HeartHandshake className="w-8 h-8 mx-auto opacity-40 text-blue-500" />
                <p className="text-xs font-bold">Nenhum convênio encontrado</p>
                <button
                  onClick={() => handleOpenConvenioModal()}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Cadastrar primeiro convênio
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5 pl-3">Registro ANS</th>
                      <th className="p-2.5">Operadora / Convênio de Saúde</th>
                      <th className="p-2.5">Modalidade</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {convenios
                      .filter(c =>
                        c.nome.toLowerCase().includes(convenioSearch.toLowerCase()) ||
                        (c.ans_codigo && c.ans_codigo.includes(convenioSearch))
                      )
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 pl-3 font-mono">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              {c.ans_codigo ? `ANS ${c.ans_codigo}` : `CONV-${c.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`}
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium">Registro Órgão ANS</p>
                          </td>
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white uppercase line-clamp-1">{c.nome}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 uppercase">Saúde Suplementar</p>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              Operadora Credenciada
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              c.ativo
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${c.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {c.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right pr-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenConvenioModal(c)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteConvenio(c)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vendedores' && (
          <div className="space-y-3">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar vendedor por nome, e-mail ou telefone..."
                  value={vendedorSearch}
                  onChange={(e) => setVendedorSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {vendedores.filter(v =>
                  v.nome.toLowerCase().includes(vendedorSearch.toLowerCase()) ||
                  (v.email && v.email.toLowerCase().includes(vendedorSearch.toLowerCase())) ||
                  (v.telefone && v.telefone.includes(vendedorSearch))
                ).length} representantes cadastrados
              </span>
            </div>

            {/* Table */}
            {vendedores.filter(v =>
              v.nome.toLowerCase().includes(vendedorSearch.toLowerCase()) ||
              (v.email && v.email.toLowerCase().includes(vendedorSearch.toLowerCase())) ||
              (v.telefone && v.telefone.includes(vendedorSearch))
            ).length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <UserCheck className="w-8 h-8 mx-auto opacity-40 text-blue-500" />
                <p className="text-xs font-bold">Nenhum representante encontrado</p>
                <button
                  onClick={() => handleOpenVendedorModal()}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Cadastrar primeiro representante
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5 pl-3">Matrícula / ID</th>
                      <th className="p-2.5">Vendedor / Representante</th>
                      <th className="p-2.5">Telefone / WhatsApp</th>
                      <th className="p-2.5">Atribuição Comercial</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {vendedores
                      .filter(v =>
                        v.nome.toLowerCase().includes(vendedorSearch.toLowerCase()) ||
                        (v.email && v.email.toLowerCase().includes(vendedorSearch.toLowerCase())) ||
                        (v.telefone && v.telefone.includes(vendedorSearch))
                      )
                      .map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 pl-3 font-mono">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              REP-{v.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium">Equipe Comercial</p>
                          </td>
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white uppercase line-clamp-1">{v.nome}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{v.email || 'comercial@prestymedick.com.br'}</p>
                          </td>
                          <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                            {v.telefone || '—'}
                            <p className="text-[9px] text-slate-400 font-normal">WhatsApp Comercial</p>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              Representante OPME
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              v.ativo
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${v.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {v.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right pr-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenVendedorModal(v)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteVendedor(v)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Hospital */}
      {modalType === 'hospital' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                {editingItem ? 'Editar Hospital' : 'Novo Hospital Credenciado'}
              </h2>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHospitalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Hospital</label>
                <input
                  type="text"
                  value={hospitalForm.nome}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={hospitalForm.cnpj}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, cnpj: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Cidade</label>
                  <input
                    type="text"
                    value={hospitalForm.cidade}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, cidade: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Estado (UF)</label>
                  <input
                    type="text"
                    value={hospitalForm.estado}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, estado: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Contato / Setor OPME</label>
                <input
                  type="text"
                  placeholder="Centro Cirúrgico - (11) 9999-9999"
                  value={hospitalForm.contato}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, contato: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md"
                >
                  {editingItem ? 'Atualizar Hospital' : 'Salvar Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Médico */}
      {modalType === 'medico' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                {editingItem ? 'Editar Médico' : 'Novo Médico Cirurgião'}
              </h2>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMedicoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Médico</label>
                <input
                  type="text"
                  value={medicoForm.nome}
                  onChange={(e) => setMedicoForm({ ...medicoForm, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">CRM</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={medicoForm.crm}
                    onChange={(e) => setMedicoForm({ ...medicoForm, crm: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">UF CRM</label>
                  <input
                    type="text"
                    value={medicoForm.uf_crm}
                    onChange={(e) => setMedicoForm({ ...medicoForm, uf_crm: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Especialidade</label>
                <input
                  type="text"
                  value={medicoForm.especialidade}
                  onChange={(e) => setMedicoForm({ ...medicoForm, especialidade: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={medicoForm.telefone}
                    onChange={(e) => setMedicoForm({ ...medicoForm, telefone: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">E-mail</label>
                  <input
                    type="email"
                    placeholder="medico@email.com"
                    value={medicoForm.email}
                    onChange={(e) => setMedicoForm({ ...medicoForm, email: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md"
                >
                  {editingItem ? 'Atualizar Médico' : 'Salvar Médico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Convênio */}
      {modalType === 'convenio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-blue-600" />
                {editingItem ? 'Editar Convênio' : 'Novo Convênio / Operadora'}
              </h2>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConvenioSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Convênio / Operadora</label>
                <input
                  type="text"
                  value={convenioForm.nome}
                  onChange={(e) => setConvenioForm({ ...convenioForm, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Código Registro ANS</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={convenioForm.ans_codigo}
                  onChange={(e) => setConvenioForm({ ...convenioForm, ans_codigo: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md"
                >
                  {editingItem ? 'Atualizar Convênio' : 'Salvar Convênio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vendedor */}
      {modalType === 'vendedor' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                {editingItem ? 'Editar Vendedor' : 'Novo Representante Comercial'}
              </h2>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVendedorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Vendedor</label>
                <input
                  type="text"
                  value={vendedorForm.nome}
                  onChange={(e) => setVendedorForm({ ...vendedorForm, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">E-mail Corporativo</label>
                <input
                  type="email"
                  placeholder="vendedor@prestymedick.com.br"
                  value={vendedorForm.email}
                  onChange={(e) => setVendedorForm({ ...vendedorForm, email: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Telefone / Celular</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={vendedorForm.telefone}
                  onChange={(e) => setVendedorForm({ ...vendedorForm, telefone: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md"
                >
                  {editingItem ? 'Atualizar Vendedor' : 'Salvar Vendedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Paciente */}
      {modalType === 'paciente' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingItem ? 'Editar Paciente' : 'Novo Paciente OPME'}
              </h2>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePacienteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Paciente *</label>
                <input
                  type="text"
                  placeholder="Nome completo do paciente..."
                  value={pacienteForm.nome}
                  onChange={(e) => setPacienteForm({ ...pacienteForm, nome: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md"
                >
                  {editingItem ? 'Atualizar Paciente' : 'Salvar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Procedimento */}
      {modalType === 'procedimento' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                {editingItem ? 'Editar Procedimento' : 'Novo Procedimento OPME'}
              </h2>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcedimentoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Código TUSS / CBHPM / SUS *</label>
                <input
                  type="text"
                  placeholder="Ex: 30715016"
                  value={procedimentoForm.codigo}
                  onChange={(e) => setProcedimentoForm({ ...procedimentoForm, codigo: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Descrição do Procedimento *</label>
                <input
                  type="text"
                  placeholder="Ex: Artrodese Cervical Anterior 2 Níveis"
                  value={procedimentoForm.descricao}
                  onChange={(e) => setProcedimentoForm({ ...procedimentoForm, descricao: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Especialidade Cirúrgica</label>
                <select
                  value={procedimentoForm.especialidade}
                  onChange={(e) => setProcedimentoForm({ ...procedimentoForm, especialidade: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="Coluna Vertebral">Coluna Vertebral</option>
                  <option value="Quadril">Quadril</option>
                  <option value="Joelho">Joelho</option>
                  <option value="Ombro e Cotovelo">Ombro e Cotovelo</option>
                  <option value="Ortopedia e Traumatologia">Ortopedia e Traumatologia</option>
                  <option value="Neurocirurgia">Neurocirurgia</option>
                  <option value="Bucomaxilofacial">Bucomaxilofacial</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="proc-ativo"
                  checked={procedimentoForm.ativo}
                  onChange={(e) => setProcedimentoForm({ ...procedimentoForm, ativo: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="proc-ativo" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Procedimento Ativo no Catálogo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md"
                >
                  {editingItem ? 'Atualizar Procedimento' : 'Salvar Procedimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Produto */}
      {modalType === 'produto' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                {editingItem ? 'Editar Produto' : 'Novo Produto OPME'}
              </h2>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProdutoSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Produto (Código / Referência) *</label>
                <input
                  type="text"
                  placeholder="Ex: OPME-COL-001"
                  value={produtoForm.codigo}
                  onChange={(e) => setProdutoForm({ ...produtoForm, codigo: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Descrição do Produto *</label>
                <textarea
                  placeholder="Ex: Gaiola Cervical PEEK 12x14mm"
                  value={produtoForm.descricao}
                  onChange={(e) => setProdutoForm({ ...produtoForm, descricao: e.target.value })}
                  rows={3}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prod-ativo"
                  checked={produtoForm.ativo}
                  onChange={(e) => setProdutoForm({ ...produtoForm, ativo: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="prod-ativo" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Produto Ativo no Catálogo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md"
                >
                  {editingItem ? 'Atualizar Produto' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

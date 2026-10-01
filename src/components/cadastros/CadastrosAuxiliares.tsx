import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Hospital, Medico, Convenio, Vendedor } from '../../types';
import { Layers, Building2, Stethoscope, HeartHandshake, UserCheck, Plus, Edit2, Trash2, X } from 'lucide-react';

export const CadastrosAuxiliares: React.FC = () => {
  const {
    hospitais, medicos, convenios, vendedores,
    addHospital, updateHospital, deleteHospital,
    addMedico, updateMedico, deleteMedico,
    addConvenio, updateConvenio, deleteConvenio,
    addVendedor, updateVendedor, deleteVendedor
  } = useData();
  const { logAuditEvent } = useAuth();

  const [activeTab, setActiveTab] = useState<'hospitais' | 'medicos' | 'convenios' | 'vendedores'>('hospitais');

  // Modal states
  const [modalType, setModalType] = useState<'hospital' | 'medico' | 'convenio' | 'vendedor' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

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
    comissao_padrao_pct: 5.0,
    ativo: true,
  });

  // Open Handlers
  const handleOpenHospitalModal = (h?: Hospital) => {
    if (h) {
      setEditingItem(h);
      setHospitalForm({ nome: h.nome, cnpj: h.cnpj, cidade: h.cidade, estado: h.estado, contato: h.contato, ativo: h.ativo });
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
      setVendedorForm({ nome: v.nome, email: v.email, comissao_padrao_pct: v.comissao_padrao_pct, ativo: v.ativo });
    } else {
      setEditingItem(null);
      setVendedorForm({ nome: '', email: '', comissao_padrao_pct: 5.0, ativo: true });
    }
    setModalType('vendedor');
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
              Gerenciamento de tabelas mestres de hospitais, médicos cirurgiões, convênios de saúde e representantes.
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
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
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">REPRESENTANTES COMERCIAIS</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{vendedores.length}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-0.5">Equipe Ativa</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
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
        {activeTab === 'hospitais' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hospitais.map((h) => (
              <div key={h.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1 text-xs relative group">
                <div className="flex items-start justify-between">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm pr-12">{h.nome}</p>
                  <div className="flex items-center gap-1">
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
                </div>
                <p className="text-slate-500 font-medium">CNPJ: <span className="font-mono">{h.cnpj}</span></p>
                <p className="text-slate-500 font-medium">Localidade: {h.cidade} - {h.estado}</p>
                <p className="text-slate-500 font-medium">Contato: {h.contato}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'medicos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medicos.map((m) => (
              <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1 text-xs">
                <div className="flex items-start justify-between">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm pr-12">{m.nome}</p>
                  <div className="flex items-center gap-1">
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
                </div>
                <p className="text-slate-500 font-medium">CRM: <span className="font-mono font-bold">{m.crm}/{m.uf_crm}</span></p>
                <p className="text-slate-500 font-medium">Especialidade: {m.especialidade}</p>
                {m.telefone && <p className="text-slate-500 font-medium">Telefone: {m.telefone}</p>}
                {m.email && <p className="text-slate-500 font-medium">E-mail: {m.email}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'convenios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {convenios.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1 text-xs">
                <div className="flex items-start justify-between">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{c.nome}</p>
                  <div className="flex items-center gap-1">
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
                </div>
                <p className="text-slate-500 font-medium">Código ANS: <span className="font-mono font-bold">{c.ans_codigo}</span></p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vendedores' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vendedores.map((v) => (
              <div key={v.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1 text-xs">
                <div className="flex items-start justify-between">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{v.nome}</p>
                  <div className="flex items-center gap-1">
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
                </div>
                <p className="text-slate-500 font-medium">E-mail: {v.email}</p>
                <p className="text-slate-500 font-medium">Comissão Padrão: <strong className="text-slate-900 dark:text-white">{v.comissao_padrao_pct}%</strong></p>
              </div>
            ))}
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
                <label className="font-bold text-slate-700 dark:text-slate-300">Comissão Padrão (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vendedorForm.comissao_padrao_pct}
                  onChange={(e) => setVendedorForm({ ...vendedorForm, comissao_padrao_pct: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-800 dark:text-slate-200"
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
                  {editingItem ? 'Atualizar Vendedor' : 'Salvar Vendedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

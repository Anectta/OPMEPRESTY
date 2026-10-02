import React, { useState } from 'react';
import {
  Cpu, Plus, Search, MapPin, CheckCircle2, Clock, Wrench,
  Droplets, Package, AlertTriangle, X, Save, ChevronDown
} from 'lucide-react';
import type { Equipamento, StatusEquipamento } from '../../types';
import { getStatusEquipamentoConfig } from '../../lib/utils';

// TODO: conectar ao equipamentosService do databaseService

const MOCK_EQUIPAMENTOS: Equipamento[] = [];

const STATUS_ICON: Partial<Record<StatusEquipamento, React.ReactNode>> = {
  DISPONIVEL: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  EM_CAMPO: <MapPin className="w-4 h-4 text-indigo-600" />,
  EM_USO: <Cpu className="w-4 h-4 text-violet-600" />,
  MANUTENCAO: <Wrench className="w-4 h-4 text-red-500" />,
  HIGIENIZACAO: <Droplets className="w-4 h-4 text-cyan-600" />,
  RESERVADO: <Clock className="w-4 h-4 text-amber-600" />,
  EM_TRANSITO: <Package className="w-4 h-4 text-blue-600" />,
};

const CATEGORIAS = ['Todos', 'Artroscopia', 'Ortopedia', 'Coluna', 'Radiologia'];
const STATUSES: Array<{ value: string; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'EM_CAMPO', label: 'Em Campo' },
  { value: 'EM_USO', label: 'Em Uso' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'HIGIENIZACAO', label: 'Higienização' },
  { value: 'EM_TRANSITO', label: 'Em Trânsito' },
];

export const GestaoEquipamentos: React.FC = () => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(MOCK_EQUIPAMENTOS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedCategoria, setSelectedCategoria] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);
  const [acaoModal, setAcaoModal] = useState<'higienizacao' | 'manutencao' | null>(null);

  const disponiveis = equipamentos.filter(e => e.status === 'DISPONIVEL').length;
  const emCampo = equipamentos.filter(e => ['EM_CAMPO', 'EM_USO', 'EM_TRANSITO'].includes(e.status)).length;
  const manutencao = equipamentos.filter(e => ['MANUTENCAO', 'HIGIENIZACAO'].includes(e.status)).length;

  const filtered = equipamentos.filter(e => {
    const matchSearch = !searchTerm || [e.codigo_patrimonio, e.nome, e.numero_serie, e.fabricante]
      .some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = selectedStatus === 'todos' || e.status === selectedStatus;
    const matchCategoria = selectedCategoria === 'Todos' || e.categoria === selectedCategoria;
    return matchSearch && matchStatus && matchCategoria;
  });

  const handleRegistrarAcao = (eq: Equipamento, acao: 'higienizacao' | 'manutencao') => {
    setEquipamentoSelecionado(eq);
    setAcaoModal(acao);
  };

  const confirmarAcao = () => {
    if (!equipamentoSelecionado || !acaoModal) return;
    const novoStatus: StatusEquipamento = acaoModal === 'higienizacao' ? 'HIGIENIZACAO' : 'MANUTENCAO';
    setEquipamentos(prev =>
      prev.map(e => e.id === equipamentoSelecionado.id ? { ...e, status: novoStatus, disponivel_para_reserva: false } : e)
    );
    setEquipamentoSelecionado(null);
    setAcaoModal(null);
    // TODO: equipamentosService.updateStatus(equipamentoSelecionado.id, novoStatus)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
          <p className="text-sm text-gray-500 mt-1">Controle individual por patrimônio e número de série</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Equipamento
        </button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Disponíveis', value: disponiveis, color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
          { label: 'Em Campo / Uso', value: emCampo, color: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
          { label: 'Manutenção / Higienização', value: manutencao, color: 'bg-red-50 border-red-200', text: 'text-red-700' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border p-4 ${c.color}`}>
            <div className={`text-2xl font-bold ${c.text}`}>{c.value}</div>
            <div className={`text-xs font-semibold mt-1 ${c.text} opacity-80`}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por patrimônio, nome, série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <select
          value={selectedCategoria}
          onChange={e => setSelectedCategoria(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Cpu className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-semibold">Nenhum equipamento encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(eq => {
            const statusCfg = getStatusEquipamentoConfig(eq.status);
            return (
              <div key={eq.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {STATUS_ICON[eq.status] ?? <AlertTriangle className="w-4 h-4 text-gray-400" />}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.badgeClass}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  {eq.disponivel_para_reserva && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                      Reservável
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="font-mono text-xs font-bold text-amber-700 mb-1">{eq.codigo_patrimonio}</div>
                  <h3 className="font-semibold text-gray-900 leading-snug">{eq.nome}</h3>
                  {eq.fabricante && <p className="text-xs text-gray-500 mt-0.5">{eq.fabricante}</p>}
                </div>

                {eq.numero_serie && (
                  <div className="text-xs text-gray-500 font-mono mb-2">SN: {eq.numero_serie}</div>
                )}

                {eq.localizacao_descricao && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{eq.localizacao_descricao}</span>
                  </div>
                )}

                {eq.status === 'DISPONIVEL' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegistrarAcao(eq, 'higienizacao')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl transition-colors"
                    >
                      <Droplets className="w-3.5 h-3.5" /> Higienizar
                    </button>
                    <button
                      onClick={() => handleRegistrarAcao(eq, 'manutencao')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Manutenção
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Ação */}
      {acaoModal && equipamentoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Registrar {acaoModal === 'higienizacao' ? 'Higienização' : 'Manutenção'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Equipamento: <span className="font-semibold">{equipamentoSelecionado.nome}</span>
              <br />
              Patrimônio: <span className="font-mono font-bold">{equipamentoSelecionado.codigo_patrimonio}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAcaoModal(null)}
                className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                className={`flex-1 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${
                  acaoModal === 'higienizacao' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro — stub */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Cadastrar Equipamento</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Código Patrimônio *', placeholder: 'EQ-PAT-0001' },
                { label: 'Número de Série', placeholder: 'SN-XXXXX' },
                { label: 'Nome do Equipamento *', placeholder: 'Motor Shaver...' },
                { label: 'Fabricante', placeholder: 'Stryker, Karl Storz...' },
                { label: 'Categoria', placeholder: 'Artroscopia, Ortopedia...' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cancelar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

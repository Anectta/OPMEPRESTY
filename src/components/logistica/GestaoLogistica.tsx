import React, { useState } from 'react';
import {
  Truck, Plus, Search, Package, MapPin, User, Clock,
  CheckCircle2, AlertTriangle, ChevronRight, ArrowLeft,
  ArrowRight, RotateCcw, X, Save, Eye
} from 'lucide-react';
import type { OrdemServico, TipoOperacaoLogistica, StatusOS } from '../../types';
import { getStatusOSConfig, formatDate } from '../../lib/utils';

// TODO: conectar ao ordensServicoService do databaseService

const MOCK_OS: OrdemServico[] = [];

const TIPO_ICON: Record<TipoOperacaoLogistica, React.ReactNode> = {
  ENTREGA: <Truck className="w-4 h-4 text-blue-600" />,
  RETORNO: <ArrowLeft className="w-4 h-4 text-amber-600" />,
  RETIRADA: <ArrowRight className="w-4 h-4 text-green-600" />,
  TRANSFERENCIA: <RotateCcw className="w-4 h-4 text-purple-600" />,
};

const TIPO_LABEL: Record<TipoOperacaoLogistica, string> = {
  ENTREGA: 'Entrega',
  RETORNO: 'Retorno',
  RETIRADA: 'Retirada',
  TRANSFERENCIA: 'Transferência',
};

export const GestaoLogistica: React.FC = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>(MOCK_OS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedTipo, setSelectedTipo] = useState('todos');
  const [osSelecionada, setOsSelecionada] = useState<OrdemServico | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pendentes = ordens.filter(o => o.status === 'PENDENTE').length;
  const emExecucao = ordens.filter(o => o.status === 'EM_EXECUCAO').length;
  const concluidas = ordens.filter(o => o.status === 'CONCLUIDA' && o.data_planejada === new Date().toISOString().split('T')[0]).length;

  const filtered = ordens.filter(o => {
    const matchSearch = !searchTerm || [o.numero, o.hospital_nome, o.motorista_nome]
      .some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = selectedStatus === 'todos' || o.status === selectedStatus;
    const matchTipo = selectedTipo === 'todos' || o.tipo === selectedTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  const avancarStatus = (id: string) => {
    const statusFlow: Record<StatusOS, StatusOS | null> = {
      PENDENTE: 'ATRIBUIDA',
      ATRIBUIDA: 'EM_EXECUCAO',
      EM_EXECUCAO: 'CONCLUIDA',
      CONCLUIDA: null,
      CANCELADA: null,
    };
    setOrdens(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = statusFlow[o.status];
      return next ? { ...o, status: next } : o;
    }));
    // TODO: ordensServicoService.updateStatus(id, nextStatus)
  };

  const ACOES_LABEL: Record<StatusOS, string> = {
    PENDENTE: 'Atribuir Motorista',
    ATRIBUIDA: 'Iniciar Execução',
    EM_EXECUCAO: 'Concluir',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logística Operacional</h1>
          <p className="text-sm text-gray-500 mt-1">Ordens de Serviço — Entregas, Retiradas e Retornos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova OS
        </button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendentes', value: pendentes, color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
          { label: 'Em Execução', value: emExecucao, color: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
          { label: 'Concluídas Hoje', value: concluidas, color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
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
            placeholder="Buscar OS, hospital, motorista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <select
          value={selectedTipo}
          onChange={e => setSelectedTipo(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="ENTREGA">Entrega</option>
          <option value="RETORNO">Retorno</option>
          <option value="RETIRADA">Retirada</option>
          <option value="TRANSFERENCIA">Transferência</option>
        </select>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none"
        >
          <option value="todos">Todos os Status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="ATRIBUIDA">Atribuída</option>
          <option value="EM_EXECUCAO">Em Execução</option>
          <option value="CONCLUIDA">Concluída</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Truck className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-semibold">Nenhuma OS encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(os => {
            const statusCfg = getStatusOSConfig(os.status);
            const canAdvance = os.status !== 'CONCLUIDA' && os.status !== 'CANCELADA';
            return (
              <div key={os.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-50 rounded-xl flex-shrink-0">
                      {TIPO_ICON[os.tipo]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 font-mono text-sm">{os.numero}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.badgeClass}`}>
                          {statusCfg.label}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                          {TIPO_LABEL[os.tipo]}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {os.hospital_nome}
                        </div>
                        {os.endereco_entrega && (
                          <p className="text-xs text-gray-500 pl-5">{os.endereco_entrega}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 pl-5 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(os.data_planejada)} {os.horario_planejado && `às ${os.horario_planejado}`}
                          </span>
                          {os.motorista_nome && (
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {os.motorista_nome}
                              {os.veiculo_placa && ` — ${os.veiculo_placa}`}
                            </span>
                          )}
                        </div>
                        {os.itens && os.itens.length > 0 && (
                          <div className="text-xs text-gray-500 pl-5">
                            <Package className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                            {os.itens.length} item(ns): {os.itens.map(i => i.descricao).join(', ').slice(0, 60)}
                            {(os.itens.map(i => i.descricao).join(', ').length > 60) && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setOsSelecionada(os)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver
                    </button>
                    {canAdvance && (
                      <button
                        onClick={() => avancarStatus(os.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        {ACOES_LABEL[os.status]}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detalhes */}
      {osSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">OS {osSelecionada.numero}</h3>
              <button onClick={() => setOsSelecionada(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500 block text-xs">Tipo</span>{TIPO_LABEL[osSelecionada.tipo]}</div>
                <div><span className="text-gray-500 block text-xs">Status</span>{getStatusOSConfig(osSelecionada.status).label}</div>
                <div><span className="text-gray-500 block text-xs">Data Planejada</span>{formatDate(osSelecionada.data_planejada)}</div>
                <div><span className="text-gray-500 block text-xs">Horário</span>{osSelecionada.horario_planejado || '—'}</div>
                <div className="col-span-2"><span className="text-gray-500 block text-xs">Hospital</span>{osSelecionada.hospital_nome}</div>
                {osSelecionada.motorista_nome && (
                  <div className="col-span-2"><span className="text-gray-500 block text-xs">Motorista</span>{osSelecionada.motorista_nome} — {osSelecionada.veiculo_placa}</div>
                )}
              </div>

              {osSelecionada.itens && osSelecionada.itens.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Itens da OS</h4>
                  <div className="space-y-2">
                    {osSelecionada.itens.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <span className={`text-xs font-bold mr-2 ${item.tipo === 'MATERIAL' ? 'text-blue-600' : 'text-amber-600'}`}>
                            {item.tipo}
                          </span>
                          {item.descricao}
                          {item.lote && <span className="text-xs text-gray-500 ml-2">Lote: {item.lote}</span>}
                        </div>
                        <span className="font-semibold ml-4">×{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova OS — stub */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Nova Ordem de Serviço</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de OS *</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option>ENTREGA</option>
                  <option>RETORNO</option>
                  <option>RETIRADA</option>
                  <option>TRANSFERENCIA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hospital *</label>
                <input type="text" placeholder="Hospital de destino/origem" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Data Planejada</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Horário</label>
                  <input type="time" defaultValue="08:00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Observações</label>
                <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cancelar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors">
                <Save className="w-4 h-4" /> Criar OS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

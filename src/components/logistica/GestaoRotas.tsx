import React, { useState } from 'react';
import { MapPin, Truck, Clock, CheckCircle2, Circle, Plus, ChevronRight } from 'lucide-react';
import type { Rota, TipoOperacaoLogistica } from '../../types';

// TODO: conectar ao rotasService do databaseService

const MOCK_ROTAS: Array<Rota & { motorista_nome?: string; veiculo_placa?: string }> = [];

const TIPO_COLOR: Record<TipoOperacaoLogistica, string> = {
  ENTREGA: 'bg-blue-100 text-blue-700',
  RETORNO: 'bg-amber-100 text-amber-700',
  RETIRADA: 'bg-green-100 text-green-700',
  TRANSFERENCIA: 'bg-purple-100 text-purple-700',
};

const STATUS_PARADA_ICON = (status: string) => {
  if (status === 'CONCLUIDA') return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
  if (status === 'EM_ANDAMENTO') return <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-100 flex-shrink-0 animate-pulse" />;
  return <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />;
};

export const GestaoRotas: React.FC = () => {
  const [rotas] = useState(MOCK_ROTAS);
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const statusRota = (status: string) => {
    const map: Record<string, { label: string; badge: string }> = {
      PLANEJADA: { label: 'Planejada', badge: 'bg-gray-100 text-gray-700' },
      EM_EXECUCAO: { label: 'Em Execução', badge: 'bg-blue-100 text-blue-800' },
      CONCLUIDA: { label: 'Concluída', badge: 'bg-emerald-100 text-emerald-800' },
      CANCELADA: { label: 'Cancelada', badge: 'bg-red-100 text-red-700' },
    };
    return map[status] || { label: status, badge: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rotas</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{today}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Rota
        </button>
      </div>

      {/* Rotas */}
      {rotas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Truck className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-semibold">Nenhuma rota para hoje</p>
          <p className="text-sm mt-1">Crie uma nova rota para organizar as entregas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rotas.map(rota => {
            const s = statusRota(rota.status);
            const concluidas = rota.paradas?.filter(p => p.status === 'CONCLUIDA').length ?? 0;
            const total = rota.paradas?.length ?? 0;
            const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

            return (
              <div key={rota.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Rota header */}
                <div className="p-5 border-b border-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 font-mono text-sm">{rota.numero}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}>{s.label}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-gray-400" />
                          {rota.motorista_nome} — {rota.veiculo_placa}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          Saída: {rota.horario_partida_planejado} • Retorno: {rota.horario_retorno_planejado}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{concluidas}/{total} paradas</div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paradas — Timeline */}
                <div className="p-5">
                  <div className="relative">
                    {/* Linha vertical de conexão */}
                    {(rota.paradas?.length ?? 0) > 1 && (
                      <div className="absolute left-2.5 top-5 bottom-5 w-px bg-gray-200" />
                    )}

                    <div className="space-y-4">
                      {rota.paradas?.map((parada, idx) => (
                        <div key={parada.id} className="flex items-start gap-4 relative">
                          {STATUS_PARADA_ICON(parada.status)}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TIPO_COLOR[parada.tipo]}`}>
                                {parada.tipo}
                              </span>
                              {parada.horario_planejado && (
                                <span className="text-xs text-gray-400">{parada.horario_planejado}</span>
                              )}
                            </div>
                            <div className="flex items-start gap-1.5 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700 font-medium leading-snug">{parada.endereco}</p>
                            </div>
                          </div>

                          {parada.status === 'EM_ANDAMENTO' && (
                            <button className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                              Confirmar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-center text-gray-400">
        {/* TODO: conectar ao rotasService.getByData(today) */}
        Dados de demonstração — conectar ao rotasService
      </p>
    </div>
  );
};

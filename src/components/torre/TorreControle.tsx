import React, { useState, useEffect } from 'react';
import {
  Radio, CheckCircle2, Clock, Circle,
  ChevronRight, ArrowRight, Package, Truck, User,
  Building2, Activity, Stethoscope
} from 'lucide-react';
import type { Cirurgia, StatusCirurgia } from '../../types';
import { formatDate, getStatusCirurgiaConfig } from '../../lib/utils';
import { useData } from '../../hooks/useData';

// Definição do fluxo de etapas operacionais
const ETAPAS_FLUXO = [
  { id: 'PROTOCOLO', label: 'Protocolo', icon: '📋' },
  { id: 'AUTORIZADO', label: 'Autorizado', icon: '✅' },
  { id: 'NO_MAPA', label: 'No Mapa', icon: '📅' },
  { id: 'MATERIAL_RESERVADO', label: 'Reservado', icon: '📦' },
  { id: 'ENTREGUE', label: 'Entregue', icon: '🚚' },
  { id: 'REALIZADO', label: 'Realizado', icon: '🏥' },
  { id: 'RETORNADO', label: 'Retornado', icon: '↩️' },
];

type EtapaId = 'PROTOCOLO' | 'AUTORIZADO' | 'NO_MAPA' | 'MATERIAL_RESERVADO' | 'ENTREGUE' | 'REALIZADO' | 'RETORNADO';

interface CirurgiaComEtapas {
  cirurgia: Partial<Cirurgia>;
  etapaAtual: EtapaId;
  etapasCompletas: EtapaId[];
}

export const TorreControle: React.FC = () => {
  const { cirurgias } = useData();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isEtapaCompleta = (etapas: EtapaId[], etapa: EtapaId) => etapas.includes(etapa);
  const isEtapaAtual = (atual: EtapaId, etapa: EtapaId) => atual === etapa;

  const cirurgiasAtivas: CirurgiaComEtapas[] = cirurgias.map(c => {
    let etapaAtual: EtapaId = 'NO_MAPA';
    let etapasCompletas: EtapaId[] = ['PROTOCOLO', 'AUTORIZADO', 'NO_MAPA'];
    if (c.status === 'REALIZADA') {
      etapaAtual = 'REALIZADO';
      etapasCompletas = ['PROTOCOLO', 'AUTORIZADO', 'NO_MAPA', 'MATERIAL_RESERVADO', 'ENTREGUE', 'REALIZADO'];
    }
    return {
      cirurgia: c,
      etapaAtual,
      etapasCompletas,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Torre de Controle</h1>
            <p className="text-sm text-gray-500">
              {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} •{' '}
              {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sistema Ativo
          </span>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            {cirurgiasAtivas.length} cirurgias ativas
          </span>
        </div>
      </div>

      {/* Cirurgias Ativas com Timeline */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-blue-500" />
          Cirurgias em Andamento
        </h2>

        <div className="space-y-4">
          {cirurgiasAtivas.map(({ cirurgia, etapaAtual, etapasCompletas }) => {
            const statusCfg = getStatusCirurgiaConfig((cirurgia.status as StatusCirurgia) || 'AGUARDANDO_AUTORIZACAO');
            return (
              <div key={cirurgia.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="p-5 border-b border-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {cirurgia.numero_it && (
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            IT {cirurgia.numero_it}
                          </span>
                        )}
                        <span className="font-bold text-gray-900">{cirurgia.paciente}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.badgeClass}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {cirurgia.hospital_nome}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                          {cirurgia.medico_nome}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(cirurgia.data)} às {cirurgia.horario}
                        </span>
                      </div>
                      {cirurgia.procedimento_nome && (
                        <p className="text-xs text-gray-600 mt-1 font-medium">{cirurgia.procedimento_nome}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline de etapas */}
                <div className="p-5">
                  <div className="flex items-center overflow-x-auto gap-0 pb-1">
                    {ETAPAS_FLUXO.map((etapa, idx) => {
                      const completa = isEtapaCompleta(etapasCompletas, etapa.id as EtapaId);
                      const atual = isEtapaAtual(etapaAtual, etapa.id as EtapaId);
                      const futura = !completa && !atual;

                      return (
                        <React.Fragment key={etapa.id}>
                          <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[64px]">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                                completa
                                  ? 'bg-emerald-500 text-white shadow-md'
                                  : atual
                                  ? 'bg-blue-500 text-white shadow-md shadow-blue-200 animate-pulse ring-4 ring-blue-100'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {completa ? <CheckCircle2 className="w-4 h-4" /> : atual ? <Circle className="w-3 h-3 fill-white" /> : <Circle className="w-3 h-3" />}
                            </div>
                            <span
                              className={`text-[10px] font-semibold text-center leading-tight ${
                                completa ? 'text-emerald-700' : atual ? 'text-blue-700' : 'text-gray-400'
                              }`}
                            >
                              {etapa.label}
                            </span>
                          </div>
                          {idx < ETAPAS_FLUXO.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 min-w-[16px] mx-1 flex-shrink-0 transition-all ${
                                isEtapaCompleta(etapasCompletas, ETAPAS_FLUXO[idx + 1].id as EtapaId) || isEtapaAtual(etapaAtual, ETAPAS_FLUXO[idx + 1].id as EtapaId)
                                  ? 'bg-emerald-400'
                                  : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {cirurgiasAtivas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Radio className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-semibold">Nenhuma cirurgia ativa no momento</p>
          <p className="text-sm mt-1">As cirurgias agendadas aparecerão aqui automaticamente</p>
        </div>
      )}
    </div>
  );
};

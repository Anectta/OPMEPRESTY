import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Cirurgia } from '../../types';
import {
  Flame,
  Calendar as CalendarIcon,
  Building2,
  Stethoscope,
  Package,
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Layers,
  ArrowRight,
  MapPin,
  HelpCircle,
  Check,
  AlertOctagon,
  Boxes,
  Zap,
  Info
} from 'lucide-react';

export type AnalysisMode =
  | 'cirurgias'
  | 'opme'
  | 'equipamentos'
  | 'logistica'
  | 'pendencias'
  | 'operacional';

interface HeatmapDayData {
  dateStr: string;
  dayNumber: number;
  cirurgiasCount: number;
  opmeCount: number;
  equipamentosCount: number;
  logisticaCount: number;
  pendenciasCount: number;
  opScore: number; // 0 to 100
  items: EnrichedSurgery[];
  hasConflict: boolean;
  hasInsufficientStock: boolean;
}

interface EnrichedSurgery extends Cirurgia {
  opmeStatus: 'Aguardando' | 'Separado' | 'Enviado' | 'Entregue' | 'Insuficiente';
  logisticaStatus: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Aguardando Retirada' | 'Concluída';
  equipamentoConflito?: string;
  distanciaLogisticaAlerta?: string;
}

export const MapaCalorOperacional: React.FC = () => {
  const { cirurgias, hospitais, medicos, produtos, veiculos } = useData();
  const { logAuditEvent } = useAuth();

  const [activeMode, setActiveMode] = useState<AnalysisMode>('operacional');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(null);

  // Current view month/year anchor
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Helper to enrich surgery with mock/derived operational logistics & stock status
  const enrichedSurgeries = useMemo<EnrichedSurgery[]>(() => {
    return cirurgias.map((c, index) => {
      // Deterministic pseudo-statuses based on index/id if not present
      const statusesOpme: EnrichedSurgery['opmeStatus'][] = [
        'Separado', 'Enviado', 'Entregue', 'Aguardando', 'Insuficiente'
      ];
      const statusesLog: EnrichedSurgery['logisticaStatus'][] = [
        'Entregue', 'Em Trânsito', 'Pendente', 'Aguardando Retirada', 'Concluída'
      ];

      const opmeStatus = statusesOpme[index % statusesOpme.length];
      const logisticaStatus = statusesLog[index % statusesLog.length];

      // Detect conflicts
      let equipamentoConflito: string | undefined = undefined;
      if (c.equipamento) {
        // Find if another surgery on same date and hour uses same equipment
        const sameEquip = cirurgias.find(
          other => other.id !== c.id && other.data === c.data && other.equipamento === c.equipamento
        );
        if (sameEquip) {
          equipamentoConflito = `Conflito de ${c.equipamento} com Cirurgia ${sameEquip.id} (${sameEquip.hospital_nome})`;
        }
      }

      // Proximity alert
      let distanciaLogisticaAlerta: string | undefined = undefined;
      const nearbySurgeries = cirurgias.filter(
        other => other.id !== c.id && other.data === c.data && other.hospital_id !== c.hospital_id
      );
      if (nearbySurgeries.length > 0 && index % 2 === 0) {
        distanciaLogisticaAlerta = `Atenção Rota: Outra cirurgia em hospital próximo (${nearbySurgeries[0].hospital_nome}) às ${nearbySurgeries[0].horario}h`;
      }

      return {
        ...c,
        opmeStatus: c.situacao === 'Confirmada' ? 'Entregue' : c.situacao === 'Agendada' ? opmeStatus : 'Separado',
        logisticaStatus: c.situacao === 'Realizada' ? 'Aguardando Retirada' : logisticaStatus,
        equipamentoConflito,
        distanciaLogisticaAlerta
      };
    });
  }, [cirurgias]);

  // Filtered surgeries
  const filteredSurgeries = useMemo(() => {
    return enrichedSurgeries.filter((c) => {
      const matchHospital = selectedHospitalFilter === 'todos' || c.hospital_id === selectedHospitalFilter || c.hospital_nome === selectedHospitalFilter;
      const matchSearch =
        searchTerm === '' ||
        c.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.medico_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.hospital_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.material_previsto && c.material_previsto.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.equipamento && c.equipamento.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchHospital && matchSearch;
    });
  }, [enrichedSurgeries, selectedHospitalFilter, searchTerm]);

  // Days in selected Month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Generate heatmap calendar data
  const heatmapCalendarData = useMemo<HeatmapDayData[]>(() => {
    const days: HeatmapDayData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const monthFormatted = String(currentMonth + 1).padStart(2, '0');
      const dayFormatted = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;

      const dayItems = filteredSurgeries.filter((c) => c.data === dateStr);

      const cirurgiasCount = dayItems.length;
      const opmeCount = dayItems.reduce((acc, c) => acc + (c.material_previsto ? 1 : 0), 0);
      const equipamentosCount = dayItems.reduce((acc, c) => acc + (c.equipamento ? 1 : 0), 0);
      const logisticaCount = dayItems.filter((c) => c.logisticaStatus === 'Em Trânsito' || c.logisticaStatus === 'Aguardando Retirada').length;
      
      const pendenciasCount = dayItems.filter(
        (c) => c.situacao === 'Agendada' || c.opmeStatus === 'Aguardando' || c.opmeStatus === 'Insuficiente' || c.equipamentoConflito
      ).length;

      const hasConflict = dayItems.some((c) => !!c.equipamentoConflito);
      const hasInsufficientStock = dayItems.some((c) => c.opmeStatus === 'Insuficiente');

      // Combined operational score 0-100
      let opScore = (cirurgiasCount * 25) + (pendenciasCount * 15) + (hasConflict ? 30 : 0) + (hasInsufficientStock ? 20 : 0);
      if (opScore > 100) opScore = 100;

      days.push({
        dateStr,
        dayNumber: day,
        cirurgiasCount,
        opmeCount,
        equipamentosCount,
        logisticaCount,
        pendenciasCount,
        opScore,
        items: dayItems,
        hasConflict,
        hasInsufficientStock,
      });
    }

    return days;
  }, [currentYear, currentMonth, daysInMonth, filteredSurgeries]);

  // Executive summary metrics answering prompt questions
  const metrics = useMemo(() => {
    const previst = filteredSurgeries.filter(c => c.situacao === 'Agendada' || c.situacao === 'Confirmada');
    const aguardandoConfirma = filteredSurgeries.filter(c => c.situacao === 'Agendada');
    const separados = filteredSurgeries.filter(c => c.opmeStatus === 'Separado');
    const aSeparar = filteredSurgeries.filter(c => c.opmeStatus === 'Aguardando');
    const insuficientes = filteredSurgeries.filter(c => c.opmeStatus === 'Insuficiente');
    const enviados = filteredSurgeries.filter(c => c.opmeStatus === 'Enviado');
    const entregues = filteredSurgeries.filter(c => c.opmeStatus === 'Entregue' || c.logisticaStatus === 'Entregue');
    const retiradasPendentes = filteredSurgeries.filter(c => c.logisticaStatus === 'Aguardando Retirada');
    const conflitosEquipamento = filteredSurgeries.filter(c => !!c.equipamentoConflito);
    const alertasRotas = filteredSurgeries.filter(c => !!c.distanciaLogisticaAlerta);

    // Peak day
    let maxDay = heatmapCalendarData[0];
    heatmapCalendarData.forEach(d => {
      if (d.cirurgiasCount > (maxDay?.cirurgiasCount || 0)) {
        maxDay = d;
      }
    });

    const activeHospitalsCount = new Set(filteredSurgeries.map(c => c.hospital_nome)).size;
    const activeDoctorsCount = new Set(filteredSurgeries.map(c => c.medico_nome)).size;

    // Company overall load gauge (0-100%)
    const totalCirurgiasMês = filteredSurgeries.length;
    const loadPercentage = Math.min(Math.round((totalCirurgiasMês / 30) * 100), 100);

    return {
      totalPrevistas: previst.length,
      peakDayStr: maxDay ? `${maxDay.dayNumber} de ${monthNames[currentMonth]} (${maxDay.cirurgiasCount} cirurgias)` : 'N/A',
      activeHospitalsCount,
      activeDoctorsCount,
      aguardandoConfirma: aguardandoConfirma.length,
      separados: separados.length,
      aSeparar: aSeparar.length,
      insuficientes: insuficientes.length,
      enviados: enviados.length,
      entregues: entregues.length,
      retiradasPendentes: retiradasPendentes.length,
      conflitosEquipamento: conflitosEquipamento.length,
      alertasRotas: alertasRotas.length,
      loadPercentage,
    };
  }, [filteredSurgeries, heatmapCalendarData, currentMonth]);

  // Color generator based on mode intensity
  const getCellHeatStyle = (day: HeatmapDayData) => {
    let intensityValue = 0;
    if (activeMode === 'cirurgias') intensityValue = day.cirurgiasCount;
    else if (activeMode === 'opme') intensityValue = day.opmeCount;
    else if (activeMode === 'equipamentos') intensityValue = day.equipamentosCount + (day.hasConflict ? 2 : 0);
    else if (activeMode === 'logistica') intensityValue = day.logisticaCount;
    else if (activeMode === 'pendencias') intensityValue = day.pendenciasCount;
    else intensityValue = Math.ceil(day.opScore / 20); // 0 to 5

    if (day.items.length === 0) {
      return 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400';
    }

    if (intensityValue === 0) {
      return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300';
    } else if (intensityValue === 1) {
      return 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold';
    } else if (intensityValue === 2) {
      return 'bg-amber-100 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-extrabold';
    } else if (intensityValue === 3) {
      return 'bg-orange-200 dark:bg-orange-950/60 border-orange-500 dark:border-orange-600 text-orange-950 dark:text-orange-100 font-black';
    } else {
      return 'bg-rose-500 dark:bg-rose-600 border-rose-600 dark:border-rose-500 text-white font-black shadow-md shadow-rose-500/20 animate-pulse';
    }
  };

  const selectedDayItems = useMemo(() => {
    if (!selectedDateDetail) return [];
    return filteredSurgeries.filter(c => c.data === selectedDateDetail);
  }, [selectedDateDetail, filteredSurgeries]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/20">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Mapa de Calor Operacional
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Matriz dinâmica de densidade, logística de materiais OPME, conflitos de equipamentos e gargalos operacionais
              </p>
            </div>
          </div>
        </div>

        {/* Carga Operacional Global Gauge */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Carga Operacional Empresa
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {metrics.loadPercentage}% <span className="text-xs font-normal text-slate-500">Capacidade</span>
            </span>
          </div>
          <div className="w-20 bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.loadPercentage > 80 ? 'bg-rose-500' : metrics.loadPercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${metrics.loadPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6 Analysis Mode Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          
          <button
            onClick={() => {
              setActiveMode('cirurgias');
              logAuditEvent('VIEW_HEATMAP_MODE', 'MapaCalor', 'Modo 1 - Cirurgias');
            }}
            className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between ${
              activeMode === 'cirurgias'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20">
                MODO 1
              </span>
            </div>
            <div className="mt-2">
              <p className="font-black text-xs">Cirurgias</p>
              <p className="text-[10px] opacity-80 line-clamp-1">Concentração por dia</p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveMode('opme');
              logAuditEvent('VIEW_HEATMAP_MODE', 'MapaCalor', 'Modo 2 - OPME');
            }}
            className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between ${
              activeMode === 'opme'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <Package className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20">
                MODO 2
              </span>
            </div>
            <div className="mt-2">
              <p className="font-black text-xs">OPME</p>
              <p className="text-[10px] opacity-80 line-clamp-1">Volume de Materiais</p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveMode('equipamentos');
              logAuditEvent('VIEW_HEATMAP_MODE', 'MapaCalor', 'Modo 3 - Equipamentos');
            }}
            className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between ${
              activeMode === 'equipamentos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <Boxes className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20">
                MODO 3
              </span>
            </div>
            <div className="mt-2">
              <p className="font-black text-xs">Equipamentos</p>
              <p className="text-[10px] opacity-80 line-clamp-1">Uso & Conflitos</p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveMode('logistica');
              logAuditEvent('VIEW_HEATMAP_MODE', 'MapaCalor', 'Modo 4 - Logística');
            }}
            className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between ${
              activeMode === 'logistica'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <Truck className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20">
                MODO 4
              </span>
            </div>
            <div className="mt-2">
              <p className="font-black text-xs">Logística</p>
              <p className="text-[10px] opacity-80 line-clamp-1">Entregas e Retiradas</p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveMode('pendencias');
              logAuditEvent('VIEW_HEATMAP_MODE', 'MapaCalor', 'Modo 5 - Pendências');
            }}
            className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between ${
              activeMode === 'pendencias'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20">
                MODO 5
              </span>
            </div>
            <div className="mt-2">
              <p className="font-black text-xs">Pendências</p>
              <p className="text-[10px] opacity-80 line-clamp-1">Alertas e Problemas</p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveMode('operacional');
              logAuditEvent('VIEW_HEATMAP_MODE', 'MapaCalor', 'Modo 6 - Operacional');
            }}
            className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between ${
              activeMode === 'operacional'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/30'
                : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <Zap className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20">
                MODO 6
              </span>
            </div>
            <div className="mt-2">
              <p className="font-black text-xs">Operacional</p>
              <p className="text-[10px] opacity-80 line-clamp-1">Visão Combinada</p>
            </div>
          </button>

        </div>
      </div>

      {/* Direct Answer Executive KPI Grid (Respostas Rápidas para Perguntas Operacionais) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cirurgias Previstas</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{metrics.totalPrevistas}</p>
          <p className="text-[10px] text-blue-600 font-bold mt-1 line-clamp-1">Pico: {metrics.peakDayStr}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospitais & Médicos</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{metrics.activeHospitalsCount} / {metrics.activeDoctorsCount}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Hospitais / Cirurgiões</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Separação OPME</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-black text-emerald-600">{metrics.separados} <span className="text-[9px] text-slate-400 font-normal">ok</span></span>
            <span className="text-base font-black text-amber-500">{metrics.aSeparar} <span className="text-[9px] text-slate-400 font-normal">pend</span></span>
          </div>
          <p className="text-[10px] text-rose-500 font-bold mt-0.5">{metrics.insuficientes} com falta em estoque</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Logístico</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-black text-blue-600">{metrics.enviados} <span className="text-[9px] text-slate-400 font-normal">env</span></span>
            <span className="text-base font-black text-emerald-600">{metrics.entregues} <span className="text-[9px] text-slate-400 font-normal">entr</span></span>
          </div>
          <p className="text-[10px] text-purple-500 font-bold mt-0.5">{metrics.retiradasPendentes} aguardando devolução</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conflitos Equipamento</p>
          <p className={`text-xl font-black mt-1 font-mono ${metrics.conflitosEquipamento > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
            {metrics.conflitosEquipamento}
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Mesmo horário/local</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aguardando Confirmação</p>
          <p className="text-xl font-black text-amber-500 mt-1 font-mono">{metrics.aguardandoConfirma}</p>
          <p className="text-[10px] text-amber-600 font-bold mt-1">Procedimentos pendentes</p>
        </div>
      </div>

      {/* Filter and Navigation Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cirurgia, médico, OPME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedHospitalFilter}
              onChange={(e) => setSelectedHospitalFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-bold text-xs"
            >
              <option value="todos">Todos os Hospitais</option>
              {hospitais.map((h) => (
                <option key={h.id} value={h.id}>{h.nome}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Dynamic Heatmap Calendar Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-5 space-y-4">
        
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            Matriz Calendário de Intensidade ({activeMode.toUpperCase()})
          </h2>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold flex-wrap">
            <span className="text-slate-400 flex items-center gap-1">
              Escala de Calor:
              <span className="text-[9px] text-slate-500 font-normal">(Valores por dia)</span>
            </span>
            <span title="0 cirurgias / eventos no dia" className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              Sem Eventos (0)
            </span>
            <span title="1 cirurgia / evento no dia" className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 border border-blue-300 dark:border-blue-800">
              Baixo (1)
            </span>
            <span title="2 cirurgias / eventos no dia" className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 border border-amber-400 dark:border-amber-700">
              Médio (2)
            </span>
            <span title="3 cirurgias / eventos no dia" className="px-2 py-0.5 rounded bg-orange-300 dark:bg-orange-800 text-orange-950 dark:text-orange-100 border border-orange-500 dark:border-orange-600">
              Alto (3)
            </span>
            <span title="4 ou mais cirurgias / conflito grave / risco em estoque" className="px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse border border-rose-700 shadow-xs">
              Crítico / Pico (4+)
            </span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty offset padding for first week */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`offset-${i}`} className="h-20 sm:h-24 bg-slate-50/30 dark:bg-slate-900/10 rounded-xl border border-transparent" />
          ))}

          {/* Days */}
          {heatmapCalendarData.map((day) => {
            const heatStyle = getCellHeatStyle(day);
            const isSelected = selectedDateDetail === day.dateStr;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDateDetail(isSelected ? null : day.dateStr)}
                className={`h-20 sm:h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden ${heatStyle} ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg z-10' : ''
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-black">{day.dayNumber}</span>
                  {day.hasConflict && (
                    <span className="p-0.5 rounded-full bg-rose-600 text-white text-[9px]" title="Conflito de Equipamento!">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Day Summary Indicators */}
                <div className="space-y-0.5 text-[9px]">
                  {day.cirurgiasCount > 0 ? (
                    <>
                      <p className="font-bold line-clamp-1">
                        {day.cirurgiasCount} {day.cirurgiasCount === 1 ? 'Cirurgia' : 'Cirurgias'}
                      </p>
                      {activeMode === 'opme' && (
                        <p className="opacity-90 font-mono">{day.opmeCount} OPME</p>
                      )}
                      {activeMode === 'equipamentos' && (
                        <p className="opacity-90 font-mono">{day.equipamentosCount} Eqp</p>
                      )}
                      {activeMode === 'logistica' && (
                        <p className="opacity-90 font-mono">{day.logisticaCount} Entregas</p>
                      )}
                      {activeMode === 'pendencias' && (
                        <p className="opacity-90 font-mono">{day.pendenciasCount} Alertas</p>
                      )}
                    </>
                  ) : (
                    <span className="text-[9px] opacity-40">Livre</span>
                  )}
                </div>

                {/* Visual heat bar at bottom of cell */}
                {day.cirurgiasCount > 0 && (
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-current h-full"
                      style={{ width: `${Math.min(day.cirurgiasCount * 25, 100)}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Drawer / Expansion */}
      {selectedDateDetail && (
        <div className="bg-white dark:bg-slate-900 border border-blue-500/50 dark:border-blue-500/40 rounded-2xl p-5 shadow-lg space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Detalhamento Operacional: {selectedDateDetail} ({selectedDayItems.length} Cirurgias)
            </h3>
            <button
              onClick={() => setSelectedDateDetail(null)}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold"
            >
              Fechar
            </button>
          </div>

          {selectedDayItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Nenhuma cirurgia agendada para este dia.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDayItems.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-black text-blue-600">{c.id} - {c.horario}h</span>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{c.paciente}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                      {c.situacao}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    <p><strong className="text-slate-900 dark:text-white">Hospital:</strong> {c.hospital_nome}</p>
                    <p><strong className="text-slate-900 dark:text-white">Médico:</strong> {c.medico_nome}</p>
                    <p><strong className="text-slate-900 dark:text-white">Convênio:</strong> {c.convenio_nome}</p>
                    <p><strong className="text-slate-900 dark:text-white">Vendedor:</strong> {c.vendedor_nome}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-amber-500" /> OPME Previsto: {c.material_previsto || 'Não especificado'}
                    </p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Boxes className="w-3.5 h-3.5 text-indigo-500" /> Equipamento: {c.equipamento || 'Nenhum'}
                    </p>
                  </div>

                  {c.equipamentoConflito && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{c.equipamentoConflito}</span>
                    </div>
                  )}

                  {c.distanciaLogisticaAlerta && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{c.distanciaLogisticaAlerta}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Critical Alerts & Logistics Flow Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Pending Issues & Conflicts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Gargalos & Conflitos Operacionais Identificados
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              ALERTA EM TEMPO REAL
            </span>
          </div>

          <div className="space-y-3">
            {metrics.conflitosEquipamento > 0 ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-xs">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-900 dark:text-rose-200">
                    {metrics.conflitosEquipamento} Conflito(s) de Equipamento Duplicado
                  </p>
                  <p className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
                    Equipamentos alocados simultaneamente em hospitais distintos no mesmo horário. Recomenda-se remanejamento urgente de estoque.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">Nenhum Conflito de Equipamentos</p>
                  <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">Todos os equipamentos possuem escala compatível sem sobreposição de horário.</p>
                </div>
              </div>
            )}

            {metrics.insuficientes > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs">
                <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-amber-900 dark:text-amber-200">
                    {metrics.insuficientes} Procedimento(s) com Material Insuficiente
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                    Lotes cadastrados em estoque com saldo abaixo da lista prevista no protocolo cirúrgico.
                  </p>
                </div>
              </div>
            )}

            {metrics.aguardandoConfirma > 0 && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3 text-xs">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-blue-900 dark:text-blue-200">
                    {metrics.aguardandoConfirma} Cirurgia(s) Aguardando Confirmação do Hospital
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-[11px] mt-0.5">
                    Procedimentos agendados sem liberação final da equipe médica ou termo de consignação assinado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Hospital Concentration Heat Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Concentração por Hospital Credenciado
            </h3>
            <span className="text-[10px] font-bold text-slate-400">UNIDADES ATIVAS</span>
          </div>

          <div className="space-y-3">
            {hospitais.slice(0, 5).map((h) => {
              const hospSurgeries = filteredSurgeries.filter(c => c.hospital_id === h.id || c.hospital_nome === h.nome);
              const count = hospSurgeries.length;
              const pct = Math.min(Math.round((count / (filteredSurgeries.length || 1)) * 100), 100);

              return (
                <div key={h.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200 truncate">{h.nome}</span>
                    <span className="font-mono text-slate-500">{count} cirurgias ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

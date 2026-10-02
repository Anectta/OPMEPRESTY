import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Cirurgia, SituacaoCirurgia } from '../../types';
import { getStatusBadge, formatDate, formatBRL } from '../../lib/utils';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Building2,
  Clock,
  X,
  AlertCircle,
  Truck,
  Package,
  CheckCircle2,
  Boxes,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  Info,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  RotateCcw,
  Sliders,
  FileSpreadsheet,
  Layers,
  MapPin,
  FileText
} from 'lucide-react';

export type InternalTab = 'overview' | 'agendamento' | 'grade_frota';

interface Props {
  initialTab?: InternalTab;
}

export const MapaCirurgico: React.FC<Props> = ({ initialTab = 'overview' }) => {
  const { cirurgias, hospitais, medicos, convenios, vendedores, produtos, veiculos, addCirurgia, updateCirurgia } = useData();
  const { logAuditEvent, user } = useAuth();

  const [activeTab, setActiveTab] = useState<InternalTab>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('todos');
  const [selectedSituacao, setSelectedSituacao] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Date range filter state for Overview
  const [dateStart, setDateStart] = useState('2026-08-01');
  const [dateEnd, setDateEnd] = useState('2026-08-31');
  const [quickDatePreset, setQuickDatePreset] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('mes');

  // Form State for new Surgery
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    horario: '08:00',
    hospital_id: hospitais[0]?.id || '',
    medico_id: medicos[0]?.id || '',
    paciente: '',
    paciente_cpf: '',
    convenio_id: convenios[0]?.id || '',
    vendedor_id: vendedores[0]?.id || '',
    situacao: 'Agendada' as SituacaoCirurgia,
    equipamento: '',
    acessorio: '',
    ld_ct: '',
    material_previsto: '',
    tecnico_nome: '',
    observacao: '',
  });

  // Enriched Surgeries with derived logistics statuses & contents
  const enrichedCirurgias = useMemo(() => {
    return cirurgias.map((c, index) => {
      const logisticaStatusList = ['Confirmada', 'Agendada', 'Em Trânsito', 'Entregue', 'Devolvida Parcial'];
      const localAtualList = ['Central de Distribuição', 'Em Trânsito - Sprinter #01', 'Centro Cirúrgico Bloco A', 'Posto H. Einstein', 'Esterilização OPME'];
      const conteudoOpmeList = [
        'Prótese Quadril Híbrida + Par Parafusos',
        'Kit Artroplastia Joelho Total Titanium',
        'Cage Cervical Peak + Placa Anterior C3-C5',
        'Sistema de Fixação Pedicular L4-S1',
        'Sutura Âncora e Instrumental Especializado',
      ];

      const statusLogistico = logisticaStatusList[index % logisticaStatusList.length];
      const localAtual = localAtualList[index % localAtualList.length];
      const conteudoOpme = c.material_previsto || conteudoOpmeList[index % conteudoOpmeList.length];

      return {
        ...c,
        kitId: `KIT-${c.id.replace('cir-', '2026-')}`,
        statusLogistico,
        localAtual,
        conteudoOpme,
      };
    });
  }, [cirurgias]);

  // Filtered Surgeries
  const filteredCirurgias = useMemo(() => {
    return enrichedCirurgias.filter((c) => {
      const matchesSearch =
        c.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.medico_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.hospital_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.kitId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesHospital = selectedHospital === 'todos' || c.hospital_id === selectedHospital;
      const matchesSituacao = selectedSituacao === 'todas' || c.situacao === selectedSituacao;

      return matchesSearch && matchesHospital && matchesSituacao;
    });
  }, [enrichedCirurgias, searchTerm, selectedHospital, selectedSituacao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.paciente.trim()) return;

    const hospObj = hospitais.find((h) => h.id === formData.hospital_id);
    const medObj = medicos.find((m) => m.id === formData.medico_id);
    const convObj = convenios.find((c) => c.id === formData.convenio_id);
    const vendObj = vendedores.find((v) => v.id === formData.vendedor_id);

    const created = await addCirurgia({
      data: formData.data,
      horario: formData.horario,
      hospital_id: formData.hospital_id,
      hospital_nome: hospObj?.nome || 'Hospital Não Especificado',
      medico_id: formData.medico_id,
      medico_nome: medObj?.nome || 'Dr. Médico',
      paciente: formData.paciente,
      paciente_cpf: formData.paciente_cpf,
      convenio_id: formData.convenio_id,
      convenio_nome: convObj?.nome || 'Convênio',
      vendedor_id: formData.vendedor_id,
      vendedor_nome: vendObj?.nome || 'Vendedor',
      situacao: formData.situacao,
      equipamento: formData.equipamento,
      acessorio: formData.acessorio,
      ld_ct: formData.ld_ct,
      material_previsto: formData.material_previsto,
      tecnico_nome: formData.tecnico_nome,
      observacao: formData.observacao,
      empresa_id: 'emp-001',
      created_by: user?.id,
    });

    logAuditEvent('CREATE_CIRURGIA', 'MapaCirurgico', created.id, { paciente: formData.paciente, hospital: hospObj?.nome }, 'medium');
    setIsModalOpen(false);
  };

  // Helper for KPI Sparklines
  const renderSparkline = (points: number[], strokeColor: string, fillColor?: string) => {
    const width = 120;
    const height = 28;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const coords = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });

    const pathData = `M ${coords.join(' L ')}`;
    const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

    return (
      <svg width={width} height={height} className="overflow-visible">
        {fillColor && <path d={areaData} fill={fillColor} opacity={0.2} />}
        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Module Navigation & Action Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  Painel de Gestão Logística OPME - Mapa Cirúrgico
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Controle unificado de kits OPME, separação de estoques, rotas de frota, vistorias e atendimento a hospitais.
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start ml-2">
                Visão Operacional 2026
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Date Presets */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setQuickDatePreset('hoje')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  quickDatePreset === 'hoje' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setQuickDatePreset('semana')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  quickDatePreset === 'semana' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => setQuickDatePreset('mes')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  quickDatePreset === 'mes' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Este Mês
              </button>
            </div>

            {/* Date Range Controls */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <span className="text-slate-400 font-normal">até</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Cirurgia OPME
            </button>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Visão Operacional (Overview)
            </button>

            <button
              onClick={() => setActiveTab('agendamento')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'agendamento'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Agenda & Tabela de Cirurgias ({filteredCirurgias.length})
            </button>

            <button
              onClick={() => setActiveTab('grade_frota')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'grade_frota'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Grade Horária da Frota
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dados em tempo real
          </div>
        </div>
      </div>

      {/* ==================== TAB 1: VISÃO OPERACIONAL (OVERVIEW) ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-3.5">
          
          {/* Top 4 KPI Cards Inspired Directly by Reference Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            
            {/* KPI 1: Total de Kit/OPME Movimentados */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total de Kit/OPME Movimentados
                </span>
                <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <Boxes className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">2.345</p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12.4% vs mês anterior
                  </p>
                </div>
                {renderSparkline([120, 150, 180, 140, 210, 240, 280, 310, 290, 345], '#2563EB', '#3B82F6')}
              </div>
            </div>

            {/* KPI 2: Tempo Médio de Preparo/Expedição */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tempo Médio de Preparo/Expedição
                </span>
                <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">2.1 Dias</p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    -0.4 dias (Ganho de agilidade)
                  </p>
                </div>
                {renderSparkline([4.2, 3.8, 3.5, 3.1, 2.9, 2.7, 2.4, 2.2, 2.1], '#10B981', '#10B981')}
              </div>
            </div>

            {/* KPI 3: Acurácia de Inventário OPME */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Acurácia de Inventário OPME
                </span>
                <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">98.7%</p>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    Conformidade ANVISA / Lotes
                  </p>
                </div>
                {renderSparkline([95.2, 96.1, 97.0, 96.8, 97.5, 98.1, 98.4, 98.7], '#059669')}
              </div>
            </div>

            {/* KPI 4: Entregas Pontuais (OTD) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Entregas Pontuais (OTD)
                </span>
                <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Truck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">1.102</p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    96.4% dentro da janela
                  </p>
                </div>
                {/* Mini Bar Chart */}
                <div className="flex items-end gap-1 h-7">
                  <span className="w-2 bg-blue-300 dark:bg-blue-800 rounded-t h-[40%]"></span>
                  <span className="w-2 bg-blue-400 dark:bg-blue-700 rounded-t h-[60%]"></span>
                  <span className="w-2 bg-blue-500 dark:bg-blue-600 rounded-t h-[80%]"></span>
                  <span className="w-2 bg-blue-600 dark:bg-blue-500 rounded-t h-[55%]"></span>
                  <span className="w-2 bg-blue-700 dark:bg-blue-400 rounded-t h-[90%]"></span>
                  <span className="w-2 bg-blue-600 dark:bg-blue-500 rounded-t h-[100%]"></span>
                </div>
              </div>
            </div>

          </div>

          {/* Middle Row 1: 3 Visual Charts (Kits por Hospital, Status em Preparo, Kits Preparados por Dia) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            
            {/* Chart 1: Kits por Hospital Atendido (Donut + Legend) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Kits por Hospital Atendido
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Distribuição %</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
                {/* Donut SVG */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="16" className="dark:stroke-slate-800" />
                    {/* Hospital A: 45% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563EB" strokeWidth="16" strokeDasharray="107 131" strokeDashoffset="0" />
                    {/* Hospital B: 25% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="16" strokeDasharray="60 178" strokeDashoffset="-107" />
                    {/* Hospital C: 15% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="16" strokeDasharray="36 202" strokeDashoffset="-167" />
                    {/* Hospital D: 10% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="16" strokeDasharray="24 214" strokeDashoffset="-203" />
                    {/* Hospital E: 5% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EC4899" strokeWidth="16" strokeDasharray="12 226" strokeDashoffset="-227" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">100%</span>
                    <span className="text-[9px] font-bold text-slate-400">Total Rede</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-1.5 w-full text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      Hosp. Albert Einstein
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">45%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Hosp. Sírio-Libanês
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Hosp. Osvaldo Cruz
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">15%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      Hosp. Samaritano
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">10%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      Outros Hospitais SP/RJ
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Status das Cirurgias em Tempo de Preparo */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Status das Cirurgias em Tempo de Preparo
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Fluxo Interno</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
                {/* Donut SVG */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="16" className="dark:stroke-slate-800" />
                    {/* Aprovadas: 68% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0284C7" strokeWidth="16" strokeDasharray="162 76" strokeDashoffset="0" />
                    {/* Em Processamento: 22% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#38BDF8" strokeWidth="16" strokeDasharray="52 186" strokeDashoffset="-162" />
                    {/* Atrasadas: 10% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EA580C" strokeWidth="16" strokeDasharray="24 214" strokeDashoffset="-214" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">68%</span>
                    <span className="text-[9px] font-bold text-emerald-600">Aprovadas</span>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="space-y-2 w-full">
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-sky-900 dark:text-sky-300">Aprovadas & Pronto Envio</p>
                      <p className="text-[9px] text-sky-600 dark:text-sky-400 font-medium">Kit verificado e lacrado</p>
                    </div>
                    <span className="text-sm font-black text-sky-700 dark:text-sky-300">68%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Em Processamento</p>
                      <p className="text-[9px] text-slate-400 font-medium">Separando no almoxarifado</p>
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">22%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300">Atrasadas / Alerta Lote</p>
                      <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">Aguardando laudo técnico</p>
                    </div>
                    <span className="text-sm font-black text-amber-700 dark:text-amber-300">10%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Kits Preparados por Dia e Horário */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  Kits Preparados por Dia da Semana
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Volume Diário</span>
              </div>

              {/* Bar Chart Representation */}
              <div className="pt-2 pb-1 space-y-2">
                <div className="grid grid-cols-7 gap-1.5 items-end h-36">
                  {[
                    { day: 'Dom', val: 150, max: 180 },
                    { day: 'Seg', val: 140, max: 180 },
                    { day: 'Ter', val: 160, max: 180 },
                    { day: 'Qua', val: 140, max: 180 },
                    { day: 'Qui', val: 150, max: 180 },
                    { day: 'Sex', val: 140, max: 180 },
                    { day: 'Sáb', val: 160, max: 180 },
                  ].map((item, idx) => {
                    const heightPct = Math.round((item.val / item.max) * 100);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 group h-full justify-end">
                        <span className="text-[9px] font-mono font-bold text-slate-500 opacity-80 group-hover:opacity-100">
                          {item.val}
                        </span>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end p-0.5">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-gradient-to-t from-blue-700 to-sky-500 dark:from-blue-600 dark:to-cyan-400 rounded-t-sm transition-all group-hover:brightness-110"
                          ></div>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 font-medium">
                  <span>Média diária: 148.5 kits</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Pico de Expedição: Ter/Sáb</span>
                </div>
              </div>
            </div>

          </div>

          {/* Middle Row 2: 3 Additional Operational Widgets (Estoque por Família, Devoluções, Grade Horária da Frota) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            
            {/* Chart 4: Níveis de Estoque por Família OPME */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-blue-600" />
                  Níveis de Estoque por Família OPME
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Saldos Físicos</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {[
                  { familia: 'Cervical (Coluna)', reservado: 35, disponivel: 88, total: 150 },
                  { familia: 'Joelho (Prótese/Artro)', reservado: 120, disponivel: 130, total: 160 },
                  { familia: 'Quadril (Híbrida/Cem.)', reservado: 99, disponivel: 53, total: 160 },
                  { familia: 'Parafusos Pediculares', reservado: 10, disponivel: 23, total: 110 },
                  { familia: 'Instrumental Cirúrgico', reservado: 10, disponivel: 15, total: 59 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{item.familia}</span>
                      <span className="text-slate-500 font-mono">
                        {item.disponivel} disp. / {item.total} total
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(item.reservado / item.total) * 100}%` }}
                        className="bg-amber-500 h-full"
                        title={`Reservado: ${item.reservado}`}
                      ></div>
                      <div
                        style={{ width: `${(item.disponivel / item.total) * 100}%` }}
                        className="bg-blue-600 h-full"
                        title={`Disponível: ${item.disponivel}`}
                      ></div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> Disponível
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Reservado em Cirurgia
                  </span>
                </div>
              </div>
            </div>

            {/* Chart 5: Status das Devoluções de Kits */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  Status das Devoluções de Kits (Pós-Cirúrgico)
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Consignado</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
                {/* Donut Chart */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="16" className="dark:stroke-slate-800" />
                    {/* Processadas: 70% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#059669" strokeWidth="16" strokeDasharray="167 71" strokeDashoffset="0" />
                    {/* Em Inspeção: 20% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0284C7" strokeWidth="16" strokeDasharray="48 190" strokeDashoffset="-167" />
                    {/* Pendente de Devolução: 10% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#D97706" strokeWidth="16" strokeDasharray="24 214" strokeDashoffset="-215" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">70%</span>
                    <span className="text-[9px] font-bold text-emerald-600">Concluídas</span>
                  </div>
                </div>

                <div className="space-y-2 w-full text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300">Processadas / Faturadas</p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Gasto conferido com hospital</p>
                    </div>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">70%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-sky-900 dark:text-sky-300">Em Inspeção & Esterilização</p>
                      <p className="text-[9px] text-sky-600 dark:text-sky-400 font-medium">Triagem na central de limpeza</p>
                    </div>
                    <span className="text-sm font-black text-sky-700 dark:text-sky-300">20%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300">Pendente de Devolução</p>
                      <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">Aguardando recolhimento motorista</p>
                    </div>
                    <span className="text-sm font-black text-amber-700 dark:text-amber-300">10%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 6: Disponibilidade de Veículos OPME & Grade Horária (Vehicle Heatmap Matrix) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Disponibilidade de Veículos OPME
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Grade Semanal</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[9px] border-collapse text-center">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                      <th className="p-1 text-left">Horário</th>
                      <th className="p-1">Dom</th>
                      <th className="p-1">Seg</th>
                      <th className="p-1">Ter</th>
                      <th className="p-1">Qua</th>
                      <th className="p-1">Qui</th>
                      <th className="p-1">Sex</th>
                      <th className="p-1">Sáb</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                    {[
                      { slot: '00 - 02', status: ['disp', 'disp', 'disp', 'disp', 'disp', 'disp', 'disp'] },
                      { slot: '03 - 04', status: ['disp', 'disp', 'transito', 'transito', 'disp', 'disp', 'transito'] },
                      { slot: '05 - 06', status: ['disp', 'transito', 'transito', 'disp', 'disp', 'manutencao', 'transito'] },
                      { slot: '07 - 08', status: ['disp', 'disp', 'veh1', 'disp', 'disp', 'disp', 'disp'] },
                      { slot: '09 - 10', status: ['disp', 'disp', 'disp', 'disp', 'disp', 'disp', 'disp'] },
                      { slot: '11 - 12', status: ['disp', 'disp', 'disp', 'disp', 'disp', 'disp', 'veh2'] },
                      { slot: '13 - 14', status: ['disp', 'disp', 'disp', 'disp', 'disp', 'disp', 'disp'] },
                      { slot: '15 - 16', status: ['disp', 'disp', 'disp', 'disp', 'disp', 'disp', 'disp'] },
                      { slot: '17 - 18', status: ['disp', 'disp', 'disp', 'disp', 'disp', 'disp', 'disp'] },
                      { slot: '19 - 20', status: ['disp', 'veh3', 'disp', 'disp', 'disp', 'disp', 'disp'] },
                    ].map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-1 text-left font-mono font-bold text-slate-500 whitespace-nowrap">{row.slot}</td>
                        {row.status.map((st, cIdx) => {
                          let bg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';
                          let label = 'Disponível';

                          if (st === 'transito') {
                            bg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
                            label = 'Em Trânsito';
                          } else if (st === 'manutencao') {
                            bg = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
                            label = 'Manutenção';
                          } else if (st === 'veh1') {
                            bg = 'bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 font-extrabold';
                            label = 'VISS/123 ID';
                          } else if (st === 'veh2') {
                            bg = 'bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 font-extrabold';
                            label = 'VIS51123 ID';
                          } else if (st === 'veh3') {
                            bg = 'bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 font-extrabold';
                            label = 'VV84-009 ID';
                          }

                          return (
                            <td key={cIdx} className="p-0.5">
                              <span className={`block py-0.5 px-1 rounded text-[8px] truncate ${bg}`}>
                                {label}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Bottom Row: Complete Operational OPME Surgical Table Cross-Data */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden space-y-3 p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Tabela Operacional Integrada - Mapa Cirúrgico e Logística OPME
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cruzamento em tempo real de pacientes, convênios, cirurgiões, hospitais, kits consignados e rastreamento de veículos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar kit, paciente, hospital..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-[11px] min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-2.5 pl-3">Kit ID / Cirurgia</th>
                    <th className="p-2.5">Data / Hora Cir.</th>
                    <th className="p-2.5">Hospital / Médico</th>
                    <th className="p-2.5">Paciente / Convênio</th>
                    <th className="p-2.5">Conteúdo OPME Principal</th>
                    <th className="p-2.5">Status Logístico</th>
                    <th className="p-2.5 text-right pr-3">Local Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCirurgias.map((c) => {
                    const badge = getStatusBadge(c.situacao);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 pl-3 font-mono">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">{c.kitId}</span>
                          <p className="text-[9px] text-slate-400 font-medium">Ref: {c.id}</p>
                        </td>

                        <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                          {formatDate(c.data)}
                          <p className="text-[9px] text-slate-400 font-normal">{c.horario}h</p>
                        </td>

                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.hospital_nome}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{c.medico_nome} ({c.vendedor_nome})</p>
                        </td>

                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.paciente}</p>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {c.convenio_nome}
                          </span>
                        </td>

                        <td className="p-2.5 max-w-[240px]">
                          <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{c.conteudoOpme}</p>
                        </td>

                        <td className="p-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${badge.bg} ${badge.text}`}>
                            {c.statusLogistico}
                          </span>
                        </td>

                        <td className="p-2.5 text-right pr-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{c.localAtual}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 2: AGENDA & TABELA DE CIRURGIAS ==================== */}
      {activeTab === 'agendamento' && (
        <div className="space-y-3.5">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TOTAL CIRURGIAS NO MAPA</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{cirurgias.length}</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-0.5">34 Ativas neste mês</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">HOSPITAIS ATENDIDOS</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{hospitais.length}</p>
              <p className="text-[10px] font-bold text-blue-600 mt-0.5">Rede Credenciada SP/RJ/MG</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">MÉDICOS CIRURGIÕES</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{medicos.length}</p>
              <p className="text-[10px] font-bold text-amber-600 mt-0.5">100% CRM Ativo</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, médico ou hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="todos">Todos os Hospitais</option>
                {hospitais.map((h) => (
                  <option key={h.id} value={h.id}>{h.nome}</option>
                ))}
              </select>

              <select
                value={selectedSituacao}
                onChange={(e) => setSelectedSituacao(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="todas">Todas as Situações</option>
                <option value="Agendada">Agendada</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Realizada">Realizada</option>
                <option value="Faturada">Faturada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Surgeries Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-[11px] min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-2.5 pl-3.5 w-[12%]">Cód. / Data</th>
                    <th className="p-2.5 w-[18%]">Hospital</th>
                    <th className="p-2.5 w-[18%]">Médico / Especialidade</th>
                    <th className="p-2.5 w-[18%]">Paciente & Convênio</th>
                    <th className="p-2.5 w-[22%]">Equipamento / Material Previsto</th>
                    <th className="p-2.5 w-[12%]">Situação</th>
                    <th className="p-2.5 text-right pr-3.5 w-[10%]">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {filteredCirurgias.map((c) => {
                    const badge = getStatusBadge(c.situacao);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 pl-3.5 font-mono">
                          <span className="font-extrabold text-slate-900 dark:text-white whitespace-nowrap">{c.id}</span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                            <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{formatDate(c.data)} - {c.horario}h</span>
                          </div>
                        </td>

                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-2">{c.hospital_nome}</span>
                          </div>
                        </td>

                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.medico_nome}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{c.vendedor_nome} (Vendedor)</p>
                        </td>

                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.paciente}</p>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-w-full truncate">
                            {c.convenio_nome}
                          </span>
                        </td>

                        <td className="p-2.5">
                          <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{c.material_previsto || 'Não especificado'}</p>
                          {c.equipamento && <p className="text-[9px] text-slate-400 line-clamp-1">Eq: {c.equipamento}</p>}
                        </td>

                        <td className="p-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border whitespace-nowrap ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>

                        <td className="p-2.5 text-right pr-3.5">
                          <select
                            value={c.situacao}
                            onChange={(e) => {
                              updateCirurgia(c.id, { situacao: e.target.value as SituacaoCirurgia });
                              logAuditEvent('UPDATE_CIRURGIA_SITUACAO', 'MapaCirurgico', c.id, { nova_situacao: e.target.value });
                            }}
                            className="px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none max-w-full"
                          >
                            <option value="Agendada">Agendada</option>
                            <option value="Confirmada">Confirmada</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Realizada">Realizada</option>
                            <option value="Faturada">Faturada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 4: GRADE HORÁRIA DA FROTA ==================== */}
      {activeTab === 'grade_frota' && (
        <div className="space-y-3.5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Escala de Frota & Motoristas Credenciados OPME
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoramento de vans refrigeradas, vistorias fotográficas e rotas de entrega de consignado.
                </p>
              </div>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                100% Veículos Vistoriados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {veiculos.map((v) => (
                <div key={v.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-slate-900 dark:text-white">{v.placa}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Disponível
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{v.modelo} ({v.ano})</p>
                  <p className="text-[11px] text-slate-400">Condutor habitual: {v.responsavel_nome || 'Escala Rotativa'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== NEW SURGERY MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Agendar Nova Cirurgia OPME
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Data da Cirurgia</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Horário Previsto</label>
                  <input
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hospital Atendido</label>
                  <select
                    value={formData.hospital_id}
                    onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    {hospitais.map((h) => (
                      <option key={h.id} value={h.id}>{h.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Médico Cirurgião</label>
                  <select
                    value={formData.medico_id}
                    onChange={(e) => setFormData({ ...formData, medico_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>{m.nome} ({m.crm})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome do Paciente</label>
                  <input
                    type="text"
                    placeholder="Nome completo do paciente..."
                    value={formData.paciente}
                    onChange={(e) => setFormData({ ...formData, paciente: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Operadora / Convênio</label>
                  <select
                    value={formData.convenio_id}
                    onChange={(e) => setFormData({ ...formData, convenio_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    {convenios.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Materiais OPME Previstos & Kit Solicitado</label>
                  <textarea
                    rows={2}
                    placeholder="Descreva as próteses, instrumental, parafusos ou caixa de instrumentação necessária..."
                    value={formData.material_previsto}
                    onChange={(e) => setFormData({ ...formData, material_previsto: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  Confirmar Agendamento OPME
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

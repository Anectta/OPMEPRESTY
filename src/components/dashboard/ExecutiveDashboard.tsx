import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatBRL, formatDate } from '../../lib/utils';
import {
  Activity,
  Calendar,
  FileSpreadsheet,
  Package,
  TrendingUp,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<Props> = ({ setActiveTab }) => {
  const { cirurgias, protocolos, produtos, vendas, veiculos } = useData();

  const [pipelineActive1, setPipelineActive1] = useState(true);
  const [pipelineActive2, setPipelineActive2] = useState(true);
  const [pipelineActive3, setPipelineActive3] = useState(false);

  const [logFilter, setLogFilter] = useState<'all' | 'errors' | 'orders' | 'system'>('all');
  const [pnlPeriod, setPnlPeriod] = useState<'2w' | '1m' | '3m'>('1m');

  const [settingsForm, setSettingsForm] = useState({
    limitValue: 'R$ 50.000,00',
    maxConsignment: 'R$ 250.000,00',
    maxDiscount: '-2.5%',
    orderType: 'Consignado',
    aiConfirmation: true,
    pushNotifications: false,
  });

  const totalCirurgias = cirurgias.length;
  const protocolosAbertos = protocolos.filter((p) => p.status === 'Em Análise' || p.status === 'Rascunho').length;
  const valorEstoqueTotal = produtos.reduce((acc, p) => acc + (p.saldo_total * p.valor_custo), 0);
  const faturamentoTotal = vendas.reduce((acc, v) => acc + v.valor_consumido, 0);

  const dataPnlBars = [
    { day: 'M22', valor: 8000, isProfit: true },
    { day: 'T23', valor: 14000, isProfit: true },
    { day: 'W24', valor: 28000, isProfit: true, isHigh: true },
    { day: 'T25', valor: 12000, isProfit: true },
    { day: 'F26', valor: 19000, isProfit: true },
    { day: 'M29', valor: 31000, isProfit: true },
    { day: 'T30', valor: 24000, isProfit: true, isHigh: true },
    { day: 'W01', valor: 15000, isProfit: true },
    { day: 'T02', valor: 22000, isProfit: true },
    { day: 'F03', valor: 38000, isProfit: true, isHigh: true },
    { day: 'M06', valor: -5000, isProfit: false },
    { day: 'T07', valor: 29000, isProfit: true },
    { day: 'W08', valor: 35000, isProfit: true },
    { day: 'Hoje', valor: 48210, isProfit: true, isHigh: true },
  ];

  const tasksList = [
    { name: 'Cirurgia Coluna Lumbar L4-L5', hospital: 'Hospital Israelita Albert Einstein', doctor: 'Dr. Roberto Silva', date: 'Hoje, 14:00', trigger: 'Emergência', status: 'Ativa' },
    { name: 'Artroplastia Total Quadril', hospital: 'Hospital Sírio-Libanês', doctor: 'Dra. Patricia Lima', date: 'Hoje, 16:30', trigger: 'Agendada', status: 'Em Análise' },
    { name: 'Fixação Posterior Cervical', hospital: 'HCor - Hospital do Coração', doctor: 'Dr. Fernando Dias', date: 'Amanhã, 08:00', trigger: 'Consignado', status: 'Ativa' },
    { name: 'Reconstrução de Joelho ACL', hospital: 'Hospital Oswaldo Cruz', doctor: 'Dr. Lucas Guimarães', date: 'Amanhã, 11:00', trigger: 'Agendada', status: 'Pendente' },
    { name: 'Implante de Stent Farmacológico', hospital: 'Hospital Beneficência Portuguesa', doctor: 'Dr. Sérgio Ramos', date: '09/08 09:30', trigger: 'Urgência', status: 'Pausada' },
  ];

  const activityLogs = [
    { time: '09:47:23', type: 'AUTORIZADO', msg: 'Cirurgia #104 Einstein R$ 18.924,00', status: 'FILLED', category: 'orders' },
    { time: '09:44:07', type: 'BAIXA', msg: 'Kit Medtronic Spine Lote #80123', status: 'FILLED', category: 'orders' },
    { time: '09:40:55', type: 'SISTEMA', msg: 'Políticas RLS PostgreSQL sincronizadas', status: 'OK', category: 'system' },
    { time: '09:38:19', type: 'COTAÇÃO', msg: 'Aprovada Cotação Unimed SP - R$ 8.750,00', status: 'FILLED', category: 'orders' },
    { time: '09:35:02', type: 'ALERTA', msg: 'Fila de vistorias de frota atingiu 60%', status: 'WARN', category: 'errors' },
    { time: '09:28:41', type: 'BAIXA', msg: 'Devolução de sobra kit consignado #88', status: 'FILLED', category: 'orders' },
  ];

  const filteredLogs = activityLogs.filter((log) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'errors') return log.category === 'errors';
    if (logFilter === 'orders') return log.category === 'orders';
    if (logFilter === 'system') return log.category === 'system';
    return true;
  });

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Visão Executiva & Performance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Monitoramento em tempo real do faturamento OPME, margem operacional e indicadores ERP
            </p>
          </div>
        </div>
      </div>

      {/* ==================== 1. TOP EXECUTIVE KPI CARDS (4 COLUMNS) ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* KPI 1: Total Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs hover:border-blue-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              TOTAL CIRURGIAS EXECUTADAS
            </span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-md">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                12.847
              </span>
              <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>+8.4% vs mês anterior</span>
              </p>
            </div>

            {/* Sparkline Visual */}
            <div className="w-16 h-7">
              <svg viewBox="0 0 100 40" className="w-full h-full text-blue-500 overflow-visible">
                <path
                  d="M0 30 Q 20 25, 40 18 T 80 12 T 100 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs hover:border-blue-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              FATURAMENTO OPME TOTAL
            </span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-md">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                R$ 4,28M
              </span>
              <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>+12.1% vs mês anterior</span>
              </p>
            </div>

            {/* Sparkline Visual */}
            <div className="w-16 h-7">
              <svg viewBox="0 0 100 40" className="w-full h-full text-emerald-500 overflow-visible">
                <path
                  d="M0 32 Q 25 28, 50 20 T 75 10 T 100 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 3: Active Workflows */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs hover:border-blue-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              MAPA CIRÚRGICO ATIVO
            </span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-md">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                34 <span className="text-xs font-bold text-slate-400">/ 40</span>
              </span>
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">85%</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full w-[85%]" />
            </div>
            <p className="text-[9px] text-slate-400 font-medium">Capacidade alocada em hospitais</p>
          </div>
        </div>

        {/* KPI 4: Approval Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs hover:border-blue-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              APROVAÇÃO CONVÊNIO
            </span>
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                93.8%
              </span>
              <p className="text-[10px] font-extrabold text-rose-500 flex items-center gap-0.5 mt-0.5">
                <ArrowDownRight className="w-3 h-3" />
                <span>-1.2% vs ontem</span>
              </p>
            </div>

            {/* Win/Loss Bar */}
            <div className="w-16 space-y-1">
              <div className="flex justify-between text-[9px] font-bold font-mono">
                <span className="text-emerald-500">93.8%</span>
                <span className="text-rose-400">6.2%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                <div className="bg-emerald-500 h-full w-[93.8%]" />
                <div className="bg-rose-500 h-full w-[6.2%]" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== 2. WORKFLOW PIPELINE & TASK AUTOMATION ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Left: Automation Pipeline (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black text-slate-900 dark:text-white">Workflow de Atendimento OPME</h2>
              <p className="text-[10px] text-slate-400">Status em tempo real das etapas de cirurgias no mapa</p>
            </div>
            <button
              onClick={() => setActiveTab('mapa')}
              className="px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <span>Ver Mapa Completo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Connected Step Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
            
            {/* Step 1 */}
            <div className="p-2.5 rounded-md bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center">
                  1
                </span>
                <span className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">
                  RECEPÇÃO
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Solicitado</p>
                <p className="text-[9px] text-slate-500">Em Análise • • •</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-2.5 rounded-md bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-extrabold text-[9px] flex items-center justify-center">
                  2
                </span>
                <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  AUTORIZADO
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Aprovação Convênio</p>
                <p className="text-[9px] text-emerald-600 font-medium">8 Concluídas (2.1s)</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-2.5 rounded-md bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white font-extrabold text-[9px] flex items-center justify-center">
                  3
                </span>
                <span className="text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400">
                  ESTOQUE
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Separação Consignado</p>
                <p className="text-[9px] text-amber-600 font-medium">75% Separado</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-2.5 rounded-md bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-extrabold text-[9px] flex items-center justify-center">
                  4
                </span>
                <span className="text-[9px] font-bold uppercase text-rose-600 dark:text-rose-400">
                  ENTREGA
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Cirurgia & Baixa</p>
                <p className="text-[9px] text-slate-500">Fila de Execução</p>
              </div>
            </div>

          </div>

          {/* Secondary Pipelines Toggles */}
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              PIPELINES SECUNDÁRIAS DE SUPORTE
            </span>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              
              <button
                onClick={() => setPipelineActive1(!pipelineActive1)}
                className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  pipelineActive1
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Protocolo Coluna Vertebral</span>
                <span className="text-[8px] font-mono font-extrabold uppercase px-1 py-0.2 rounded bg-blue-200/50 dark:bg-blue-900/50">
                  {pipelineActive1 ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => setPipelineActive2(!pipelineActive2)}
                className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  pipelineActive2
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Kits Consignados Trauma</span>
                <span className="text-[8px] font-mono font-extrabold uppercase px-1 py-0.2 rounded bg-blue-200/50 dark:bg-blue-900/50">
                  {pipelineActive2 ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => setPipelineActive3(!pipelineActive3)}
                className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  pipelineActive3
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Rastreabilidade ANVISA</span>
                <span className="text-[8px] font-mono font-extrabold uppercase px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700">
                  {pipelineActive3 ? 'ON' : 'OFF'}
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* Right: Task Automation Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black text-slate-900 dark:text-white">Próximas Cirurgias no Mapa</h2>
              <p className="text-[10px] text-slate-400">Procedimentos agendados para hoje e amanhã</p>
            </div>
            <button
              onClick={() => setActiveTab('mapa')}
              className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-xs"
              title="Nova Cirurgia"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Minimal Task Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Cirurgia / Hospital</th>
                  <th className="pb-2">Data</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
                {tasksList.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-100">
                      {t.name}
                      <p className="text-[10px] font-normal text-slate-400 truncate">{t.hospital}</p>
                    </td>
                    <td className="py-2.5 font-mono text-slate-500 text-[10px]">
                      {t.date}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'Ativa'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : t.status === 'Em Análise'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
            <button
              onClick={() => setActiveTab('mapa')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Ver todas as 34 cirurgias</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ==================== 3. PERFORMANCE STATS, LOGS & SETTINGS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Col 1: Performance Stats (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black text-slate-900 dark:text-white">Faturamento & P&L Cirúrgico</h2>
              <p className="text-[10px] text-slate-400">Desempenho financeiro diário dos últimos 14 dias</p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-[9px] font-bold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setPnlPeriod('2w')}
                className={`px-1.5 py-0.5 rounded ${pnlPeriod === '2w' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : ''}`}
              >
                2 Semanas
              </button>
              <button
                onClick={() => setPnlPeriod('1m')}
                className={`px-1.5 py-0.5 rounded ${pnlPeriod === '1m' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : ''}`}
              >
                1 Mês
              </button>
              <button
                onClick={() => setPnlPeriod('3m')}
                className={`px-1.5 py-0.5 rounded ${pnlPeriod === '3m' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : ''}`}
              >
                Trimestre
              </button>
            </div>
          </div>

          {/* Key PnL Stats */}
          <div className="grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total P&L</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+R$ 284.720</p>
              <p className="text-[8px] text-emerald-600 font-extrabold">▲ 6.6%</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Média Diária</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">R$ 20.337</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Maior Dia</p>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400">R$ 48.210</p>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPnlBars} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `k`} />
                <Tooltip formatter={(val: any) => [formatBRL(Number(val)), 'Faturamento']} />
                <Bar dataKey="valor" radius={[2, 2, 0, 0]}>
                  {dataPnlBars.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        !entry.isProfit
                          ? '#f43f5e'
                          : entry.isHigh
                          ? '#2563eb'
                          : '#10b981'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ratios row */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[9px] text-slate-400">Dias Alta</p>
              <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">10 / 14</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400">Margem</p>
              <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">61.2%</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400">Devoluções</p>
              <p className="text-[11px] font-black text-rose-500">-3.8%</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400">Giro Lotes</p>
              <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">18.2x</p>
            </div>
          </div>
        </div>

        {/* Col 2: Activity Logs (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black text-slate-900 dark:text-white">Trilha de Eventos</h2>
              <p className="text-[10px] text-slate-400">Eventos em tempo real do ERP</p>
            </div>

            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-[8px] font-bold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-1 py-0.5 rounded ${logFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : ''}`}
              >
                Todos
              </button>
              <button
                onClick={() => setLogFilter('errors')}
                className={`px-1 py-0.5 rounded ${logFilter === 'errors' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : ''}`}
              >
                Erros
              </button>
              <button
                onClick={() => setLogFilter('orders')}
                className={`px-1 py-0.5 rounded ${logFilter === 'orders' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : ''}`}
              >
                Pedidos
              </button>
            </div>
          </div>

          {/* Activity Log List */}
          <div className="space-y-1.5 text-[10px] font-mono flex-1 overflow-y-auto max-h-[190px]">
            {filteredLogs.map((log, i) => (
              <div key={i} className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-1.5">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[9px]">{log.time}</span>
                    <span className={`px-1 rounded text-[8px] font-bold ${
                      log.type === 'AUTORIZADO' ? 'text-emerald-600 bg-emerald-100' :
                      log.type === 'BAIXA' ? 'text-rose-600 bg-rose-100' :
                      log.type === 'ALERTA' ? 'text-amber-600 bg-amber-100' : 'text-blue-600 bg-blue-100'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-700 dark:text-slate-300 truncate font-sans">{log.msg}</p>
                </div>

                <span className="text-[8px] font-extrabold text-slate-400 bg-slate-200 dark:bg-slate-700 px-1 py-0.2 rounded shrink-0">
                  {log.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <button
              onClick={() => setActiveTab('relatorios')}
              className="text-slate-400 hover:text-slate-600 text-[9px]"
            >
              Exportar logs →
            </button>
            <button
              onClick={() => setActiveTab('auditoria')}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-[9px]"
            >
              Ver auditoria →
            </button>
          </div>
        </div>

        {/* Col 3: Settings Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-900 dark:text-white">Controles & Limites OPME</h2>
            <p className="text-[10px] text-slate-400">Configurações globais de risco e autorizações</p>
          </div>

          <div className="space-y-2.5 text-xs">
            
            {/* Risk Control Inputs */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                CONTROLES DE RISCO
              </span>

              <div>
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                  Teto de Autorização sem Análise
                </label>
                <input
                  type="text"
                  value={settingsForm.limitValue}
                  onChange={(e) => setSettingsForm({ ...settingsForm, limitValue: e.target.value })}
                  className="w-full mt-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                  Teto de Material Consignado
                </label>
                <input
                  type="text"
                  value={settingsForm.maxConsignment}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxConsignment: e.target.value })}
                  className="w-full mt-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                  Desconto Comercial Máximo
                </label>
                <input
                  type="text"
                  value={settingsForm.maxDiscount}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxDiscount: e.target.value })}
                  className="w-full mt-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-mono text-rose-500 font-bold"
                />
              </div>
            </div>

            {/* Execution Toggles */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                EXECUÇÃO & AUTOMAÇÕES
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Aprovação Inteligente IA</p>
                  <p className="text-[9px] text-slate-400">Análise automática de convênio</p>
                </div>
                <button
                  onClick={() => setSettingsForm({ ...settingsForm, aiConfirmation: !settingsForm.aiConfirmation })}
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                    settingsForm.aiConfirmation ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${settingsForm.aiConfirmation ? 'translate-x-4' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Notificações de Frota</p>
                  <p className="text-[9px] text-slate-400">Alertar avarias pós-vistoria</p>
                </div>
                <button
                  onClick={() => setSettingsForm({ ...settingsForm, pushNotifications: !settingsForm.pushNotifications })}
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                    settingsForm.pushNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${settingsForm.pushNotifications ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1.5">
              <button className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800">
                Cancelar
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white font-bold text-[11px] rounded-md shadow hover:bg-blue-700 transition-colors">
                Salvar Alterações
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};


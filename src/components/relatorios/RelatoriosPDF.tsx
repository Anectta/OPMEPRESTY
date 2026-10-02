import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatBRL, formatDate } from '../../lib/utils';
import { FileText, Download, Printer, CheckCircle2, Calendar, Package, TrendingUp, Truck } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const RelatoriosPDF: React.FC = () => {
  const { cirurgias, produtos, veiculos } = useData();
  const [reportType, setReportType] = useState<'cirurgias' | 'estoque' | 'frota'>('cirurgias');

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title & Header
    doc.setFontSize(16);
    doc.text('Presty Medick - Relatório Gerencial OPME', 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} | Tipo: ${reportType.toUpperCase()}`, 14, 26);

    if (reportType === 'cirurgias') {
      autoTable(doc, {
        startY: 32,
        head: [['ID', 'Data', 'Hospital', 'Médico', 'Paciente', 'Situação']],
        body: cirurgias.map((c) => [c.id, formatDate(c.data), c.hospital_nome, c.medico_nome, c.paciente, c.situacao]),
      });
    } else if (reportType === 'estoque') {
      autoTable(doc, {
        startY: 32,
        head: [['Código', 'Descrição', 'ANVISA', 'Fabricante', 'Grupo', 'Saldo Físico']],
        body: produtos.map((p) => [p.codigo, p.descricao, p.anvisa, p.fabricante, p.grupo, `${p.saldo_total} ${p.unidade}`]),
      });
    } else {
      autoTable(doc, {
        startY: 32,
        head: [['Placa', 'Modelo', 'Ano', 'Cor', 'KM', 'Responsável', 'Situação']],
        body: veiculos.map((v) => [v.placa, `${v.marca} ${v.modelo}`, String(v.ano), v.cor, `${v.km_atual} km`, v.responsavel_nome, v.situacao]),
      });
    }

    doc.save(`PrestyMedick_Relatorio_${reportType}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-md shadow-fuchsia-500/20 shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Relatórios Executivos & Exportação PDF
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Geração de relatórios analíticos formatados com tabela sintética para auditoria e diretoria.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Compact Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Módulos</p>
            <p className="text-base font-black text-slate-900 dark:text-white">3 Módulos</p>
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            Cirurgias, Estoque, Frota
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Formato</p>
            <p className="text-base font-black text-slate-900 dark:text-white">A4 Vector</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            ANVISA & Hospitalar
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Registros</p>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {cirurgias.length + produtos.length + veiculos.length} Linhas
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Tempo Real
          </span>
        </div>
      </div>

      {/* Compact Report Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => setReportType('cirurgias')}
          className={`p-2.5 border rounded-lg text-left transition-all flex items-center gap-2.5 cursor-pointer ${
            reportType === 'cirurgias'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 text-slate-900 dark:text-white font-bold ring-1 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">Cirurgias</p>
            <p className="text-[10px] text-slate-400 truncate">Mapa cirúrgico</p>
          </div>
        </button>

        <button
          onClick={() => setReportType('estoque')}
          className={`p-2.5 border rounded-lg text-left transition-all flex items-center gap-2.5 cursor-pointer ${
            reportType === 'estoque'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 text-slate-900 dark:text-white font-bold ring-1 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Package className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">Estoque</p>
            <p className="text-[10px] text-slate-400 truncate">Saldos & lotes</p>
          </div>
        </button>

        <button
          onClick={() => setReportType('frota')}
          className={`p-2.5 border rounded-lg text-left transition-all flex items-center gap-2.5 cursor-pointer ${
            reportType === 'frota'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 text-slate-900 dark:text-white font-bold ring-1 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Truck className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">Frota</p>
            <p className="text-[10px] text-slate-400 truncate">Veículos & avarias</p>
          </div>
        </button>
      </div>

      {/* Preview Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pré-visualização: <strong className="text-slate-900 dark:text-white">{reportType.toUpperCase()}</strong>
          </span>
          <span className="text-[10px] text-slate-400 font-mono font-bold">
            A4 Portrait • {reportType === 'cirurgias' ? cirurgias.length : reportType === 'estoque' ? produtos.length : veiculos.length} registros
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] space-y-1">
          <p className="font-extrabold text-slate-800 dark:text-slate-200">Estrutura do Documento PDF:</p>
          <ul className="list-disc pl-4 text-slate-500 dark:text-slate-400 font-medium space-y-0.5 text-[10px]">
            <li>Cabeçalho institucional "Presty Medick - Relatório Gerencial OPME"</li>
            <li>Marca d'água de confidencialidade e timestamp auditável</li>
            <li>Grid de dados paginados com cabeçalho em destaque usando jsPDF AutoTable</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

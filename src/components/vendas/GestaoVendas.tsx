import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { formatBRL, formatDate, getStatusBadge } from '../../lib/utils';
import { TrendingUp, DollarSign, Target, Award, CheckCircle2, Search, Filter } from 'lucide-react';

export const GestaoVendas: React.FC = () => {
  const { vendas } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVendas = vendas.filter(
    (v) =>
      v.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vendedor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cliente_hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFaturado = vendas.reduce((acc, v) => acc + v.valor_consumido, 0);
  const comissaoEstimada = totalFaturado * 0.055; // 5.5% média

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestão de Vendas & Comissões OPME
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Pedidos faturados, apuração de consumo x devolução, margens de contribuição e comissões de representantes.
            </p>
          </div>
        </div>
      </div>

      {/* Sales KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Faturamento Consumido</span>
          <p className="text-lg font-black text-slate-900 dark:text-white">{formatBRL(totalFaturado)}</p>
          <p className="text-[10px] font-bold text-emerald-600">Margem Líquida Média: 61.2%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Comissões a Pagar</span>
          <p className="text-lg font-black text-slate-900 dark:text-white">{formatBRL(comissaoEstimada)}</p>
          <p className="text-[10px] font-bold text-blue-600">3 Representantes Ativos</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Atingimento de Meta Global</span>
          <p className="text-lg font-black text-slate-900 dark:text-white">94.8%</p>
          <p className="text-[10px] font-bold text-slate-400">Meta Mensal: R$ 500.000,00</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por pedido, cliente hospital, vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse min-w-[650px] text-[11px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                <th className="p-2.5 pl-3.5">Nº Pedido / Data</th>
                <th className="p-2.5">Hospital / Cliente</th>
                <th className="p-2.5">Médico / Paciente</th>
                <th className="p-2.5">Vendedor</th>
                <th className="p-2.5">Valor Consumido</th>
                <th className="p-2.5 text-right pr-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {filteredVendas.map((v) => {
                const badge = getStatusBadge(v.status);
                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5 pl-3.5 font-mono">
                      <span className="font-extrabold text-slate-900 dark:text-white">{v.numero}</span>
                      <p className="text-[9px] text-slate-400 font-medium">{formatDate(v.data)}</p>
                    </td>

                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                      {v.cliente_hospital}
                      <p className="text-[9px] text-slate-400 font-medium">{v.convenio_nome}</p>
                    </td>

                    <td className="p-2.5">
                      <p className="font-bold text-slate-900 dark:text-white">{v.paciente}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{v.medico_nome}</p>
                    </td>

                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{v.vendedor_nome}</td>

                    <td className="p-2.5 font-mono font-black text-slate-900 dark:text-white">{formatBRL(v.valor_consumido)}</td>

                    <td className="p-2.5 text-right pr-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

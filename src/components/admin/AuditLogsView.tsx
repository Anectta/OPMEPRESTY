import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../lib/utils';
import { ShieldAlert, Search, Filter, AlertTriangle, ShieldCheck, Clock, FileCode, CheckCircle2 } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('todas');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'todas' || log.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-md shadow-rose-500/20 shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Trilha de Auditoria (Audit Logs)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Registro imutável de todas as operações de segurança, criação de cirurgias, baixas de estoque e vistorias.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">LOGS REGISTRADOS</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{auditLogs.length} Eventos</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Sessão Ativa Protegida</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">EVENTOS DE CRITICAL/HIGH</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {auditLogs.filter(l => l.severity === 'high' || l.severity === 'critical').length}
          </p>
          <p className="text-[10px] font-bold text-blue-600 mt-0.5">Alertas de Segurança</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">CONFORMIDADE RPB</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">100% Auditado</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Assinatura SHA-256 de Sessão</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ação, usuário ou recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-bold">Severidade:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="todas">Todas as Severidades</option>
            <option value="low">Baixa (Low)</option>
            <option value="medium">Média (Medium)</option>
            <option value="high">Alta (High)</option>
            <option value="critical">Crítica (Critical)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse min-w-[700px] text-[11px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                <th className="p-2.5 pl-3.5">Data / Hora</th>
                <th className="p-2.5">Ação</th>
                <th className="p-2.5">Usuário / Papel</th>
                <th className="p-2.5">Módulo / Recurso</th>
                <th className="p-2.5 pr-3.5">Severidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors font-mono">
                  <td className="p-2.5 pl-3.5 text-slate-400 text-[10px] font-bold">
                    {formatDateTime(log.created_at)}
                  </td>

                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </td>

                  <td className="p-2.5">
                    <p className="font-extrabold text-slate-900 dark:text-white">{log.user_email}</p>
                    <span className="text-[8px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                      {log.user_role}
                    </span>
                  </td>

                  <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200">
                    {log.resource_type} {log.resource_id ? `(#${log.resource_id})` : ''}
                  </td>

                  <td className="p-2.5 pr-3.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      log.severity === 'high' || log.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                        : log.severity === 'medium'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../lib/utils';
import { AuditLog } from '../../types';
import {
  ShieldAlert, Search, Filter, AlertTriangle, ShieldCheck, Clock,
  FileCode, CheckCircle2, User, Eye, X, ArrowRight, Download, Activity,
  Database, RefreshCw
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('todas');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'acessos' | 'autorizacoes' | 'cirurgias' | 'cadastros'>('todos');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLog | null>(null);

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'ACESSO_MODULO':
        return { label: 'Acesso a Módulo', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'AUTORIZAR_CIRURGIA':
        return { label: 'Autorização de Cirurgia', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'NEGAR_AUTORIZACAO':
        return { label: 'Autorização Negada/Cancelada', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'CREATE_CIRURGIA':
        return { label: 'Agendamento de Cirurgia', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'UPDATE_CIRURGIA_SITUACAO':
        return { label: 'Alteração de Status Cirurgia', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'CREATE_PROTOCOLO':
        return { label: 'Criação de Protocolo OPME', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'SOLICITAR_AUTORIZACAO':
        return { label: 'Solicitação de Autorização', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'USER_LOGIN_LOCAL':
      case 'USER_LOGIN_SUPABASE':
      case 'USER_LOGIN_MASTER_OVERRIDE':
        return { label: 'Login de Usuário', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'USER_LOGOUT':
        return { label: 'Logout de Usuário', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'SWITCH_ROLE':
        return { label: 'Alternância de Papel (Role)', color: 'bg-violet-50 text-violet-700 border-violet-200' };
      default:
        if (action.startsWith('CREATE_')) return { label: `Criação: ${action.replace('CREATE_', '')}`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        if (action.startsWith('UPDATE_')) return { label: `Edição: ${action.replace('UPDATE_', '')}`, color: 'bg-amber-50 text-amber-700 border-amber-200' };
        if (action.startsWith('DELETE_')) return { label: `Exclusão: ${action.replace('DELETE_', '')}`, color: 'bg-rose-50 text-rose-700 border-rose-200' };
        return { label: action, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const userName = log.user_nome || log.usuario_nome || '';
    const userEmail = log.user_email || log.usuario_email || '';
    const resource = log.resource_type || log.modulo || '';
    const action = log.action || log.acao || '';
    const resourceId = log.resource_id || log.registro_id || '';

    const matchesSearch =
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resourceId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'todas' || log.severity === selectedSeverity;

    let matchesCategory = true;
    if (selectedCategory === 'acessos') {
      matchesCategory = action === 'ACESSO_MODULO' || action.includes('LOGIN') || action.includes('LOGOUT');
    } else if (selectedCategory === 'autorizacoes') {
      matchesCategory = action.includes('AUTORIZAR') || action.includes('AUTORIZACAO');
    } else if (selectedCategory === 'cirurgias') {
      matchesCategory = action.includes('CIRURGIA') || action.includes('PROTOCOLO');
    } else if (selectedCategory === 'cadastros') {
      matchesCategory = resource.toLowerCase().includes('cadastro') || action.includes('HOSPITAL') || action.includes('MEDICO') || action.includes('VENDEDOR');
    }

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const exportLogsAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trilha_auditoria_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-md shadow-rose-500/20 shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Trilha de Auditoria & Logs de Acesso
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Rastreado
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Registro completo mostrando qual usuário efetuou o acesso e todas as modificações detalhadas.
            </p>
          </div>
        </div>

        <button
          onClick={exportLogsAsJSON}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar Trilha (.JSON)
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TOTAL DE REGISTROS</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{auditLogs.length}</p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Sessão Auditada e Gravada</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">ACESSOS A MÓDULOS</p>
          <p className="text-xl font-black text-blue-600 mt-0.5">
            {auditLogs.filter(l => l.action === 'ACESSO_MODULO' || l.action.includes('LOGIN')).length}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Navegação e Telas</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">AUTORIZAÇÕES DE CIRURGIAS</p>
          <p className="text-xl font-black text-emerald-600 mt-0.5">
            {auditLogs.filter(l => l.action.includes('AUTORIZAR') || l.action.includes('AUTORIZACAO')).length}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Aprovações e Cancelamentos</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">MODIFICAÇÕES OPERACIONAIS</p>
          <p className="text-xl font-black text-amber-600 mt-0.5">
            {auditLogs.filter(l => l.action.startsWith('UPDATE_') || l.action.startsWith('CREATE_')).length}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Cirurgias, Protocolos e Cadastros</p>
        </div>
      </div>

      {/* Category Tabs & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'todos' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
            }`}
          >
            Todos os Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setSelectedCategory('acessos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'acessos' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
            }`}
          >
            Acessos a Módulos & Login
          </button>
          <button
            onClick={() => setSelectedCategory('autorizacoes')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'autorizacoes' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
            }`}
          >
            Autorizações de Cirurgias
          </button>
          <button
            onClick={() => setSelectedCategory('cirurgias')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'cirurgias' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
            }`}
          >
            Cirurgias & Protocolos
          </button>
          <button
            onClick={() => setSelectedCategory('cadastros')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'cadastros' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
            }`}
          >
            Cadastros Auxiliares
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between pt-1">
          <div className="relative w-full sm:w-96">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuário, ação, e-mail, IT ou recurso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Severidade:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="todas">Todas as Severidades</option>
              <option value="low">Baixa (Low)</option>
              <option value="medium">Média (Medium)</option>
              <option value="high">Alta (High)</option>
              <option value="critical">Crítica (Critical)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse min-w-[850px] text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[10px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 pl-4">Data / Hora</th>
                <th className="p-3">Usuário Responsável</th>
                <th className="p-3">Ação Realizada</th>
                <th className="p-3">Módulo / Registro</th>
                <th className="p-3">Modificações / Dados</th>
                <th className="p-3 pr-4 text-right">Severidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    Nenhum registro de log encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionMeta = getActionLabel(log.action || log.acao || '');
                  const userName = log.user_nome || log.usuario_nome || 'Usuário do Sistema';
                  const userEmail = log.user_email || log.usuario_email || '—';
                  const userRole = log.user_role || log.usuario_role || 'user';
                  const resourceName = log.resource_type || log.modulo || 'Sistema';
                  const resourceId = log.resource_id || log.registro_id || '';
                  const hasChanges = log.changes && Object.keys(log.changes).length > 0;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 pl-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>

                      {/* Usuário que fez o acesso ou modificação */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                            <span className="inline-block mt-0.5 text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black">
                              {userRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Ação */}
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${actionMeta.color}`}>
                          {actionMeta.label}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{log.action}</p>
                      </td>

                      {/* Módulo e Recurso */}
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        <div className="font-semibold text-slate-900 dark:text-white">{resourceName}</div>
                        {resourceId && (
                          <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                            Ref: {resourceId}
                          </span>
                        )}
                      </td>

                      {/* Modificações / Detalhes */}
                      <td className="p-3">
                        {hasChanges ? (
                          <button
                            onClick={() => setSelectedLogForDetails(log)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Modificações ({Object.keys(log.changes).length})
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sem payload</span>
                        )}
                      </td>

                      {/* Severidade */}
                      <td className="p-3 pr-4 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          log.severity === 'high' || log.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                            : log.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {log.severity || 'LOW'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes das Modificações */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Detalhes das Modificações & Acesso
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID do Log: {selectedLogForDetails.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Resumo do Autor */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Usuário</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedLogForDetails.user_nome || selectedLogForDetails.usuario_nome || 'Usuário'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">E-mail</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 break-all text-[11px]">
                    {selectedLogForDetails.user_email || selectedLogForDetails.usuario_email || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Papel / Role</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">
                    {selectedLogForDetails.user_role || selectedLogForDetails.usuario_role || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Data / Hora</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                    {formatDateTime(selectedLogForDetails.created_at)}
                  </span>
                </div>
              </div>

              {/* Informações da Operação */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Ação Registrada:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedLogForDetails.action}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Módulo Afetado:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedLogForDetails.resource_type || selectedLogForDetails.modulo}
                  </span>
                </div>
                {selectedLogForDetails.resource_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Identificador / IT:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {selectedLogForDetails.resource_id}
                    </span>
                  </div>
                )}
              </div>

              {/* Payload de Modificações */}
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Valores e Parâmetros Modificados (Changes):</span>
                  <span className="text-[10px] font-normal text-slate-400">JSON Payload</span>
                </p>
                <div className="bg-slate-950 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedLogForDetails.changes || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, XCircle, Clock, Search, ClipboardCheck,
  Plus, ChevronRight, AlertCircle, FileText, Calendar, User,
  Building2, Stethoscope, UserCheck, X, Save, ShieldAlert, ShieldCheck
} from 'lucide-react';
import type { Autorizacao, StatusAutorizacao } from '../../types';
import { getStatusAutorizacaoConfig, formatDate } from '../../lib/utils';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { getActiveVendedor, canUserAuthorize, isProtocoloOfVendedor } from '../../lib/vendedorHelper';

const STATUS_ICONS: Record<StatusAutorizacao, React.ReactNode> = {
  PENDENTE: <Clock className="w-4 h-4 text-amber-600" />,
  AUTORIZADA: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  NAO_AUTORIZADA: <XCircle className="w-4 h-4 text-red-600" />,
  CANCELADA: <XCircle className="w-4 h-4 text-gray-400" />,
};

interface ModalAutorizacaoProps {
  autorizacao: Autorizacao;
  userNome?: string;
  onSalvar: (dados: Partial<Autorizacao>) => void;
  onFechar: () => void;
}

const ModalRegistrarAutorizacao: React.FC<ModalAutorizacaoProps> = ({ autorizacao, userNome, onSalvar, onFechar }) => {
  const [form, setForm] = useState({
    numero_autorizacao: autorizacao.numero_autorizacao || '',
    data_autorizacao: new Date().toISOString().split('T')[0],
    data_validade: '',
    responsavel_autorizacao: autorizacao.responsavel_autorizacao || userNome || '',
    observacoes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar({
      numero_autorizacao: form.numero_autorizacao.trim() || undefined,
      data_autorizacao: form.data_autorizacao,
      data_validade: form.data_validade || undefined,
      responsavel_autorizacao: form.responsavel_autorizacao || userNome || 'Responsável',
      observacoes: form.observacoes || undefined,
      status: 'AUTORIZADA'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Registrar Autorização da Cirurgia</h3>
              <p className="text-xs text-gray-500 font-medium">Protocolo IT {autorizacao.protocolo?.numero_it}</p>
            </div>
          </div>
          <button onClick={onFechar} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Paciente:</span>
              <span className="font-bold text-gray-900">{autorizacao.protocolo?.paciente}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Hospital:</span>
              <span className="font-semibold text-gray-700">{autorizacao.protocolo?.hospital_nome}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Médico:</span>
              <span className="text-gray-700">{autorizacao.protocolo?.medico_nome}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
              <span className="text-gray-500">Vendedor Responsável:</span>
              <span className="font-bold text-blue-700">{autorizacao.protocolo?.vendedor_nome || 'Não definido'}</span>
            </div>
          </div>

          {/* Notificação sem obrigatoriedade de número */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Liberação Imediata da Cirurgia
            </p>
            <p className="text-emerald-700 leading-relaxed text-[11px]">
              A autorização é efetuada diretamente pelo Administrador ou pelo Vendedor responsável. Não é obrigatório possuir código/número de autorização prévio.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Data da Autorização <span className="text-emerald-600">*</span>
              </label>
              <input
                type="date"
                required
                value={form.data_autorizacao}
                onChange={(e) => setForm(p => ({ ...p, data_autorizacao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Validade (Opcional)</label>
              <input
                type="date"
                value={form.data_validade}
                onChange={(e) => setForm(p => ({ ...p, data_validade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Responsável / Autorizador</label>
            <input
              type="text"
              placeholder="Ex: Nome do Vendedor ou Administrador"
              value={form.responsavel_autorizacao}
              onChange={(e) => setForm(p => ({ ...p, responsavel_autorizacao: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Observações / Justificativa da Liberação
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Cirurgia autorizada para realização na data prevista..."
              value={form.observacoes}
              onChange={(e) => setForm(p => ({ ...p, observacoes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Confirmar Autorização
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AutorizacoesOPME: React.FC = () => {
  const { protocolos, vendedores, updateProtocolo } = useData();
  const { user, role, logAuditEvent } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [modalAutorizacao, setModalAutorizacao] = useState<Autorizacao | null>(null);
  const [displayCount, setDisplayCount] = useState(50);

  // Vendedor ativo para escopo de visualização e permissão
  const activeVendedor = useMemo(() => getActiveVendedor(user, vendedores), [user, vendedores]);
  const isVendedorScope = role === 'vendedor' || (role as string) === 'comercial';

  // Regra Master: Vendedor SOMENTE pode ver a sua respectiva cirurgia/protocolo
  const scopedProtocolos = useMemo(() => {
    if (!isVendedorScope) {
      return protocolos;
    }
    return protocolos.filter(p => isProtocoloOfVendedor(p, activeVendedor));
  }, [protocolos, isVendedorScope, activeVendedor]);

  const autorizacoes: Autorizacao[] = useMemo(() => {
    return scopedProtocolos.map(p => ({
      id: `aut_${p.numero_it}`,
      protocolo_id: p.id,
      numero_autorizacao: p.autorizacao?.numero_autorizacao || (p.status === 'AUTORIZADO' ? `AUT-${p.numero_it}` : undefined),
      status: (p.status === 'AUTORIZADO' ? 'AUTORIZADA' : p.status === 'CANCELADO' ? 'NAO_AUTORIZADA' : 'PENDENTE') as StatusAutorizacao,
      data_autorizacao: p.autorizacao?.data_autorizacao || (p.status === 'AUTORIZADO' ? p.data_protocolo : undefined),
      data_validade: p.autorizacao?.data_validade,
      responsavel_autorizacao: p.autorizacao?.responsavel_autorizacao || p.convenio_nome || 'Convênio',
      observacoes: p.observacoes,
      created_at: p.created_at,
      protocolo: p,
    }));
  }, [scopedProtocolos]);

  const pendentes = useMemo(() => autorizacoes.filter(a => a.status === 'PENDENTE').length, [autorizacoes]);

  const filtered = useMemo(() => {
    return autorizacoes.filter(a => {
      const matchSearch = !searchTerm || [
        a.protocolo?.numero_it,
        a.protocolo?.paciente,
        a.protocolo?.hospital_nome,
        a.protocolo?.medico_nome,
        a.protocolo?.vendedor_nome,
      ].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = selectedStatus === 'todos' || a.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [autorizacoes, searchTerm, selectedStatus]);

  const displayedAutorizacoes = useMemo(() => {
    return filtered.slice(0, displayCount);
  }, [filtered, displayCount]);

  // Regra Master: Quem pode autorizar são os administradores e os vendedores com as suas respectivas cirurgias
  const handleAutorizar = async (dados: Partial<Autorizacao>) => {
    if (modalAutorizacao?.protocolo) {
      const prot = modalAutorizacao.protocolo;

      if (!canUserAuthorize(role, prot, activeVendedor)) {
        alert('Acesso Negado: Um vendedor não pode autorizar a cirurgia de outro vendedor.');
        return;
      }

      await updateProtocolo(prot.id, {
        status: 'AUTORIZADO',
        autorizacao: {
          id: modalAutorizacao.id,
          protocolo_id: prot.id,
          status: 'AUTORIZADA',
          numero_autorizacao: dados.numero_autorizacao || `AUT-${prot.numero_it}`,
          data_autorizacao: dados.data_autorizacao || new Date().toISOString().split('T')[0],
          data_validade: dados.data_validade,
          responsavel_autorizacao: dados.responsavel_autorizacao || user?.nome || 'Vendedor Autorizador',
          observacoes: dados.observacoes,
          created_at: new Date().toISOString()
        }
      });

      // Registro estrito na Trilha de Auditoria
      await logAuditEvent(
        'AUTORIZAR_CIRURGIA',
        'Autorizações',
        prot.numero_it,
        {
          numero_it: prot.numero_it,
          paciente: prot.paciente,
          hospital: prot.hospital_nome,
          medico: prot.medico_nome,
          vendedor_responsavel: prot.vendedor_nome,
          autorizado_por: user?.nome,
          usuario_email: user?.email,
          papel_autorizador: role,
          data_autorizacao: dados.data_autorizacao,
          data_validade: dados.data_validade,
          observacoes: dados.observacoes,
          status_anterior: 'PENDENTE',
          novo_status: 'AUTORIZADA'
        },
        'high'
      );
    }
    setModalAutorizacao(null);
  };

  const handleNegar = async (id: string) => {
    const aut = autorizacoes.find(a => a.id === id);
    if (aut?.protocolo) {
      const prot = aut.protocolo;

      if (!canUserAuthorize(role, prot, activeVendedor)) {
        alert('Acesso Negado: Um vendedor não pode cancelar/negar a cirurgia de outro vendedor.');
        return;
      }

      if (confirm(`Confirmar que a cirurgia do protocolo IT ${prot.numero_it} (${prot.paciente}) NÃO FOI AUTORIZADA?`)) {
        await updateProtocolo(prot.id, {
          status: 'CANCELADO'
        });

        await logAuditEvent(
          'NEGAR_AUTORIZACAO',
          'Autorizações',
          prot.numero_it,
          {
            numero_it: prot.numero_it,
            paciente: prot.paciente,
            vendedor_responsavel: prot.vendedor_nome,
            negado_por: user?.nome,
            usuario_email: user?.email,
            papel_autorizador: role,
            status_anterior: aut.status,
            novo_status: 'NAO_AUTORIZADA'
          },
          'high'
        );
      }
    }
  };

  const STATUS_OPTS: Array<{ value: string; label: string }> = [
    { value: 'todos', label: 'Todos' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'AUTORIZADA', label: 'Autorizada' },
    { value: 'NAO_AUTORIZADA', label: 'Não Autorizada' },
    { value: 'CANCELADA', label: 'Cancelada' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Controle de Escopo por Perfil */}
      {isVendedorScope && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-2">
                Visão Restrita por Vendedor
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-[10px] uppercase font-black tracking-wider text-amber-900">
                  Somente Suas Cirurgias
                </span>
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Você está autenticado como <strong>{user?.nome}</strong> ({activeVendedor?.nome || 'Representante'}). Você só visualiza e autoriza as cirurgias sob sua responsabilidade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Autorizações OPME</h1>
            {pendentes > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full animate-pulse">
                {pendentes} pendente{pendentes > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Controle e liberação de cirurgias — Administradores e Vendedores responsáveis
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Perfil: {role === 'admin' ? 'Administrador Geral' : isVendedorScope ? `Vendedor (${activeVendedor?.nome || user?.nome})` : role}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por IT, paciente, hospital, vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                selectedStatus === opt.value
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 p-8">
          <AlertCircle className="w-12 h-12 mb-4 opacity-30 text-gray-400" />
          <p className="font-semibold text-gray-700">Nenhuma autorização encontrada</p>
          <p className="text-sm mt-1 text-gray-500">
            {isVendedorScope
              ? 'Não há cirurgias vinculadas ao seu usuário neste filtro.'
              : 'Ajuste os filtros para visualizar as autorizações.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedAutorizacoes.map((auth) => {
            const statusCfg = getStatusAutorizacaoConfig(auth.status);
            const userCanAuth = canUserAuthorize(role, auth.protocolo, activeVendedor);

            return (
              <div
                key={auth.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-50 rounded-xl shrink-0 mt-0.5">
                      {STATUS_ICONS[auth.status]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-gray-900">IT {auth.protocolo?.numero_it}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusCfg.badgeClass}`}>
                          {statusCfg.label}
                        </span>
                        {auth.numero_autorizacao && (
                          <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                            {auth.numero_autorizacao}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-bold">{auth.protocolo?.paciente}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            {auth.protocolo?.hospital_nome}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                            {auth.protocolo?.medico_nome}
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                            Vendedor: {auth.protocolo?.vendedor_nome || 'Não vinculado'}
                          </span>
                        </div>
                        {auth.data_autorizacao && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            Autorizado em {formatDate(auth.data_autorizacao)}
                            {auth.data_validade && ` • Válido até ${formatDate(auth.data_validade)}`}
                          </div>
                        )}
                        {auth.observacoes && (
                          <p className="text-xs text-gray-500 flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                            {auth.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions com validação de quem pode autorizar */}
                  <div className="flex items-center gap-2 shrink-0">
                    {auth.status === 'PENDENTE' && (
                      <>
                        {userCanAuth ? (
                          <>
                            <button
                              onClick={() => setModalAutorizacao(auth)}
                              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                              title="Autorizar esta cirurgia"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Autorizar
                            </button>
                            <button
                              onClick={() => handleNegar(auth.id)}
                              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
                              title="Negar / Cancelar autorização"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Negar
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 font-semibold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            Exclusivo do vendedor responsável
                          </span>
                        )}
                      </>
                    )}
                    {auth.status === 'AUTORIZADA' && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Autorizada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length > displayCount && (
            <div className="text-center pt-4">
              <button
                onClick={() => setDisplayCount(prev => prev + 50)}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Carregar Mais ({displayCount} de {filtered.length} autorizações)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalAutorizacao && (
        <ModalRegistrarAutorizacao
          autorizacao={modalAutorizacao}
          userNome={user?.nome}
          onSalvar={handleAutorizar}
          onFechar={() => setModalAutorizacao(null)}
        />
      )}
    </div>
  );
};

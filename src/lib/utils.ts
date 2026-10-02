import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  StatusProtocolo,
  StatusCirurgia,
  StatusEquipamento,
  StatusOS,
  StatusReserva,
  StatusAutorizacao,
} from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  } catch { return dateStr; }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch { return dateStr; }
}

export function formatBRL(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function generateId(prefix: string = 'ID'): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${new Date().getFullYear()}-${random}`;
}

export function getStatusBadge(status: string): { bg: string; text: string; label: string } {
  const s = status.toLowerCase();

  if (s.includes('confirmad') || s.includes('aprovad') || s.includes('concluíd') || s.includes('realizad') || s.includes('finalizad') || s.includes('faturad') || s.includes('ativo') || s.includes('ok')) {
    return { bg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300', label: status };
  }

  if (s.includes('agendad') || s.includes('pendente') || s.includes('análise') || s.includes('rascunho') || s.includes('em andamento')) {
    return { bg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', label: status };
  }

  if (s.includes('cancelad') || s.includes('recusad') || s.includes('inativo') || s.includes('avaria') || s.includes('erro')) {
    return { bg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800', text: 'text-rose-800 dark:text-rose-300', label: status };
  }

  return { bg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', label: status };
}

/**
 * Mascaramento de CPF em conformidade com a LGPD (Lei Geral de Proteção de Dados)
 * Exemplo: 123.456.789-00 -> 123.***.***-00
 */
export function maskCPF(cpf: string | undefined | null): string {
  if (!cpf) return '-';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `${clean.slice(0, 3)}.***.***-${clean.slice(9, 11)}`;
}

/**
 * Mascaramento de E-mail para exibição segura em auditorias
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email) return '-';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : '***';
  return `${maskedName}@${parts[1]}`;
}

/**
 * Higienização de strings contra ataques XSS (Cross-Site Scripting)
 */
export function sanitizeHTML(dirty: string): string {
  // Substitui caracteres perigosos caso DOMPurify não esteja ativo no contexto
  return dirty
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================
// STATUS CONFIG — helpers de UI por status V2.0
// ============================================================

export interface StatusConfig {
  label: string;
  color: string;      // Tailwind bg color class
  textColor: string;  // Tailwind text color class
  badgeClass: string; // Full badge class
}

export function getStatusProtocoloConfig(status: StatusProtocolo): StatusConfig {
  const map: Record<StatusProtocolo, StatusConfig> = {
    RASCUNHO: { label: 'Rascunho', color: 'bg-gray-100', textColor: 'text-gray-700', badgeClass: 'bg-gray-100 text-gray-700' },
    AGUARDANDO_AUTORIZACAO: { label: 'Aguardando Autorização', color: 'bg-amber-100', textColor: 'text-amber-800', badgeClass: 'bg-amber-100 text-amber-800' },
    AUTORIZADO: { label: 'Autorizado', color: 'bg-emerald-100', textColor: 'text-emerald-800', badgeClass: 'bg-emerald-100 text-emerald-800' },
    CONFIRMADO: { label: 'Confirmado', color: 'bg-sky-100', textColor: 'text-sky-800', badgeClass: 'bg-sky-100 text-sky-800' },
    CANCELADO: { label: 'Cancelado', color: 'bg-red-100', textColor: 'text-red-700', badgeClass: 'bg-red-100 text-red-700' },
    FINALIZADO: { label: 'Finalizado', color: 'bg-blue-100', textColor: 'text-blue-800', badgeClass: 'bg-blue-100 text-blue-800' },
  };
  return map[status] ?? { label: status, color: 'bg-gray-100', textColor: 'text-gray-700', badgeClass: 'bg-gray-100 text-gray-700' };
}

export function getStatusCirurgiaConfig(status: StatusCirurgia): StatusConfig {
  const map: Record<StatusCirurgia, StatusConfig> = {
    AGUARDANDO_AUTORIZACAO: { label: 'Aguardando Autorização', color: 'bg-amber-100', textColor: 'text-amber-800', badgeClass: 'bg-amber-100 text-amber-800' },
    AUTORIZADA_E_AGENDADA: { label: 'Autorizada e Agendada', color: 'bg-emerald-100', textColor: 'text-emerald-800', badgeClass: 'bg-emerald-100 text-emerald-800' },
    SOB_CONSIGNACAO: { label: 'Sob Consignação', color: 'bg-purple-100', textColor: 'text-purple-800', badgeClass: 'bg-purple-100 text-purple-800' },
    NAO_AUTORIZADA: { label: 'Não Autorizada', color: 'bg-red-100', textColor: 'text-red-700', badgeClass: 'bg-red-100 text-red-700' },
    REALIZADA: { label: 'Realizada', color: 'bg-blue-100', textColor: 'text-blue-800', badgeClass: 'bg-blue-100 text-blue-800' },
    FINALIZADA: { label: 'Finalizada', color: 'bg-emerald-100', textColor: 'text-emerald-800', badgeClass: 'bg-emerald-100 text-emerald-800' },
    CANCELADA: { label: 'Cancelada', color: 'bg-gray-200', textColor: 'text-gray-600', badgeClass: 'bg-gray-200 text-gray-600' },
  };
  return map[status] ?? { label: status, color: 'bg-gray-100', textColor: 'text-gray-700', badgeClass: 'bg-gray-100 text-gray-700' };
}

export function getStatusEquipamentoConfig(status: StatusEquipamento): StatusConfig {
  const map: Record<StatusEquipamento, StatusConfig> = {
    DISPONIVEL: { label: 'Disponível', color: 'bg-emerald-100', textColor: 'text-emerald-800', badgeClass: 'bg-emerald-100 text-emerald-800' },
    RESERVADO: { label: 'Reservado', color: 'bg-amber-100', textColor: 'text-amber-800', badgeClass: 'bg-amber-100 text-amber-800' },
    SEPARADO: { label: 'Separado', color: 'bg-yellow-100', textColor: 'text-yellow-800', badgeClass: 'bg-yellow-100 text-yellow-800' },
    EM_TRANSITO: { label: 'Em Trânsito', color: 'bg-blue-100', textColor: 'text-blue-800', badgeClass: 'bg-blue-100 text-blue-800' },
    EM_CAMPO: { label: 'Em Campo', color: 'bg-indigo-100', textColor: 'text-indigo-800', badgeClass: 'bg-indigo-100 text-indigo-800' },
    EM_USO: { label: 'Em Uso', color: 'bg-violet-100', textColor: 'text-violet-800', badgeClass: 'bg-violet-100 text-violet-800' },
    AGUARDANDO_RETORNO: { label: 'Aguardando Retorno', color: 'bg-orange-100', textColor: 'text-orange-800', badgeClass: 'bg-orange-100 text-orange-800' },
    RETORNADO: { label: 'Retornado', color: 'bg-teal-100', textColor: 'text-teal-800', badgeClass: 'bg-teal-100 text-teal-800' },
    HIGIENIZACAO: { label: 'Higienização', color: 'bg-cyan-100', textColor: 'text-cyan-800', badgeClass: 'bg-cyan-100 text-cyan-800' },
    MANUTENCAO: { label: 'Manutenção', color: 'bg-red-100', textColor: 'text-red-700', badgeClass: 'bg-red-100 text-red-700' },
    BLOQUEADO: { label: 'Bloqueado', color: 'bg-gray-300', textColor: 'text-gray-800', badgeClass: 'bg-gray-300 text-gray-800' },
  };
  return map[status] ?? { label: status, color: 'bg-gray-100', textColor: 'text-gray-700', badgeClass: 'bg-gray-100 text-gray-700' };
}

export function getStatusOSConfig(status: StatusOS): StatusConfig {
  const map: Record<StatusOS, StatusConfig> = {
    PENDENTE: { label: 'Pendente', color: 'bg-amber-100', textColor: 'text-amber-800', badgeClass: 'bg-amber-100 text-amber-800' },
    ATRIBUIDA: { label: 'Atribuída', color: 'bg-blue-100', textColor: 'text-blue-800', badgeClass: 'bg-blue-100 text-blue-800' },
    EM_EXECUCAO: { label: 'Em Execução', color: 'bg-indigo-100', textColor: 'text-indigo-800', badgeClass: 'bg-indigo-100 text-indigo-800' },
    CONCLUIDA: { label: 'Concluída', color: 'bg-emerald-100', textColor: 'text-emerald-800', badgeClass: 'bg-emerald-100 text-emerald-800' },
    CANCELADA: { label: 'Cancelada', color: 'bg-red-100', textColor: 'text-red-700', badgeClass: 'bg-red-100 text-red-700' },
  };
  return map[status] ?? { label: status, color: 'bg-gray-100', textColor: 'text-gray-700', badgeClass: 'bg-gray-100 text-gray-700' };
}

export function getStatusReservaConfig(status: StatusReserva): StatusConfig {
  const map: Record<StatusReserva, StatusConfig> = {
    PENDENTE: { label: 'Pendente', color: 'bg-amber-100', textColor: 'text-amber-800', badgeClass: 'bg-amber-100 text-amber-800' },
    CONFIRMADA: { label: 'Confirmada', color: 'bg-emerald-100', textColor: 'text-emerald-800', badgeClass: 'bg-emerald-100 text-emerald-800' },
    SEPARADA: { label: 'Separada', color: 'bg-blue-100', textColor: 'text-blue-800', badgeClass: 'bg-blue-100 text-blue-800' },
    CANCELADA: { label: 'Cancelada', color: 'bg-red-100', textColor: 'text-red-700', badgeClass: 'bg-red-100 text-red-700' },
    UTILIZADA: { label: 'Utilizada', color: 'bg-gray-100', textColor: 'text-gray-700', badgeClass: 'bg-gray-100 text-gray-700' },
  };
  return map[status] ?? { label: status, color: 'bg-gray-100', textColor: 'text-gray-700', badgeClass: 'bg-gray-100 text-gray-700' };
}

export function getStatusAutorizacaoConfig(status: StatusAutorizacao): StatusConfig {
  const map: Record<StatusAutorizacao, StatusConfig> = {
    PENDENTE: { label: 'Pendente', color: 'bg-amber-100', textColor: 'text-amber-800', badgeClass: 'bg-amber-100 text-amber-800' },
    AUTORIZADA: { label: 'Autorizada', color: 'bg-emerald-100', textColor: 'text-emerald-800', badgeClass: 'bg-emerald-100 text-emerald-800' },
    NAO_AUTORIZADA: { label: 'Não Autorizada', color: 'bg-red-100', textColor: 'text-red-700', badgeClass: 'bg-red-100 text-red-700' },
    CANCELADA: { label: 'Cancelada', color: 'bg-gray-200', textColor: 'text-gray-600', badgeClass: 'bg-gray-200 text-gray-600' },
  };
  return map[status] ?? { label: status, color: 'bg-gray-100', textColor: 'text-gray-700', badgeClass: 'bg-gray-100 text-gray-700' };
}

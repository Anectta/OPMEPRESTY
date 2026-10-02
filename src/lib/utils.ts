import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function generateId(prefix: string = 'ID'): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${new Date().getFullYear()}-${random}`;
}

export function getStatusBadge(status: string): { bg: string; text: string; label: string } {
  const s = status.toLowerCase();
  
  if (s.includes('confirmad') || s.includes('aprovad') || s.includes('concluíd') || s.includes('realizad') || s.includes('faturad') || s.includes('ativo') || s.includes('ok')) {
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

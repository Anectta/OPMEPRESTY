import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  maskCPF,
  maskEmail,
  sanitizeHTML,
  getStatusBadge,
  generateId,
} from '../lib/utils';

describe('Utilitários de Formatação (utils.ts)', () => {
  it('formatDate converte datas ISO no formato brasileiro DD/MM/AAAA', () => {
    expect(formatDate('2026-08-01')).toBe('01/08/2026');
    expect(formatDate('2025-12-31')).toBe('31/12/2025');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('formatDateTime formata data e hora no padrão local', () => {
    const formatted = formatDateTime('2026-08-01T14:30:00Z');
    expect(formatted).not.toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
  });

  it('generateId gera códigos únicos com prefixo e ano corrente', () => {
    const id1 = generateId('OPME');
    const id2 = generateId('OPME');
    expect(id1).toMatch(/^OPME-\d{4}-\d{4}$/);
    expect(id1).not.toBe(id2);
  });
});

describe('Utilitários de Segurança e Conformidade LGPD (utils.ts)', () => {
  it('maskCPF mascara o CPF preservando apenas o início e o dígito verificador', () => {
    expect(maskCPF('123.456.789-00')).toBe('123.***.***-00');
    expect(maskCPF('12345678900')).toBe('123.***.***-00');
    expect(maskCPF(undefined)).toBe('-');
    expect(maskCPF(null)).toBe('-');
  });

  it('maskEmail oculta parte sensível do e-mail para logs e auditorias', () => {
    expect(maskEmail('admin@prestymedick.com.br')).toBe('a***n@prestymedick.com.br');
    expect(maskEmail('joao.silva@hospital.com')).toBe('j***a@hospital.com');
    expect(maskEmail(undefined)).toBe('-');
  });

  it('sanitizeHTML neutraliza caracteres propensos a ataques XSS', () => {
    const payload = '<script>alert("xss")</script>';
    const sanitized = sanitizeHTML(payload);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });
});

describe('Classificação de Status e Badges de Cirurgia (V2.0)', () => {
  it('getStatusBadge classifica corretamente status de sucesso e confirmação', () => {
    const badge = getStatusBadge('Confirmada');
    expect(badge.bg).toContain('emerald');
    expect(badge.label).toBe('Confirmada');

    const realizada = getStatusBadge('Realizada');
    expect(realizada.bg).toContain('emerald');
  });

  it('getStatusBadge classifica status de espera e planejamento', () => {
    const badge = getStatusBadge('Agendada');
    expect(badge.bg).toContain('amber');

    const analise = getStatusBadge('Em Análise');
    expect(analise.bg).toContain('amber');
  });

  it('getStatusBadge classifica cancelamentos e avarias em vermelho/rose', () => {
    const badge = getStatusBadge('Cancelada');
    expect(badge.bg).toContain('rose');

    const avaria = getStatusBadge('Avaria Detectada');
    expect(avaria.bg).toContain('rose');
  });
});

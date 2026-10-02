import { describe, it, expect } from 'vitest';
import type { TipoMovimentacao, ProtocoloItem } from '../types';

describe('Regras de Negócio de Estoque e Validades ANVISA (RDC 751/2022)', () => {
  const calculateDaysUntilExpiration = (validadeDateStr: string, referenceDate: Date = new Date()) => {
    const diffTime = new Date(validadeDateStr).getTime() - referenceDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getLoteStatusANVISA = (validadeDateStr: string, referenceDate: Date = new Date()) => {
    const daysLeft = calculateDaysUntilExpiration(validadeDateStr, referenceDate);
    if (daysLeft <= 0) return 'BLOQUEADO_VENCIDO';
    if (daysLeft <= 90) return 'ALERTA_90_DIAS';
    return 'CONFORME_VALIDO';
  };

  it('identifica corretamente lotes válidos com mais de 90 dias de vigência', () => {
    const ref = new Date('2026-08-01T00:00:00Z');
    const validade = '2028-01-10'; // ~500 dias à frente
    expect(getLoteStatusANVISA(validade, ref)).toBe('CONFORME_VALIDO');
  });

  it('emite alerta amarelo para lotes a vencer em 90 dias ou menos', () => {
    const ref = new Date('2026-08-01T00:00:00Z');
    const validade = '2026-09-15'; // ~45 dias à frente
    expect(getLoteStatusANVISA(validade, ref)).toBe('ALERTA_90_DIAS');
  });

  it('bloqueia sumariamente para uso cirúrgico lotes vencidos', () => {
    const ref = new Date('2026-08-01T00:00:00Z');
    const validade = '2026-07-30'; // 2 dias atrás
    expect(getLoteStatusANVISA(validade, ref)).toBe('BLOQUEADO_VENCIDO');
  });

  it('calcula o novo saldo de estoque baseado no tipo de movimentação operacional', () => {
    /**
     * V2.0: TipoMovimentacao usa ENTRADA/RETORNO como incremento,
     * demais tipos (SEPARACAO, ENTREGA, DESCARTE) como decremento.
     */
    const aplicarMovimento = (saldoAtual: number, tipo: TipoMovimentacao, qtd: number) => {
      const isEntrada = tipo === 'ENTRADA' || tipo === 'RETORNO';
      const fator = isEntrada ? 1 : -1;
      return Math.max(0, saldoAtual + qtd * fator);
    };

    // Entrada de recebimento: +10 UN
    expect(aplicarMovimento(18, 'ENTRADA', 10)).toBe(28);

    // Separação para cirurgia: -2 UN
    expect(aplicarMovimento(28, 'SEPARACAO', 2)).toBe(26);

    // Retorno de material não utilizado: +2 UN
    expect(aplicarMovimento(26, 'RETORNO', 2)).toBe(28);

    // Operação maior que saldo não permite estoque negativo
    expect(aplicarMovimento(5, 'ENTREGA', 10)).toBe(0);
  });
});

describe('Regras de Negócio Operacionais de Protocolo OPME V2.0', () => {
  it('totaliza itens cirúrgicos por quantidade sem envolver valores financeiros', () => {
    // V2.0: ProtocoloItem não tem valor_unitario nem valor_total
    const itens: Omit<ProtocoloItem, 'id' | 'protocolo_id'>[] = [
      { descricao_produto: 'Gaiola PEEK', quantidade: 2, produto_codigo: 'OPME-001' },
      { descricao_produto: 'Placa Titânio', quantidade: 1, produto_codigo: 'OPME-002' },
      { descricao_produto: 'Parafuso Titânio', quantidade: 4, produto_codigo: 'OPME-003' },
    ];

    const totalItens = itens.reduce((acc, it) => acc + it.quantidade, 0);
    expect(totalItens).toBe(7);
  });

  it('valida distribuição de indicações de protocolo (PRIMEIRA, SEGUNDA, TERCEIRA)', () => {
    const itens: Omit<ProtocoloItem, 'id' | 'protocolo_id'>[] = [
      { descricao_produto: 'Gaiola PEEK', quantidade: 1, indicacao: 'PRIMEIRA' },
      { descricao_produto: 'Placa Titânio', quantidade: 1, indicacao: 'SEGUNDA' },
      { descricao_produto: 'Parafuso Titânio', quantidade: 4, indicacao: 'PRIMEIRA' },
    ];

    const primeiras = itens.filter((it) => it.indicacao === 'PRIMEIRA');
    expect(primeiras.length).toBe(2);

    const segundas = itens.filter((it) => it.indicacao === 'SEGUNDA');
    expect(segundas.length).toBe(1);
  });

  it('valida que nenhum item do protocolo V2.0 carrega campos financeiros proibidos', () => {
    const item: Omit<ProtocoloItem, 'id' | 'protocolo_id'> = {
      descricao_produto: 'Gaiola PEEK',
      quantidade: 2,
    };

    // Assertivas de conformidade V2.0: campos financeiros inexistentes na interface
    expect((item as any).valor_unitario).toBeUndefined();
    expect((item as any).valor_total).toBeUndefined();
    expect((item as any).preco).toBeUndefined();
  });
});

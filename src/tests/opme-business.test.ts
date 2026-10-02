import { describe, it, expect } from 'vitest';
import { TipoMovimentoEstoque, ProtocoloItem } from '../types';

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

  it('calcula o novo saldo de estoque baseado no tipo de movimentação física', () => {
    const aplicarMovimento = (saldoAtual: number, tipo: TipoMovimentoEstoque, qtd: number) => {
      const isEntrada = tipo === 'entrada' || tipo === 'devolucao';
      const fator = isEntrada ? 1 : -1;
      return Math.max(0, saldoAtual + qtd * fator);
    };

    // Entrada de NF de compra: +10 UN
    expect(aplicarMovimento(18, 'entrada', 10)).toBe(28);

    // Saída para cirurgia no hospital: -2 UN
    expect(aplicarMovimento(28, 'saida', 2)).toBe(26);

    // Devolução de caixa consignada não consumida: +2 UN
    expect(aplicarMovimento(26, 'devolucao', 2)).toBe(28);

    // Saída maior que saldo não permite estoque negativo
    expect(aplicarMovimento(5, 'saida', 10)).toBe(0);
  });
});

describe('Regras de Negócio de Vendas, Comissões e Faturamento OPME', () => {
  it('calcula a comissão do representante baseado no consumo real e percentual contratado', () => {
    const calcularComissao = (valorConsumido: number, comissaoPct: number) => {
      return (valorConsumido * comissaoPct) / 100;
    };

    // Pedido consumido R$ 48.500,00 com taxa de 6%
    const comissao = calcularComissao(48500.0, 6.0);
    expect(comissao).toBe(2910.0);
  });

  it('calcula o valor faturado separando consumo efetivo de itens devolvidos', () => {
    const totalItensEnviados = 60000.0;
    const itensConsumidos = 45000.0;
    const itensDevolvidos = totalItensEnviados - itensConsumidos;

    expect(itensDevolvidos).toBe(15000.0);

    const custoConsumo = 18000.0;
    const margemBruta = ((itensConsumidos - custoConsumo) / itensConsumidos) * 100;

    expect(margemBruta).toBe(60.0);
  });

  it('totaliza cotações cirúrgicas e valida somatória de itens OPME', () => {
    const itens: Omit<ProtocoloItem, 'id' | 'protocolo_id'>[] = [
      { produto_codigo: 'OPME-001', descricao: 'Gaiola PEEK', quantidade: 2, valor_unitario: 8500.0, valor_total: 17000.0 },
      { produto_codigo: 'OPME-002', descricao: 'Placa Titânio', quantidade: 1, valor_unitario: 14500.0, valor_total: 14500.0 },
      { produto_codigo: 'OPME-003', descricao: 'Parafuso Titânio', quantidade: 4, valor_unitario: 4250.0, valor_total: 17000.0 },
    ];

    const totalCalculado = itens.reduce((acc, it) => acc + it.quantidade * it.valor_unitario, 0);
    expect(totalCalculado).toBe(48500.0);
  });
});

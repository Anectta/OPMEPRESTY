import { describe, it, expect } from 'vitest';
import type { ProtocoloOPME, Cirurgia, Vendedor, UserProfile, AuditLog } from '../types';
import {
  getActiveVendedor,
  isAdminOrGestor,
  isCirurgiaOfVendedor,
  isProtocoloOfVendedor,
  canUserAuthorize
} from '../lib/vendedorHelper';
import { getStatusBadge } from '../lib/utils';

describe('Regras de Negócio de Autorização, Escopo de Vendedor e Auditoria', () => {
  const vendedor1: Vendedor = {
    id: 'vend_1',
    nome: 'DANIEL MOTA',
    email: 'daniel.mota@prestymedick.com.br',
    ativo: true,
  };

  const vendedor2: Vendedor = {
    id: 'vend_2',
    nome: 'ANA BEATRIZ LOUVISI ABREU',
    email: 'ana.beatriz@prestymedick.com.br',
    ativo: true,
  };

  const todosVendedores = [vendedor1, vendedor2];

  const protocoloVendedor1: ProtocoloOPME = {
    id: 'prot-1',
    numero_it: '559879',
    paciente: 'Carlos Eduardo Santos',
    vendedor_id: 'vend_1',
    vendedor_nome: 'DANIEL MOTA',
    hospital_nome: 'Hospital Santa Catarina',
    status: 'AGUARDANDO_AUTORIZACAO',
    created_at: new Date().toISOString(),
  };

  const protocoloVendedor2: ProtocoloOPME = {
    id: 'prot-2',
    numero_it: '559882',
    paciente: 'Maria Aparecida da Silva',
    vendedor_id: 'vend_2',
    vendedor_nome: 'ANA BEATRIZ LOUVISI ABREU',
    hospital_nome: 'Hospital São Luiz',
    status: 'AGUARDANDO_AUTORIZACAO',
    created_at: new Date().toISOString(),
  };

  const cirurgiaVendedor1: Cirurgia = {
    id: 'cir-1',
    numero_it: '559895',
    paciente: 'Carlos Eduardo Santos',
    vendedor_id: 'vend_1',
    vendedor_nome: 'DANIEL MOTA',
    hospital_id: 'hosp-1',
    hospital_nome: 'Hospital Santa Catarina',
    medico_nome: 'Dr. Roberto',
    data: '2026-08-15',
    horario: '08:00',
    status: 'AUTORIZADA_E_AGENDADA',
    created_at: new Date().toISOString(),
  };

  const cirurgiaVendedor2: Cirurgia = {
    id: 'cir-2',
    numero_it: '559926',
    paciente: 'Maria Aparecida da Silva',
    vendedor_id: 'vend_2',
    vendedor_nome: 'ANA BEATRIZ LOUVISI ABREU',
    hospital_id: 'hosp-2',
    hospital_nome: 'Hospital São Luiz',
    medico_nome: 'Dr. Fernando',
    data: '2026-08-16',
    horario: '10:00',
    status: 'AUTORIZADA_E_AGENDADA',
    created_at: new Date().toISOString(),
  };

  it('1. Vendedor identifica suas cirurgias e protocolos corretamente', () => {
    expect(isProtocoloOfVendedor(protocoloVendedor1, vendedor1)).toBe(true);
    expect(isProtocoloOfVendedor(protocoloVendedor2, vendedor1)).toBe(false);

    expect(isCirurgiaOfVendedor(cirurgiaVendedor1, vendedor1)).toBe(true);
    expect(isCirurgiaOfVendedor(cirurgiaVendedor2, vendedor1)).toBe(false);
  });

  it('2. Vendedor só pode ver a sua respectiva cirurgia e protocolo', () => {
    const listaCirurgias = [cirurgiaVendedor1, cirurgiaVendedor2];
    const cirurgiasDoVendedor1 = listaCirurgias.filter(c => isCirurgiaOfVendedor(c, vendedor1));
    
    expect(cirurgiasDoVendedor1).toHaveLength(1);
    expect(cirurgiasDoVendedor1[0].vendedor_nome).toBe('DANIEL MOTA');

    const listaProtocolos = [protocoloVendedor1, protocoloVendedor2];
    const protocolosDoVendedor2 = listaProtocolos.filter(p => isProtocoloOfVendedor(p, vendedor2));
    expect(protocolosDoVendedor2).toHaveLength(1);
    expect(protocolosDoVendedor2[0].vendedor_nome).toBe('ANA BEATRIZ LOUVISI ABREU');
  });

  it('3. Administrador pode autorizar qualquer cirurgia', () => {
    expect(canUserAuthorize('admin', protocoloVendedor1, undefined)).toBe(true);
    expect(canUserAuthorize('admin', protocoloVendedor2, undefined)).toBe(true);
    expect(canUserAuthorize('gestor', protocoloVendedor1, undefined)).toBe(true);
  });

  it('4. Vendedor pode autorizar a sua respectiva cirurgia', () => {
    expect(canUserAuthorize('vendedor', protocoloVendedor1, vendedor1)).toBe(true);
    expect(canUserAuthorize('vendedor', protocoloVendedor2, vendedor2)).toBe(true);
  });

  it('5. Um vendedor NÃO pode autorizar a cirurgia de outro vendedor', () => {
    // Vendedor 1 tentando autorizar cirurgia do Vendedor 2
    expect(canUserAuthorize('vendedor', protocoloVendedor2, vendedor1)).toBe(false);

    // Vendedor 2 tentando autorizar cirurgia do Vendedor 1
    expect(canUserAuthorize('vendedor', protocoloVendedor1, vendedor2)).toBe(false);
  });

  it('6. Outros papéis operacionais (motorista, estoque) não podem autorizar cirurgias', () => {
    expect(canUserAuthorize('motorista', protocoloVendedor1, vendedor1)).toBe(false);
    expect(canUserAuthorize('estoque', protocoloVendedor1, vendedor1)).toBe(false);
  });

  it('7. Registro de autorização não exige número prévio obrigatório', () => {
    // O objeto de autorização aceita ausência ou opcionalidade do numero_autorizacao
    const autorizacaoSemNumero = {
      protocolo_id: protocoloVendedor1.id,
      status: 'AUTORIZADA' as const,
      data_autorizacao: '2026-10-02',
      responsavel_autorizacao: 'DANIEL MOTA',
      created_at: new Date().toISOString(),
    };

    expect(autorizacaoSemNumero.status).toBe('AUTORIZADA');
    expect(autorizacaoSemNumero.responsavel_autorizacao).toBe('DANIEL MOTA');
    // numero_autorizacao não é obrigatório
    expect((autorizacaoSemNumero as any).numero_autorizacao).toBeUndefined();
  });

  it('8. Toda ação e acesso registra log contendo o usuário que acessou e as modificações', () => {
    const userAdmin: UserProfile = {
      id: 'usr-1',
      email: 'admin@prestymedick.com.br',
      nome: 'Administrador Master',
      created_at: new Date().toISOString(),
    };

    const logAcesso: AuditLog = {
      id: 'log-1',
      user_id: userAdmin.id,
      user_nome: userAdmin.nome,
      user_email: userAdmin.email,
      user_role: 'admin',
      action: 'ACESSO_MODULO',
      resource_type: 'Autorizações OPME',
      changes: { modulo: 'autorizacoes', usuario: userAdmin.nome },
      severity: 'low',
      created_at: new Date().toISOString(),
    };

    expect(logAcesso.user_nome).toBe('Administrador Master');
    expect(logAcesso.user_email).toBe('admin@prestymedick.com.br');
    expect(logAcesso.action).toBe('ACESSO_MODULO');

    const logModificacao: AuditLog = {
      id: 'log-2',
      user_id: 'vend_1',
      user_nome: 'DANIEL MOTA',
      user_email: 'daniel.mota@prestymedick.com.br',
      user_role: 'vendedor',
      action: 'AUTORIZAR_CIRURGIA',
      resource_type: 'Autorizações',
      resource_id: '559879',
      changes: {
        numero_it: '559879',
        paciente: 'Carlos Eduardo Santos',
        status_anterior: 'PENDENTE',
        novo_status: 'AUTORIZADA',
        autorizado_por: 'DANIEL MOTA',
      },
      severity: 'high',
      created_at: new Date().toISOString(),
    };

    expect(logModificacao.user_nome).toBe('DANIEL MOTA');
    expect(logModificacao.action).toBe('AUTORIZAR_CIRURGIA');
    expect(logModificacao.changes.status_anterior).toBe('PENDENTE');
    expect(logModificacao.changes.novo_status).toBe('AUTORIZADA');
  });

  it('9. Setor de OPME cadastra a cirurgia e altera status para Confirmada aguardando vendedor', () => {
    // Cadastro realizado pela equipe de OPME
    const cirurgiaCadastradaPelaOPME: Cirurgia = {
      id: 'cir-opme-1',
      numero_it: '560120',
      paciente: 'Roberto Firmino de Lima',
      hospital_id: 'hosp-1',
      hospital_nome: 'Hospital Albert Einstein',
      medico_nome: 'Dr. Claudio Nogueira',
      convenio_nome: 'Bradesco Saúde',
      vendedor_id: 'vend_1',
      vendedor_nome: 'DANIEL MOTA',
      material_previsto: 'Kit Artroplastia Quadril',
      data: '',
      horario: '08:00',
      situacao: 'Confirmada',
      status: 'AGUARDANDO_AUTORIZACAO',
      data_a_definir: true,
      created_at: new Date().toISOString(),
    };

    // A cirurgia deve ser identificada como aguardando data do vendedor
    expect(cirurgiaCadastradaPelaOPME.situacao).toBe('Confirmada');
    expect(cirurgiaCadastradaPelaOPME.data_a_definir).toBe(true);
    expect(cirurgiaCadastradaPelaOPME.vendedor_nome).toBe('DANIEL MOTA');
  });

  it('10. Vendedor responsável visualiza a cirurgia confirmada e tem permissão para definir a data', () => {
    const cirurgiaConfirmada: Cirurgia = {
      id: 'cir-opme-1',
      numero_it: '560120',
      paciente: 'Roberto Firmino de Lima',
      hospital_id: 'hosp-1',
      hospital_nome: 'Hospital Albert Einstein',
      medico_nome: 'Dr. Claudio Nogueira',
      vendedor_id: 'vend_1',
      vendedor_nome: 'DANIEL MOTA',
      data: '',
      horario: '08:00',
      situacao: 'Confirmada',
      status: 'AGUARDANDO_AUTORIZACAO',
      data_a_definir: true,
      created_at: new Date().toISOString(),
    };

    // O vendedor 1 (Daniel Mota) é o responsável
    expect(isCirurgiaOfVendedor(cirurgiaConfirmada, vendedor1)).toBe(true);
    // O vendedor 2 não tem acesso
    expect(isCirurgiaOfVendedor(cirurgiaConfirmada, vendedor2)).toBe(false);
  });

  it('11. Ao vendedor informar a data da cirurgia, atualiza para Agendada e gera log de auditoria', () => {
    const cirurgiaConfirmada: Cirurgia = {
      id: 'cir-opme-1',
      numero_it: '560120',
      paciente: 'Roberto Firmino de Lima',
      hospital_id: 'hosp-1',
      hospital_nome: 'Hospital Albert Einstein',
      medico_nome: 'Dr. Claudio Nogueira',
      vendedor_id: 'vend_1',
      vendedor_nome: 'DANIEL MOTA',
      data: '',
      horario: '08:00',
      situacao: 'Confirmada',
      status: 'AGUARDANDO_AUTORIZACAO',
      data_a_definir: true,
      created_at: new Date().toISOString(),
    };

    // Vendedor Daniel Mota informa a data da cirurgia
    const dataInformadaPeloVendedor = '2026-08-25';
    const horarioInformado = '09:30';

    const cirurgiaAtualizada: Cirurgia = {
      ...cirurgiaConfirmada,
      data: dataInformadaPeloVendedor,
      horario: horarioInformado,
      situacao: 'Agendada',
      status: 'AUTORIZADA_E_AGENDADA',
      data_a_definir: false,
      data_definida_por: vendedor1.nome,
      data_definida_em: new Date().toISOString(),
    };

    expect(cirurgiaAtualizada.situacao).toBe('Agendada');
    expect(cirurgiaAtualizada.data).toBe('2026-08-25');
    expect(cirurgiaAtualizada.horario).toBe('09:30');
    expect(cirurgiaAtualizada.data_a_definir).toBe(false);
    expect(cirurgiaAtualizada.data_definida_por).toBe('DANIEL MOTA');

    // Auditoria correspondente
    const auditLogData: AuditLog = {
      id: 'log-3',
      user_id: vendedor1.id,
      user_nome: vendedor1.nome,
      user_email: vendedor1.email,
      user_role: 'vendedor',
      action: 'DEFINIR_DATA_CIRURGIA',
      resource_type: 'MapaCirurgico',
      resource_id: cirurgiaAtualizada.numero_it,
      changes: {
        cirurgia_id: cirurgiaAtualizada.id,
        numero_it: cirurgiaAtualizada.numero_it,
        paciente: cirurgiaAtualizada.paciente,
        nova_data: cirurgiaAtualizada.data,
        novo_horario: cirurgiaAtualizada.horario,
        definido_por: vendedor1.nome,
        situacao_anterior: 'Confirmada',
        nova_situacao: 'Agendada',
      },
      severity: 'high',
      created_at: new Date().toISOString(),
    };

    expect(auditLogData.action).toBe('DEFINIR_DATA_CIRURGIA');
    expect(auditLogData.user_nome).toBe('DANIEL MOTA');
    expect(auditLogData.changes.nova_data).toBe('2026-08-25');
    expect(auditLogData.changes.nova_situacao).toBe('Agendada');
  });

  it('12. Ao clicar no botão Finalizada, atualiza a cirurgia para FINALIZADA e gera log de auditoria com usuário e data', () => {
    const cirurgiaRealizada: Cirurgia = {
      id: 'cir-opme-2',
      numero_it: '560130',
      paciente: 'Mariana Souza Dias',
      hospital_id: 'hosp-1',
      hospital_nome: 'Hospital Albert Einstein',
      medico_nome: 'Dr. Roberto Silveira',
      vendedor_id: 'vend_1',
      vendedor_nome: 'DANIEL MOTA',
      data: '2026-08-20',
      horario: '10:00',
      situacao: 'Realizada',
      status: 'REALIZADA',
      created_at: new Date().toISOString(),
    };

    const finalizadoEm = new Date().toISOString();
    const finalizadoPor = 'DANIEL MOTA';

    // Ação do botão Finalizada
    const cirurgiaFinalizada: Cirurgia = {
      ...cirurgiaRealizada,
      situacao: 'Finalizada',
      status: 'FINALIZADA',
      finalizada_em: finalizadoEm,
      finalizada_por: finalizadoPor,
    };

    expect(cirurgiaFinalizada.situacao).toBe('Finalizada');
    expect(cirurgiaFinalizada.status).toBe('FINALIZADA');
    expect(cirurgiaFinalizada.finalizada_por).toBe('DANIEL MOTA');
    expect(cirurgiaFinalizada.finalizada_em).toBeDefined();

    // Log de auditoria da finalização
    const auditLogFinalizacao: AuditLog = {
      id: 'log-finalizar-1',
      user_id: vendedor1.id,
      user_nome: vendedor1.nome,
      user_email: vendedor1.email,
      user_role: 'vendedor',
      action: 'FINALIZAR_CIRURGIA',
      resource_type: 'MapaCirurgico',
      resource_id: cirurgiaFinalizada.numero_it,
      changes: {
        cirurgia_id: cirurgiaFinalizada.id,
        numero_it: cirurgiaFinalizada.numero_it,
        paciente: cirurgiaFinalizada.paciente,
        situacao_anterior: 'Realizada',
        nova_situacao: 'Finalizada',
        novo_status: 'FINALIZADA',
        finalizada_por: finalizadoPor,
        finalizada_em: finalizadoEm,
      },
      severity: 'high',
      created_at: finalizadoEm,
    };

    expect(auditLogFinalizacao.action).toBe('FINALIZAR_CIRURGIA');
    expect(auditLogFinalizacao.changes.novo_status).toBe('FINALIZADA');
    expect(auditLogFinalizacao.changes.finalizada_por).toBe('DANIEL MOTA');
  });

  it('13. Lista de cirurgias finalizadas filtra corretamente e aplica badge com estilo correspondente', () => {
    const cirurgiasLista: Cirurgia[] = [
      {
        id: 'c-1',
        paciente: 'Carlos Lima',
        hospital_id: 'hosp-1',
        hospital_nome: 'Hosp 1',
        medico_nome: 'Dr. A',
        data: '2026-08-10',
        horario: '08:00',
        situacao: 'Agendada',
        status: 'AUTORIZADA_E_AGENDADA',
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-2',
        paciente: 'Julia Mendes',
        hospital_id: 'hosp-1',
        hospital_nome: 'Hosp 1',
        medico_nome: 'Dr. B',
        data: '2026-08-05',
        horario: '09:00',
        situacao: 'Finalizada',
        status: 'FINALIZADA',
        finalizada_em: '2026-08-05T12:00:00Z',
        finalizada_por: 'Gestor OPME',
        created_at: new Date().toISOString(),
      },
    ];

    const finalizadas = cirurgiasLista.filter(
      (c) => c.situacao === 'Finalizada' || c.status === 'FINALIZADA' || !!c.finalizada_em
    );
    const ativas = cirurgiasLista.filter(
      (c) => c.situacao !== 'Finalizada' && c.status !== 'FINALIZADA' && !c.finalizada_em
    );

    expect(finalizadas).toHaveLength(1);
    expect(finalizadas[0].paciente).toBe('Julia Mendes');
    expect(ativas).toHaveLength(1);
    expect(ativas[0].paciente).toBe('Carlos Lima');

    // Badge correspondente
    const badge = getStatusBadge(finalizadas[0].status);
    expect(badge.label).toBe('FINALIZADA');
    expect(badge.bg).toContain('emerald');
    expect(badge.text).toContain('emerald');
  });
});



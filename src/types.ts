/**
 * OPME PRESTY — Tipos V2.0
 * Plataforma de Gestão de Protocolo OPME, Mapa Cirúrgico, Estoque e Logística
 * SINGLE TENANT | SEM MÓDULOS FINANCEIROS | Conforme Especificação Mestre V2.0
 */

// ============================================================
// ROLES DO SISTEMA (seção 3)
// ============================================================
export type AppRole =
  | 'admin'
  | 'gestor'
  | 'vendedor'
  | 'estoque'
  | 'logistica'
  | 'motorista'
  | 'operador'
  | 'auditor';

// ============================================================
// ENUMS DE STATUS V2.0
// ============================================================

/** Status do Protocolo OPME — seção 8 */
export type StatusProtocolo =
  | 'RASCUNHO'
  | 'AGUARDANDO_AUTORIZACAO'
  | 'CONFIRMADO'
  | 'AUTORIZADO'
  | 'CANCELADO'
  | 'FINALIZADO';

/** Status da Autorização — seção 9 */
export type StatusAutorizacao =
  | 'PENDENTE'
  | 'AUTORIZADA'
  | 'NAO_AUTORIZADA'
  | 'CANCELADA';

/** Status da Cirurgia no Mapa — seção 13 */
export type StatusCirurgia =
  | 'AGUARDANDO_AUTORIZACAO'
  | 'AUTORIZADA_E_AGENDADA'
  | 'SOB_CONSIGNACAO'
  | 'NAO_AUTORIZADA'
  | 'REALIZADA'
  | 'FINALIZADA'
  | 'CANCELADA';

/** Alias para compatibilidade com componentes legados */
export type SituacaoCirurgia =
  | 'Aguardando Autorização'
  | 'Em Análise OPME'
  | 'Agendada'
  | 'Confirmada'
  | 'Em Andamento'
  | 'Realizada'
  | 'Finalizada'
  | 'Faturada'
  | 'Cancelada'
  | StatusCirurgia;

/** Status do Equipamento — seção 22 */
export type StatusEquipamento =
  | 'DISPONIVEL'
  | 'RESERVADO'
  | 'SEPARADO'
  | 'EM_TRANSITO'
  | 'EM_CAMPO'
  | 'EM_USO'
  | 'AGUARDANDO_RETORNO'
  | 'RETORNADO'
  | 'HIGIENIZACAO'
  | 'MANUTENCAO'
  | 'BLOQUEADO';

/** Status da Reserva de Material — seção 16 */
export type StatusReserva =
  | 'PENDENTE'
  | 'CONFIRMADA'
  | 'SEPARADA'
  | 'CANCELADA'
  | 'UTILIZADA';

/** Tipo de Operação Logística — seção 25 */
export type TipoOperacaoLogistica =
  | 'ENTREGA'
  | 'RETIRADA'
  | 'RETORNO'
  | 'TRANSFERENCIA';

/** Status da Ordem de Serviço — seção 24 */
export type StatusOS =
  | 'PENDENTE'
  | 'ATRIBUIDA'
  | 'EM_EXECUCAO'
  | 'CONCLUIDA'
  | 'CANCELADA';

/** Tipo de Movimentação Operacional — sem conotação financeira — seção 6 */
export type TipoMovimentacao =
  | 'ENTRADA'
  | 'RESERVA'
  | 'SEPARACAO'
  | 'ENTREGA'
  | 'RETORNO'
  | 'TRANSFERENCIA'
  | 'AJUSTE'
  | 'DESCARTE';

// ============================================================
// USUÁRIOS E SEGURANÇA
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  cargo?: string;
  avatar_url?: string;
  vendedor_id?: string;
  vendedor_nome?: string;
  ativo?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// ============================================================
// EMPRESA (Entidade Raiz Institucional — Single Tenant — seção 2.2)
// ============================================================

export interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ie?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  configuracoes?: Record<string, unknown>;
}

// ============================================================
// AUDITORIA E EVENTOS (seções 32-33)
// ============================================================

/** Auditoria técnica — seção 32 */
export interface AuditLog {
  id: string;
  usuario_id?: string;
  usuario_nome?: string;
  usuario_email?: string;
  usuario_role?: string;
  user_id?: string;
  user_nome?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'baixa' | 'media' | 'alta' | 'critica';
  modulo?: string;
  entidade?: string;
  registro_id?: string;
  acao?: string;
  valor_anterior?: Record<string, unknown>;
  valor_novo?: Record<string, unknown>;
  ip?: string;
  user_agent?: string;
  severidade?: 'baixa' | 'media' | 'alta' | 'critica' | 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

/** Evento operacional de negócio — Timeline da cirurgia — seção 33 */
export interface OperationalEvent {
  id: string;
  tipo: string;
  descricao: string;
  protocolo_id?: string;
  autorizacao_id?: string;
  cirurgia_id?: string;
  reserva_id?: string;
  os_id?: string;
  usuario_id?: string;
  metadados?: Record<string, unknown>;
  created_at: string;
}

/** Notificação ao usuário — seção 31 */
export interface Notification {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  protocolo_id?: string;
  cirurgia_id?: string;
  link_acao?: string;
  created_at: string;
}

/** Alerta operacional */
export interface Alert {
  id: string;
  tipo: string;
  severidade: string;
  titulo: string;
  descricao?: string;
  entidade?: string;
  entidade_id?: string;
  resolvido: boolean;
  created_at: string;
}

// ============================================================
// CADASTROS AUXILIARES (seção 37)
// ============================================================

export interface Hospital {
  id: string;
  nome: string;
  cnpj?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  contato_principal?: string;
  ativo: boolean;
  created_at?: string;
}

export interface CentroCirurgico {
  id: string;
  hospital_id: string;
  nome: string;
  ativo: boolean;
}

export interface SalaCirurgica {
  id: string;
  centro_cirurgico_id: string;
  nome: string;
  ativo: boolean;
}

export interface Medico {
  id: string;
  nome: string;
  crm?: string;
  uf_crm?: string;
  especialidade?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  created_at?: string;
}

/** Paciente — somente nome conforme LGPD e solicitação do usuário */
export interface Paciente {
  id: string;
  nome: string;
  created_at?: string;
}

export interface Procedimento {
  id: string;
  codigo: string;
  descricao: string;
  especialidade?: string;
  ativo: boolean;
}

export interface Convenio {
  id: string;
  nome: string;
  registro?: string;
  ans_codigo?: string;
  ativo: boolean;
}

export interface Vendedor {
  id: string;
  user_id?: string;
  nome: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  created_at?: string;
}

export interface Fabricante {
  id: string;
  nome: string;
  cnpj?: string;
  ativo: boolean;
}

export interface CategoriaProduto {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface UnidadeMedida {
  id: string;
  codigo: string;
  descricao: string;
}

// ============================================================
// PRODUTOS / MATERIAIS OPME — SEM campos financeiros (seções 18-19)
// ============================================================

export interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  categoria_id?: string;
  categoria?: string;
  fabricante_id?: string;
  fabricante?: string;
  unidade_id?: string;
  unidade: string;
  anvisa?: string;
  controla_lote: boolean;
  controla_validade: boolean;
  controla_serie: boolean;
  grupo?: string;
  subgrupo?: string;
  is_kit?: boolean;
  saldo_total?: number;
  // SEM valor_custo, valor_venda, preco — proibido pela V2.0 seção 6
  ativo: boolean;
  created_at?: string;
}

export interface Kit {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  ativo: boolean;
}

export interface KitComponente {
  id: string;
  kit_id: string;
  produto_id: string;
  quantidade: number;
}

// ============================================================
// ESTOQUE OPERACIONAL (seções 16-18)
// ============================================================

export interface Localizacao {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string; // GALPAO | CARRO | HOSPITAL | EXTERNO
  ativo: boolean;
}

/** Saldo de estoque por produto/lote/localização — sem valor financeiro */
export interface Estoque {
  id: string;
  produto_id: string;
  localizacao_id?: string;
  lote: string;
  numero_serie?: string;
  validade?: string;
  fabricacao?: string;
  quantidade_disponivel: number;
  quantidade_reservada: number;
}

/** Movimentação operacional — rastreabilidade sem baixa financeira — seção 17 */
export interface MovimentacaoOperacional {
  id: string;
  produto_id: string;
  estoque_id?: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  lote?: string;
  numero_serie?: string;
  localizacao_origem_id?: string;
  localizacao_destino_id?: string;
  protocolo_id?: string;
  cirurgia_id?: string;
  reserva_id?: string;
  os_id?: string;
  responsavel_id?: string;
  observacoes?: string;
  created_at: string;
}

// ============================================================
// PROTOCOLO OPME (seção 8)
// ============================================================

export interface ProtocoloOPME {
  id: string;
  numero_it: string;           // Número IT do sistema legado: ex. 559879
  numero_protocolo?: string;   // Número interno: PROT-559879
  hospital_id?: string;
  hospital_nome?: string;
  medico_id?: string;
  medico_nome?: string;
  paciente_id?: string;
  paciente: string;
  procedimento_id?: string;
  procedimento_nome?: string;
  convenio_id?: string;
  convenio_nome?: string;
  vendedor_id?: string;
  vendedor_nome?: string;
  status: StatusProtocolo;
  data_protocolo?: string;
  data_cirurgia?: string;      // Obrigatória somente quando AUTORIZADO
  pedido_venda?: string;
  tipo_saida?: string;
  data_entrega?: string;
  codigo_cliente?: string;
  motivo_cancelamento?: string;
  observacoes?: string;
  documentos?: string[];
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Expandido (join)
  itens?: ProtocoloItem[];
  autorizacao?: Autorizacao;
}

export interface ProtocoloItem {
  id: string;
  protocolo_id: string;
  numero_it?: string;          // ex. 559879-01
  produto_id?: string;
  produto_codigo?: string;
  descricao_produto: string;
  quantidade: number;
  indicacao?: string;          // PRIMEIRA, SEGUNDA, TERCEIRA, SEM PEDIDO MEDICO
  observacoes?: string;
  created_at?: string;
}

// ============================================================
// AUTORIZAÇÃO (seção 9)
// ============================================================

export interface Autorizacao {
  id: string;
  protocolo_id: string;
  numero_autorizacao?: string;
  status: StatusAutorizacao;
  data_autorizacao?: string;
  data_validade?: string;
  responsavel_autorizacao?: string;
  observacoes?: string;
  responsavel_id?: string;
  created_at: string;
  updated_at?: string;
  // Expandido
  protocolo?: ProtocoloOPME;
}

// ============================================================
// CIRURGIA — MAPA CIRÚRGICO (seções 11-13)
// ============================================================

export interface Cirurgia {
  id: string;
  numero_it?: string;
  protocolo_id?: string;
  autorizacao_id?: string;
  status: StatusCirurgia;
  situacao?: SituacaoCirurgia;  // compatibilidade com componentes legados
  data: string;                 // YYYY-MM-DD
  horario: string;              // HH:mm
  data_a_definir?: boolean;     // Indica se a data aguarda definição pelo vendedor
  data_definida_por?: string;   // Nome do usuário/vendedor que definiu a data
  data_definida_em?: string;    // Data/hora em que a data foi informada
  finalizada_em?: string;       // Data/hora em que a cirurgia foi finalizada
  finalizada_por?: string;      // Nome do usuário que finalizou a cirurgia
  hospital_id: string;
  hospital_nome: string;
  centro_cirurgico_id?: string;
  sala?: string;
  medico_id?: string;
  medico_nome: string;
  paciente: string;
  paciente_cpf?: string;
  equipamento?: string;
  acessorio?: string;
  ld_ct?: string;
  material_previsto?: string;
  tecnico_nome?: string;
  observacao?: string;
  empresa_id?: string;
  procedimento_id?: string;
  procedimento_nome?: string;
  convenio_id?: string;
  convenio_nome?: string;
  vendedor_id?: string;
  vendedor_nome?: string;
  observacoes?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Expandido
  materiais?: CirurgiaMaterial[];
  equipamentos?: CirurgiaEquipamento[];
  protocolo?: ProtocoloOPME;
  eventos?: OperationalEvent[];
}

export interface CirurgiaMaterial {
  id: string;
  cirurgia_id: string;
  produto_id?: string;
  produto_codigo?: string;
  descricao_produto: string;
  quantidade_necessaria: number;
  quantidade_reservada: number;
  quantidade_utilizada: number;
  quantidade_retornada: number;
  observacoes?: string;
}

export interface CirurgiaEquipamento {
  id: string;
  cirurgia_id: string;
  equipamento_id?: string;
  equipamento_nome: string;
  quantidade: number;
  status_requisicao: string;
  observacoes?: string;
}

// ============================================================
// RESERVAS DE MATERIAIS (seção 16)
// ============================================================

export interface Reserva {
  id: string;
  cirurgia_id: string;
  protocolo_id?: string;
  status: StatusReserva;
  data_reserva: string;
  data_necessidade?: string;
  observacoes?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  itens?: ReservaItem[];
}

export interface ReservaItem {
  id: string;
  reserva_id: string;
  produto_id: string;
  estoque_id?: string;
  quantidade_solicitada: number;
  quantidade_reservada: number;
  quantidade_separada: number;
  quantidade_utilizada: number;
  quantidade_retornada: number;
  lote?: string;
  numero_serie?: string;
  status: StatusReserva;
  observacoes?: string;
}

// ============================================================
// EQUIPAMENTOS (seção 21)
// ============================================================

export interface EquipamentoModelo {
  id: string;
  codigo: string;
  nome: string;
  fabricante?: string;
  categoria?: string;
  descricao?: string;
  ativo: boolean;
}

export interface Equipamento {
  id: string;
  modelo_id?: string;
  codigo_patrimonio: string;
  numero_serie?: string;
  nome: string;
  fabricante?: string;
  categoria?: string;
  localizacao_atual_id?: string;
  localizacao_descricao?: string;
  status: StatusEquipamento;
  cirurgia_vinculada_id?: string;
  disponivel_para_reserva: boolean;
  observacoes?: string;
  ativo: boolean;
  created_at?: string;
}

export interface EquipamentoMovimentacao {
  id: string;
  equipamento_id: string;
  tipo: string;
  status_anterior?: StatusEquipamento;
  status_novo?: StatusEquipamento;
  localizacao_origem_id?: string;
  localizacao_destino_id?: string;
  cirurgia_id?: string;
  os_id?: string;
  responsavel_id?: string;
  observacoes?: string;
  created_at: string;
}

export interface EquipamentoManutencao {
  id: string;
  equipamento_id: string;
  tipo: string;
  descricao?: string;
  data_entrada: string;
  data_prevista_retorno?: string;
  data_retorno?: string;
  responsavel?: string;
  status: string;
}

export interface EquipamentoHigienizacao {
  id: string;
  equipamento_id: string;
  data: string;
  responsavel?: string;
  observacoes?: string;
  status: string;
}

// ============================================================
// LOGÍSTICA (seções 23-28)
// ============================================================

export interface Motorista {
  id: string;
  user_id?: string;
  nome: string;
  cpf?: string;
  cnh?: string;
  categoria_cnh?: string;
  validade_cnh?: string;
  telefone?: string;
  ativo: boolean;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo?: string;
  marca?: string;
  ano?: number;
  tipo?: string;
  motorista_padrao_id?: string;
  responsavel_nome?: string;
  ativo: boolean;
}

export interface OrdemServico {
  id: string;
  numero: string;
  cirurgia_id?: string;
  hospital_id?: string;
  hospital_nome?: string;
  endereco_entrega?: string;
  tipo: TipoOperacaoLogistica;
  motorista_id?: string;
  motorista_nome?: string;
  veiculo_id?: string;
  veiculo_placa?: string;
  data_planejada?: string;
  horario_planejado?: string;
  data_execucao?: string;
  status: StatusOS;
  observacoes?: string;
  comprovante_url?: string;
  responsavel_recebimento?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  itens?: OrdemServicoItem[];
}

export interface OrdemServicoItem {
  id: string;
  os_id: string;
  tipo: 'MATERIAL' | 'EQUIPAMENTO';
  produto_id?: string;
  equipamento_id?: string;
  descricao: string;
  quantidade: number;
  lote?: string;
  numero_serie?: string;
  divergencia: boolean;
  divergencia_descricao?: string;
}

export interface Rota {
  id: string;
  numero: string;
  data: string;
  motorista_id?: string;
  veiculo_id?: string;
  status: 'PLANEJADA' | 'EM_EXECUCAO' | 'CONCLUIDA' | 'CANCELADA';
  horario_partida_planejado?: string;
  horario_retorno_planejado?: string;
  observacoes?: string;
  paradas?: RotaParada[];
}

export interface RotaParada {
  id: string;
  rota_id: string;
  os_id?: string;
  sequencia: number;
  endereco: string;
  hospital_id?: string;
  tipo: TipoOperacaoLogistica;
  horario_planejado?: string;
  status: string;
}

export interface Entrega {
  id: string;
  os_id: string;
  cirurgia_id?: string;
  data_hora_entrega: string;
  motorista_id?: string;
  responsavel_recebimento?: string;
  assinatura_url?: string;
  comprovante_url?: string;
  divergencias: boolean;
  divergencias_descricao?: string;
  observacoes?: string;
  itens?: EntregaItem[];
}

export interface EntregaItem {
  id: string;
  entrega_id: string;
  tipo: 'MATERIAL' | 'EQUIPAMENTO';
  produto_id?: string;
  equipamento_id?: string;
  descricao: string;
  quantidade_entregue: number;
  lote?: string;
  divergencia: boolean;
}

export interface Retorno {
  id: string;
  os_id?: string;
  cirurgia_id?: string;
  data_hora_retorno: string;
  motorista_id?: string;
  responsavel_conferencia_id?: string;
  divergencias: boolean;
  status_conferencia: string;
  observacoes?: string;
  itens?: RetornoItem[];
}

export interface RetornoItem {
  id: string;
  retorno_id: string;
  tipo: 'MATERIAL' | 'EQUIPAMENTO';
  produto_id?: string;
  equipamento_id?: string;
  descricao: string;
  quantidade_retornada: number;
  condicao: 'BOM_ESTADO' | 'DANIFICADO' | 'PERDIDO';
  divergencia: boolean;
}

// ============================================================
// CONTROLE DE USO (seção 17)
// ============================================================

/** Controle operacional de uso — rastreabilidade sem baixa financeira */
export interface ControleUso {
  id: string;
  cirurgia_id: string;
  produto_id: string;
  reserva_item_id?: string;
  lote?: string;
  numero_serie?: string;
  quantidade_reservada: number;
  quantidade_separada: number;
  quantidade_utilizada: number;
  quantidade_nao_utilizada: number;
  quantidade_retornada: number;
  responsavel_id?: string;
  data_hora_registro: string;
  observacoes?: string;
}

// ============================================================
// COMPATIBILIDADE COM GESTÃO DE ESTOQUE LEGADA
// ============================================================

export type TipoMovimentoEstoque = 'entrada' | 'saida' | 'devolucao' | 'ajuste';

export interface ProdutoLote {
  id: string;
  produto_id: string;
  lote: string;
  fabricacao: string;
  validade: string;
  quantidade: number;
}

export interface MovimentoEstoque {
  id: string;
  produto_id: string;
  produto_codigo: string;
  produto_descricao: string;
  lote: string;
  numero_serie?: string;
  tipo: TipoMovimentoEstoque;
  quantidade: number;
  origem: string;
  destino: string;
  hospital_nome?: string;
  medico_nome?: string;
  paciente_nome?: string;
  protocolo_numero?: string;
  user_email: string;
  created_at: string;
}

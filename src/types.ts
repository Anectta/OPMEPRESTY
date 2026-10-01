/**
 * Presty Medick - Types Definition
 * ERP SaaS para Distribuidora de OPME (Órteses, Próteses e Materiais Especiais)
 */

export type AppRole =
  | 'admin'
  | 'user'
  | 'editor'
  | 'supervisor'
  | 'comercial'
  | 'financeiro'
  | 'motorista'
  | 'gestor_frota'
  | 'estoque';

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  cargo?: string;
  created_at: string;
  avatar_url?: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ie?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  logo_url?: string;
}

export interface AuditLog {
  id: string;
  action: string; // e.g. 'LOGIN', 'CREATE_CIRURGIA', 'UPDATE_PROTOCOLO', 'BAIXA_ESTOQUE'
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id: string;
  user_email: string;
  user_role: AppRole;
  resource_type: string;
  resource_id?: string;
  route?: string;
  method?: string;
  ip?: string;
  changes?: Record<string, any>;
  created_at: string;
}

// Cadastros Auxiliares
export interface Hospital {
  id: string;
  nome: string;
  cnpj?: string;
  cidade?: string;
  estado?: string;
  contato?: string;
  ativo: boolean;
}

export interface Medico {
  id: string;
  nome: string;
  crm: string;
  uf_crm: string;
  especialidade: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
}

export interface Convenio {
  id: string;
  nome: string;
  ans_codigo?: string;
  ativo: boolean;
}

export interface Equipamento {
  id: string;
  nome: string;
  codigo?: string;
  tipo?: string;
  ativo: boolean;
}

export interface Vendedor {
  id: string;
  nome: string;
  user_id?: string;
  email: string;
  comissao_padrao_pct: number;
  ativo: boolean;
}

export interface Tecnico {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  ativo: boolean;
}

// Mapa Cirúrgico
export type SituacaoCirurgia =
  | 'Agendada'
  | 'Confirmada'
  | 'Em Andamento'
  | 'Realizada'
  | 'Cancelada'
  | 'Faturada';

export interface Cirurgia {
  id: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  hospital_id: string;
  hospital_nome: string;
  medico_id: string;
  medico_nome: string;
  paciente: string;
  paciente_cpf?: string;
  convenio_id: string;
  convenio_nome: string;
  vendedor_id: string;
  vendedor_nome: string;
  situacao: SituacaoCirurgia;
  equipamento?: string;
  acessorio?: string;
  ld_ct?: string; // Liberado / Com Termo
  material_previsto?: string;
  tecnico_nome?: string;
  observacao?: string;
  empresa_id: string;
  created_by?: string;
  created_at: string;
}

// Protocolo OPME / Cotação
export type StatusProtocolo =
  | 'Rascunho'
  | 'Em Análise'
  | 'Aprovado Convenio'
  | 'Recusado'
  | 'Entregue'
  | 'Faturado';

export interface ProtocoloItem {
  id: string;
  protocolo_id: string;
  produto_codigo: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  anvisa?: string;
}

export interface Protocolo {
  id: string;
  numero: string; // e.g. PROT-2026-0082
  data: string;
  medico_nome: string;
  crm: string;
  paciente: string;
  hospital_nome: string;
  convenio_nome: string;
  procedimento: string;
  data_cirurgia: string;
  status: StatusProtocolo;
  vendedor_nome: string;
  valor_total: number;
  observacao?: string;
  itens: ProtocoloItem[];
  created_at: string;
}

export interface ProtocoloHistorico {
  id: string;
  protocolo_id: string;
  campo: string;
  valor_anterior: string;
  valor_novo: string;
  acao: string;
  user_email: string;
  created_at: string;
}

// Estoque OPME
export interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  fabricante: string;
  anvisa: string;
  grupo: string;
  subgrupo?: string;
  unidade: string;
  valor_custo: number;
  valor_venda: number;
  controla_serie: boolean;
  is_kit: boolean;
  saldo_total: number;
  ativo: boolean;
}

export interface ProdutoLote {
  id: string;
  produto_id: string;
  lote: string;
  fabricacao: string;
  validade: string;
  quantidade: number;
}

export type TipoMovimentoEstoque =
  | 'entrada'
  | 'saida'
  | 'entrega'
  | 'devolucao'
  | 'consumo'
  | 'ajuste';

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

export interface Entrega {
  id: string;
  numero: string; // e.g. ENT-2026-041
  data: string;
  hospital_nome: string;
  medico_nome: string;
  paciente: string;
  procedimento: string;
  vendedor_nome: string;
  status: 'Pendente' | 'Entregue' | 'Concluída' | 'Devolvida Parcial';
  assinatura_url?: string;
  itens_count: number;
  created_at: string;
}

// Vendas OPME
export type StatusVenda =
  | 'Orcamento'
  | 'Pedido Criado'
  | 'Cirurgia Agendada'
  | 'Consumo Registrado'
  | 'Faturado'
  | 'Cancelado';

export interface Venda {
  id: string;
  numero: string; // e.g. VDA-2026-019
  nota_fiscal?: string;
  data: string;
  cliente_hospital: string;
  cliente_codigo?: string;
  convenio_nome: string;
  medico_nome: string;
  crm: string;
  paciente: string;
  procedimento: string;
  vendedor_nome: string;
  status: StatusVenda;
  valor_total: number;
  valor_consumido: number;
  valor_devolvido: number;
  margem_pct: number;
  created_at: string;
}

export interface VendaItem {
  id: string;
  venda_id: string;
  produto_codigo: string;
  descricao: string;
  lote: string;
  numero_serie?: string;
  quantidade: number;
  qtd_devolvida: number;
  qtd_consumida: number;
  valor_unitario: number;
  valor_total: number;
  valor_consumido: number;
}

export interface ComissaoRegra {
  id: string;
  nome: string;
  alvo: 'Vendedor' | 'Supervisor' | 'Gerente';
  percentual: number;
  ativo: boolean;
}

export interface MetaVenda {
  id: string;
  vendedor_nome: string;
  ano: number;
  mes: number;
  valor_meta: number;
  valor_atingido: number;
}

// Frota
export interface Veiculo {
  id: string;
  placa: string;
  frota: string;
  marca: string;
  modelo: string;
  ano: number;
  renavam?: string;
  chassi?: string;
  cor: string;
  tipo_veiculo: 'Passeio' | 'Utilitário' | 'Van' | 'Caminhão';
  combustivel: 'Flex' | 'Gasolina' | 'Diesel';
  km_atual: number;
  responsavel_nome: string;
  situacao: 'Ativo' | 'Em Manutenção' | 'Avariado' | 'Inativo';
}

export interface Condutor {
  id: string;
  nome: string;
  cpf: string;
  cnh: string;
  categoria_cnh: string;
  validade_cnh: string;
  cargo: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
}

export interface Abastecimento {
  id: string;
  veiculo_placa: string;
  condutor_nome: string;
  data: string;
  km_atual: number;
  posto: string;
  combustivel: string;
  litros: number;
  valor_litro: number;
  valor_total: number;
  km_percorrido?: number;
  km_por_litro?: number;
}

export interface Manutencao {
  id: string;
  veiculo_placa: string;
  tipo: 'Preventiva' | 'Corretiva';
  data: string;
  oficina: string;
  km: number;
  descricao: string;
  valor: number;
}

export interface VistoriaPonto {
  ponto_id: number;
  nome: string;
  vista: 'Frente' | 'Traseira' | 'Lateral Direita' | 'Lateral Esquerda';
  status: 'ok' | 'avaria';
  foto_url?: string;
  observacao?: string;
}

export interface ChecklistFrota {
  id: string;
  veiculo_placa: string;
  condutor_nome: string;
  tipo: 'Saída' | 'Retorno';
  data: string;
  km: number;
  pontos_vistorias: VistoriaPonto[];
  assinatura_url?: string;
  tem_avaria: boolean;
}

-- =====================================================================
-- OPME PRESTY — ESQUEMA CANÔNICO V2.0
-- SaaS Single Tenant — Gestão de Protocolo OPME, Mapa Cirúrgico,
-- Estoque Operacional e Logística
-- Sem módulos financeiros | Sem multi-tenant | Conforme Spec V2.0
-- =====================================================================

-- IMPORTANTE: Esta migration substitui a V1.0 anterior.
-- Executar em ambiente Supabase limpo ou após DROP/RECREATE das tabelas antigas.

-- =====================================================================
-- 1. EXTENSÕES E CONFIGURAÇÃO
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================================
-- 2. ENUMS V2.0 (somente estados conformes com a especificação)
-- =====================================================================

-- Papéis operacionais do sistema
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM (
    'admin',
    'gestor',
    'vendedor',
    'estoque',
    'logistica',
    'motorista',
    'operador',
    'auditor'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status dos Protocolos OPME (seção 8 da spec)
DO $$ BEGIN
  CREATE TYPE status_protocolo AS ENUM (
    'RASCUNHO',
    'AGUARDANDO_AUTORIZACAO',
    'AUTORIZADO',
    'CANCELADO',
    'FINALIZADO'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status das Autorizações (seção 9)
DO $$ BEGIN
  CREATE TYPE status_autorizacao AS ENUM (
    'PENDENTE',
    'AUTORIZADA',
    'NAO_AUTORIZADA',
    'CANCELADA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status das Cirurgias no Mapa (seção 13)
DO $$ BEGIN
  CREATE TYPE status_cirurgia AS ENUM (
    'AGUARDANDO_AUTORIZACAO',
    'AUTORIZADA_E_AGENDADA',
    'SOB_CONSIGNACAO',
    'NAO_AUTORIZADA',
    'REALIZADA',
    'CANCELADA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status dos Equipamentos (seção 22)
DO $$ BEGIN
  CREATE TYPE status_equipamento AS ENUM (
    'DISPONIVEL',
    'RESERVADO',
    'SEPARADO',
    'EM_TRANSITO',
    'EM_CAMPO',
    'EM_USO',
    'AGUARDANDO_RETORNO',
    'RETORNADO',
    'HIGIENIZACAO',
    'MANUTENCAO',
    'BLOQUEADO'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status das Reservas (seção 16)
DO $$ BEGIN
  CREATE TYPE status_reserva AS ENUM (
    'PENDENTE',
    'CONFIRMADA',
    'SEPARADA',
    'CANCELADA',
    'UTILIZADA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tipos de Operação Logística (seção 25)
DO $$ BEGIN
  CREATE TYPE tipo_operacao_logistica AS ENUM (
    'ENTREGA',
    'RETIRADA',
    'RETORNO',
    'TRANSFERENCIA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status das Ordens de Serviço
DO $$ BEGIN
  CREATE TYPE status_os AS ENUM (
    'PENDENTE',
    'ATRIBUIDA',
    'EM_EXECUCAO',
    'CONCLUIDA',
    'CANCELADA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status das Rotas
DO $$ BEGIN
  CREATE TYPE status_rota AS ENUM (
    'PLANEJADA',
    'EM_EXECUCAO',
    'CONCLUIDA',
    'CANCELADA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tipos de movimentação operacional (sem conotação financeira)
DO $$ BEGIN
  CREATE TYPE tipo_movimentacao AS ENUM (
    'ENTRADA',
    'RESERVA',
    'SEPARACAO',
    'ENTREGA',
    'RETORNO',
    'TRANSFERENCIA',
    'AJUSTE',
    'DESCARTE'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Severidade de auditoria
DO $$ BEGIN
  CREATE TYPE severidade_audit AS ENUM ('baixa', 'media', 'alta', 'critica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =====================================================================
-- 3. CORE — EMPRESA (Entidade Raiz Institucional — Single Tenant)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  ie VARCHAR(50),
  endereco TEXT,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  telefone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  logo_url TEXT,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 4. USUÁRIOS E CONTROLE DE ACESSO (RBAC)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14),
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  avatar_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'operador',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_role UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  pode_visualizar BOOLEAN DEFAULT TRUE,
  pode_criar BOOLEAN DEFAULT FALSE,
  pode_editar BOOLEAN DEFAULT FALSE,
  pode_cancelar BOOLEAN DEFAULT FALSE,
  pode_autorizar BOOLEAN DEFAULT FALSE,
  pode_reservar BOOLEAN DEFAULT FALSE,
  pode_separar BOOLEAN DEFAULT FALSE,
  pode_conferir BOOLEAN DEFAULT FALSE,
  pode_entregar BOOLEAN DEFAULT FALSE,
  pode_registrar_uso BOOLEAN DEFAULT FALSE,
  pode_registrar_retorno BOOLEAN DEFAULT FALSE,
  pode_exportar BOOLEAN DEFAULT FALSE,
  CONSTRAINT uq_modulo_role UNIQUE (modulo_id, role)
);

-- =====================================================================
-- 5. CADASTROS AUXILIARES
-- =====================================================================

-- Especialidades médicas
CREATE TABLE IF NOT EXISTS public.especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospitais
CREATE TABLE IF NOT EXISTS public.hospitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  cnpj VARCHAR(18),
  endereco TEXT,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  telefone VARCHAR(20),
  email VARCHAR(100),
  contato_principal VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Centros Cirúrgicos
CREATE TABLE IF NOT EXISTS public.centros_cirurgicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitais(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salas Cirúrgicas
CREATE TABLE IF NOT EXISTS public.salas_cirurgicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_cirurgico_id UUID NOT NULL REFERENCES public.centros_cirurgicos(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE
);

-- Médicos
CREATE TABLE IF NOT EXISTS public.medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  crm VARCHAR(20),
  uf_crm VARCHAR(2),
  especialidade VARCHAR(100),
  telefone VARCHAR(20),
  email VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pacientes (dados mínimos — princípio de minimização, seção 38)
CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  data_nascimento DATE,
  telefone VARCHAR(20),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procedimentos
CREATE TABLE IF NOT EXISTS public.procedimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  especialidade VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convênios
CREATE TABLE IF NOT EXISTS public.convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  registro VARCHAR(50),
  ans_codigo VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendedores / Representantes
CREATE TABLE IF NOT EXISTS public.vendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  nome VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 6. PRODUTOS (ESTOQUE OPERACIONAL — SEM CAMPOS FINANCEIROS, seção 18)
-- =====================================================================

-- Fabricantes
CREATE TABLE IF NOT EXISTS public.fabricantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  cnpj VARCHAR(18),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias de Produtos
CREATE TABLE IF NOT EXISTS public.categorias_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE
);

-- Unidades de Medida
CREATE TABLE IF NOT EXISTS public.unidades_medida (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  descricao VARCHAR(50) NOT NULL
);

-- Produtos / Materiais OPME (seção 19)
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(100) UNIQUE NOT NULL,
  descricao VARCHAR(500) NOT NULL,
  categoria_id UUID REFERENCES public.categorias_produtos(id),
  categoria VARCHAR(100),
  fabricante_id UUID REFERENCES public.fabricantes(id),
  fabricante VARCHAR(100),
  unidade_id UUID REFERENCES public.unidades_medida(id),
  unidade VARCHAR(20) DEFAULT 'UN',
  anvisa VARCHAR(50),
  controla_lote BOOLEAN DEFAULT TRUE,
  controla_validade BOOLEAN DEFAULT TRUE,
  controla_serie BOOLEAN DEFAULT FALSE,
  -- SEM CAMPOS FINANCEIROS (valor_custo, valor_venda proibidos — seção 6)
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kits (seção 20)
CREATE TABLE IF NOT EXISTS public.kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(100) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) DEFAULT 'CIRURGICO',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kit_componentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  quantidade INT NOT NULL DEFAULT 1,
  CONSTRAINT uq_kit_produto UNIQUE (kit_id, produto_id)
);

-- =====================================================================
-- 7. ESTOQUE OPERACIONAL (seções 16-18)
-- =====================================================================

-- Localizações físicas de estoque
CREATE TABLE IF NOT EXISTS public.localizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'GALPAO', -- GALPAO, CARRO, HOSPITAL, EXTERNO
  ativo BOOLEAN DEFAULT TRUE
);

-- Lotes e Saldos (sem valor financeiro — seção 6)
CREATE TABLE IF NOT EXISTS public.estoques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  localizacao_id UUID REFERENCES public.localizacoes(id),
  lote VARCHAR(100) NOT NULL,
  numero_serie VARCHAR(100),
  validade DATE,
  fabricacao DATE,
  quantidade_disponivel INT NOT NULL DEFAULT 0,
  quantidade_reservada INT NOT NULL DEFAULT 0,
  CONSTRAINT chk_saldo_positivo CHECK (quantidade_disponivel >= 0),
  CONSTRAINT uq_produto_lote_loc UNIQUE (produto_id, lote, localizacao_id)
);

-- Movimentações Operacionais (seção 17 — rastreabilidade, sem baixa financeira)
CREATE TABLE IF NOT EXISTS public.movimentacoes_operacionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  estoque_id UUID REFERENCES public.estoques(id),
  tipo tipo_movimentacao NOT NULL,
  quantidade INT NOT NULL,
  lote VARCHAR(100),
  numero_serie VARCHAR(100),
  localizacao_origem_id UUID REFERENCES public.localizacoes(id),
  localizacao_destino_id UUID REFERENCES public.localizacoes(id),
  -- Rastreabilidade operacional
  protocolo_id UUID,  -- FK para protocolos_opme (adicionada depois)
  cirurgia_id UUID,   -- FK para cirurgias (adicionada depois)
  reserva_id UUID,    -- FK para reservas (adicionada depois)
  os_id UUID,         -- FK para ordens_servico (adicionada depois)
  responsavel_id UUID REFERENCES public.profiles(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 8. PROTOCOLO OPME (seção 8)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.protocolos_opme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_it VARCHAR(50) UNIQUE NOT NULL,        -- Número IT do Excel
  numero_protocolo VARCHAR(50) UNIQUE,           -- Número interno PROT-XXXXX
  hospital_id UUID REFERENCES public.hospitais(id),
  hospital_nome VARCHAR(255),                    -- Desnormalizado para performance
  medico_id UUID REFERENCES public.medicos(id),
  medico_nome VARCHAR(255),
  paciente_id UUID REFERENCES public.pacientes(id),
  paciente VARCHAR(255) NOT NULL,                -- Nome para exibição rápida
  procedimento_id UUID REFERENCES public.procedimentos(id),
  procedimento_nome VARCHAR(255),
  convenio_id UUID REFERENCES public.convenios(id),
  convenio_nome VARCHAR(255),
  vendedor_id UUID REFERENCES public.vendedores(id),
  vendedor_nome VARCHAR(255),
  status status_protocolo NOT NULL DEFAULT 'RASCUNHO',
  data_protocolo DATE DEFAULT CURRENT_DATE,
  data_cirurgia DATE,                            -- Obrigatória apenas quando AUTORIZADO
  observacoes TEXT,
  documentos JSONB DEFAULT '[]',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens do Protocolo
CREATE TABLE IF NOT EXISTS public.protocolo_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id UUID NOT NULL REFERENCES public.protocolos_opme(id) ON DELETE CASCADE,
  numero_it VARCHAR(50),                         -- ex: 559879-01
  produto_id UUID REFERENCES public.produtos(id),
  produto_codigo VARCHAR(100),
  descricao_produto VARCHAR(500) NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  indicacao VARCHAR(100),                        -- PRIMEIRA, SEGUNDA, TERCEIRA, etc.
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 9. AUTORIZAÇÕES (seção 9)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.autorizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id UUID NOT NULL REFERENCES public.protocolos_opme(id) ON DELETE CASCADE,
  numero_autorizacao VARCHAR(100),
  status status_autorizacao NOT NULL DEFAULT 'PENDENTE',
  data_autorizacao DATE,
  data_validade DATE,
  responsavel_autorizacao VARCHAR(255),
  observacoes TEXT,
  documentos JSONB DEFAULT '[]',
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 10. CIRURGIAS — MAPA CIRÚRGICO (seção 11-13)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_it VARCHAR(50) UNIQUE,                  -- Referência ao IT do protocolo
  protocolo_id UUID REFERENCES public.protocolos_opme(id),
  autorizacao_id UUID REFERENCES public.autorizacoes(id),
  status status_cirurgia NOT NULL DEFAULT 'AGUARDANDO_AUTORIZACAO',
  data DATE NOT NULL,
  horario TIME NOT NULL,
  hospital_id UUID NOT NULL REFERENCES public.hospitais(id),
  hospital_nome VARCHAR(255) NOT NULL,
  centro_cirurgico_id UUID REFERENCES public.centros_cirurgicos(id),
  sala VARCHAR(100),
  medico_id UUID REFERENCES public.medicos(id),
  medico_nome VARCHAR(255) NOT NULL,
  paciente VARCHAR(255) NOT NULL,
  procedimento_id UUID REFERENCES public.procedimentos(id),
  procedimento_nome VARCHAR(255),
  convenio_id UUID REFERENCES public.convenios(id),
  convenio_nome VARCHAR(255),
  vendedor_id UUID REFERENCES public.vendedores(id),
  vendedor_nome VARCHAR(255),
  observacoes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraints de integridade do fluxo (seção 14)
  CONSTRAINT chk_data_futura_ou_hoje CHECK (data >= CURRENT_DATE - INTERVAL '1 year')
);

-- Materiais necessários para a cirurgia
CREATE TABLE IF NOT EXISTS public.cirurgia_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  produto_codigo VARCHAR(100),
  descricao_produto VARCHAR(500) NOT NULL,
  quantidade_necessaria INT NOT NULL DEFAULT 1,
  quantidade_reservada INT DEFAULT 0,
  quantidade_utilizada INT DEFAULT 0,
  quantidade_retornada INT DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipamentos necessários para a cirurgia
CREATE TABLE IF NOT EXISTS public.cirurgia_equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  equipamento_id UUID,  -- FK adicionada depois
  equipamento_nome VARCHAR(255) NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  status_requisicao VARCHAR(50) DEFAULT 'PENDENTE',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 11. RESERVAS DE MATERIAIS (seção 16)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE RESTRICT,
  protocolo_id UUID REFERENCES public.protocolos_opme(id),
  status status_reserva NOT NULL DEFAULT 'PENDENTE',
  data_reserva TIMESTAMPTZ DEFAULT NOW(),
  data_necessidade DATE,
  observacoes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reserva_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES public.reservas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  estoque_id UUID REFERENCES public.estoques(id),
  quantidade_solicitada INT NOT NULL DEFAULT 1,
  quantidade_reservada INT DEFAULT 0,
  quantidade_separada INT DEFAULT 0,
  quantidade_utilizada INT DEFAULT 0,
  quantidade_retornada INT DEFAULT 0,
  lote VARCHAR(100),
  numero_serie VARCHAR(100),
  status status_reserva DEFAULT 'PENDENTE',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 12. EQUIPAMENTOS (seção 21)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.equipamentos_modelos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(100) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  fabricante VARCHAR(255),
  categoria VARCHAR(100),
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id UUID REFERENCES public.equipamentos_modelos(id),
  codigo_patrimonio VARCHAR(100) UNIQUE NOT NULL,
  numero_serie VARCHAR(100) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  fabricante VARCHAR(255),
  categoria VARCHAR(100),
  localizacao_atual_id UUID REFERENCES public.localizacoes(id),
  localizacao_descricao VARCHAR(255),
  status status_equipamento NOT NULL DEFAULT 'DISPONIVEL',
  cirurgia_vinculada_id UUID REFERENCES public.cirurgias(id),
  disponivel_para_reserva BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.equipamentos_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id),
  tipo VARCHAR(50) NOT NULL,
  status_anterior status_equipamento,
  status_novo status_equipamento,
  localizacao_origem_id UUID REFERENCES public.localizacoes(id),
  localizacao_destino_id UUID REFERENCES public.localizacoes(id),
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  os_id UUID,  -- FK adicionada depois
  responsavel_id UUID REFERENCES public.profiles(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.equipamentos_manutencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id),
  tipo VARCHAR(100) NOT NULL,
  descricao TEXT,
  data_entrada DATE DEFAULT CURRENT_DATE,
  data_prevista_retorno DATE,
  data_retorno DATE,
  responsavel VARCHAR(255),
  status VARCHAR(50) DEFAULT 'EM_MANUTENCAO',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.equipamentos_higienizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id),
  data DATE DEFAULT CURRENT_DATE,
  responsavel VARCHAR(255),
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'CONCLUIDA',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualiza FK de equipamentos
ALTER TABLE public.cirurgia_equipamentos 
  ADD CONSTRAINT fk_ce_equipamento 
  FOREIGN KEY (equipamento_id) REFERENCES public.equipamentos(id) ON DELETE SET NULL;

-- =====================================================================
-- 13. LOGÍSTICA — ORDENS DE SERVIÇO (seção 24)
-- =====================================================================

-- Motoristas e Veículos (seção 46)
CREATE TABLE IF NOT EXISTS public.motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  cnh VARCHAR(20),
  categoria_cnh VARCHAR(5),
  validade_cnh DATE,
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(10) UNIQUE NOT NULL,
  modelo VARCHAR(100),
  marca VARCHAR(50),
  ano INT,
  tipo VARCHAR(50) DEFAULT 'UTILITARIO',
  capacidade_descricao TEXT,
  motorista_padrao_id UUID REFERENCES public.motoristas(id),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ordens de Serviço Logísticas (seção 24)
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  hospital_id UUID REFERENCES public.hospitais(id),
  hospital_nome VARCHAR(255),
  endereco_entrega TEXT,
  tipo tipo_operacao_logistica NOT NULL DEFAULT 'ENTREGA',
  motorista_id UUID REFERENCES public.motoristas(id),
  motorista_nome VARCHAR(255),
  veiculo_id UUID REFERENCES public.veiculos(id),
  veiculo_placa VARCHAR(10),
  data_planejada DATE,
  horario_planejado TIME,
  data_execucao TIMESTAMPTZ,
  status status_os NOT NULL DEFAULT 'PENDENTE',
  observacoes TEXT,
  comprovante_url TEXT,
  responsavel_recebimento VARCHAR(255),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ordem_servico_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,  -- 'MATERIAL' | 'EQUIPAMENTO'
  produto_id UUID REFERENCES public.produtos(id),
  equipamento_id UUID REFERENCES public.equipamentos(id),
  descricao VARCHAR(500) NOT NULL,
  quantidade INT DEFAULT 1,
  lote VARCHAR(100),
  numero_serie VARCHAR(100),
  divergencia BOOLEAN DEFAULT FALSE,
  divergencia_descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualiza FK de equipamentos_movimentacoes
ALTER TABLE public.equipamentos_movimentacoes
  ADD CONSTRAINT fk_em_os 
  FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id) ON DELETE SET NULL;

-- =====================================================================
-- 14. ROTAS (seção 26)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  data DATE NOT NULL,
  motorista_id UUID REFERENCES public.motoristas(id),
  veiculo_id UUID REFERENCES public.veiculos(id),
  status status_rota NOT NULL DEFAULT 'PLANEJADA',
  horario_partida_planejado TIME,
  horario_partida_real TIMESTAMPTZ,
  horario_retorno_planejado TIME,
  horario_retorno_real TIMESTAMPTZ,
  km_inicial INT,
  km_final INT,
  observacoes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rota_paradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rota_id UUID NOT NULL REFERENCES public.rotas(id) ON DELETE CASCADE,
  os_id UUID REFERENCES public.ordens_servico(id),
  sequencia INT NOT NULL,
  endereco TEXT NOT NULL,
  hospital_id UUID REFERENCES public.hospitais(id),
  tipo tipo_operacao_logistica NOT NULL,
  horario_planejado TIME,
  horario_chegada TIMESTAMPTZ,
  horario_saida TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  observacoes TEXT
);

-- =====================================================================
-- 15. ENTREGAS E RETORNOS (seções 27-28)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id),
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  data_hora_entrega TIMESTAMPTZ DEFAULT NOW(),
  motorista_id UUID REFERENCES public.motoristas(id),
  veiculo_id UUID REFERENCES public.veiculos(id),
  responsavel_recebimento VARCHAR(255),
  assinatura_url TEXT,
  comprovante_url TEXT,
  divergencias BOOLEAN DEFAULT FALSE,
  divergencias_descricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.entrega_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrega_id UUID NOT NULL REFERENCES public.entregas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  produto_id UUID REFERENCES public.produtos(id),
  equipamento_id UUID REFERENCES public.equipamentos(id),
  descricao VARCHAR(500) NOT NULL,
  quantidade_entregue INT NOT NULL DEFAULT 1,
  lote VARCHAR(100),
  numero_serie VARCHAR(100),
  divergencia BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.retornos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES public.ordens_servico(id),
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  data_hora_retorno TIMESTAMPTZ DEFAULT NOW(),
  motorista_id UUID REFERENCES public.motoristas(id),
  responsavel_conferencia_id UUID REFERENCES public.profiles(id),
  divergencias BOOLEAN DEFAULT FALSE,
  divergencias_descricao TEXT,
  status_conferencia VARCHAR(50) DEFAULT 'PENDENTE',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.retorno_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retorno_id UUID NOT NULL REFERENCES public.retornos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  produto_id UUID REFERENCES public.produtos(id),
  equipamento_id UUID REFERENCES public.equipamentos(id),
  descricao VARCHAR(500) NOT NULL,
  quantidade_retornada INT NOT NULL DEFAULT 0,
  lote VARCHAR(100),
  numero_serie VARCHAR(100),
  condicao VARCHAR(50) DEFAULT 'BOM_ESTADO', -- BOM_ESTADO, DANIFICADO, PERDIDO
  divergencia BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 16. CONTROLE DE USO (seção 17)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.controle_uso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE RESTRICT,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  reserva_item_id UUID REFERENCES public.reserva_itens(id),
  lote VARCHAR(100),
  numero_serie VARCHAR(100),
  quantidade_reservada INT DEFAULT 0,
  quantidade_separada INT DEFAULT 0,
  quantidade_utilizada INT NOT NULL DEFAULT 0,
  quantidade_nao_utilizada INT DEFAULT 0,
  quantidade_retornada INT DEFAULT 0,
  responsavel_id UUID REFERENCES public.profiles(id),
  data_hora_registro TIMESTAMPTZ DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_uso_coerente CHECK (
    quantidade_utilizada + quantidade_nao_utilizada <= quantidade_separada + 10
  )
);

-- =====================================================================
-- 17. AUDITORIA E EVENTOS OPERACIONAIS (seções 32-33)
-- =====================================================================

-- Auditoria técnica (seção 32)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id),
  usuario_email VARCHAR(255),
  usuario_role VARCHAR(50),
  modulo VARCHAR(100) NOT NULL,
  entidade VARCHAR(100) NOT NULL,
  registro_id UUID,
  acao VARCHAR(100) NOT NULL,
  valor_anterior JSONB,
  valor_novo JSONB,
  ip VARCHAR(50),
  user_agent TEXT,
  severidade severidade_audit DEFAULT 'media',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos operacionais de negócio (seção 33) — Timeline da cirurgia
CREATE TABLE IF NOT EXISTS public.operational_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(100) NOT NULL,   -- Ex: PROTOCOLO_AUTORIZADO, CIRURGIA_ADICIONADA_MAPA
  descricao TEXT NOT NULL,
  protocolo_id UUID REFERENCES public.protocolos_opme(id),
  autorizacao_id UUID REFERENCES public.autorizacoes(id),
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  reserva_id UUID REFERENCES public.reservas(id),
  os_id UUID REFERENCES public.ordens_servico(id),
  usuario_id UUID REFERENCES public.profiles(id),
  metadados JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 18. NOTIFICAÇÕES (seção 31)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id),
  tipo VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  protocolo_id UUID REFERENCES public.protocolos_opme(id),
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  link_acao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,  -- MATERIAL_INDISPONIVEL, EQUIPAMENTO_INDISPONIVEL, VENCIMENTO, etc.
  severidade VARCHAR(20) DEFAULT 'MEDIA',
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  entidade VARCHAR(50),
  entidade_id UUID,
  resolvido BOOLEAN DEFAULT FALSE,
  resolvido_por UUID REFERENCES public.profiles(id),
  resolvido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 19. CONFIGURAÇÕES DO SISTEMA
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor JSONB,
  descricao TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 20. ATUALIZAR FKs CIRCULARES
-- =====================================================================
ALTER TABLE public.movimentacoes_operacionais
  ADD CONSTRAINT fk_mov_protocolo FOREIGN KEY (protocolo_id) REFERENCES public.protocolos_opme(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_mov_cirurgia FOREIGN KEY (cirurgia_id) REFERENCES public.cirurgias(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_mov_reserva FOREIGN KEY (reserva_id) REFERENCES public.reservas(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_mov_os FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id) ON DELETE SET NULL;

-- =====================================================================
-- 21. FUNÇÕES AUXILIARES (SECURITY DEFINER)
-- =====================================================================

-- Verifica se usuário tem papel
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role app_role)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
END;
$$;

-- Retorna papel do usuário corrente
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS app_role LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_role app_role;
BEGIN
  SELECT role INTO v_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
  RETURN COALESCE(v_role, 'operador');
END;
$$;

-- Trigger: Criar perfil ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_is_first BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    updated_at = NOW();

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO v_is_first;
  IF v_is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operador') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- Aplica trigger updated_at em todas tabelas relevantes
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'empresa','profiles','hospitais','medicos','pacientes','vendedores',
    'protocolos_opme','autorizacoes','cirurgias','reservas','reserva_itens',
    'equipamentos','ordens_servico','rotas'
  ) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON public.%I', r.tablename);
    EXECUTE format('CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', r.tablename);
  END LOOP;
END $$;

-- Trigger: Atualizar saldo do estoque ao registrar movimentação operacional
CREATE OR REPLACE FUNCTION public.atualizar_saldo_estoque()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.tipo = 'ENTRADA' THEN
    UPDATE public.estoques
    SET quantidade_disponivel = quantidade_disponivel + NEW.quantidade
    WHERE id = NEW.estoque_id;
  ELSIF NEW.tipo = 'RESERVA' THEN
    UPDATE public.estoques
    SET quantidade_disponivel = GREATEST(0, quantidade_disponivel - NEW.quantidade),
        quantidade_reservada = quantidade_reservada + NEW.quantidade
    WHERE id = NEW.estoque_id;
  ELSIF NEW.tipo IN ('ENTREGA', 'DESCARTE') THEN
    UPDATE public.estoques
    SET quantidade_reservada = GREATEST(0, quantidade_reservada - NEW.quantidade)
    WHERE id = NEW.estoque_id;
  ELSIF NEW.tipo = 'RETORNO' THEN
    UPDATE public.estoques
    SET quantidade_disponivel = quantidade_disponivel + NEW.quantidade,
        quantidade_reservada = GREATEST(0, quantidade_reservada - NEW.quantidade)
    WHERE id = NEW.estoque_id;
  ELSIF NEW.tipo = 'AJUSTE' THEN
    UPDATE public.estoques
    SET quantidade_disponivel = GREATEST(0, quantidade_disponivel + NEW.quantidade)
    WHERE id = NEW.estoque_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_atualizar_saldo ON public.movimentacoes_operacionais;
CREATE TRIGGER trg_atualizar_saldo
  AFTER INSERT ON public.movimentacoes_operacionais
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_saldo_estoque();

-- Trigger: Gerar evento operacional ao atualizar status do protocolo
CREATE OR REPLACE FUNCTION public.protocolo_status_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.operational_events (tipo, descricao, protocolo_id, usuario_id, metadados)
    VALUES (
      'PROTOCOLO_STATUS_ALTERADO',
      format('Status do protocolo %s alterado de %s para %s', NEW.numero_it, OLD.status, NEW.status),
      NEW.id,
      auth.uid(),
      jsonb_build_object('status_anterior', OLD.status, 'status_novo', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protocolo_status ON public.protocolos_opme;
CREATE TRIGGER trg_protocolo_status
  AFTER UPDATE ON public.protocolos_opme
  FOR EACH ROW EXECUTE FUNCTION public.protocolo_status_event();

-- Trigger: Gerar evento operacional ao atualizar status da cirurgia
CREATE OR REPLACE FUNCTION public.cirurgia_status_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.operational_events (tipo, descricao, cirurgia_id, protocolo_id, usuario_id, metadados)
    VALUES (
      'CIRURGIA_STATUS_ALTERADO',
      format('Status da cirurgia %s alterado para %s', COALESCE(NEW.numero_it, NEW.id::TEXT), NEW.status),
      NEW.id,
      NEW.protocolo_id,
      auth.uid(),
      jsonb_build_object('status_anterior', OLD.status, 'status_novo', NEW.status, 'data_cirurgia', NEW.data)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cirurgia_status ON public.cirurgias;
CREATE TRIGGER trg_cirurgia_status
  AFTER UPDATE ON public.cirurgias
  FOR EACH ROW EXECUTE FUNCTION public.cirurgia_status_event();

-- Número automático para OS
CREATE OR REPLACE FUNCTION public.gerar_numero_os()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    NEW.numero = 'OS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(
      (SELECT COUNT(*) + 1 FROM public.ordens_servico WHERE DATE(created_at) = CURRENT_DATE)::TEXT, 4, '0'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gerar_numero_os ON public.ordens_servico;
CREATE TRIGGER trg_gerar_numero_os
  BEFORE INSERT ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.gerar_numero_os();

-- =====================================================================
-- 22. ÍNDICES DE PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_protocolos_numero_it ON public.protocolos_opme (numero_it);
CREATE INDEX IF NOT EXISTS idx_protocolos_status ON public.protocolos_opme (status);
CREATE INDEX IF NOT EXISTS idx_protocolos_data_cirurgia ON public.protocolos_opme (data_cirurgia);
CREATE INDEX IF NOT EXISTS idx_protocolos_vendedor ON public.protocolos_opme (vendedor_id);
CREATE INDEX IF NOT EXISTS idx_protocolos_hospital ON public.protocolos_opme (hospital_id);
CREATE INDEX IF NOT EXISTS idx_protocolos_medico ON public.protocolos_opme (medico_id);
CREATE INDEX IF NOT EXISTS idx_protocolos_updated_at ON public.protocolos_opme (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_cirurgias_data ON public.cirurgias (data);
CREATE INDEX IF NOT EXISTS idx_cirurgias_status ON public.cirurgias (status);
CREATE INDEX IF NOT EXISTS idx_cirurgias_hospital ON public.cirurgias (hospital_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_medico ON public.cirurgias (medico_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_protocolo ON public.cirurgias (protocolo_id);

CREATE INDEX IF NOT EXISTS idx_autorizacoes_protocolo ON public.autorizacoes (protocolo_id);
CREATE INDEX IF NOT EXISTS idx_autorizacoes_status ON public.autorizacoes (status);

CREATE INDEX IF NOT EXISTS idx_reservas_cirurgia ON public.reservas (cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_reserva_itens_reserva ON public.reserva_itens (reserva_id);
CREATE INDEX IF NOT EXISTS idx_reserva_itens_produto ON public.reserva_itens (produto_id);

CREATE INDEX IF NOT EXISTS idx_estoques_produto ON public.estoques (produto_id);
CREATE INDEX IF NOT EXISTS idx_estoques_localizacao ON public.estoques (localizacao_id);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_cirurgia ON public.movimentacoes_operacionais (cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_protocolo ON public.movimentacoes_operacionais (protocolo_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created ON public.movimentacoes_operacionais (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_equipamentos_status ON public.equipamentos (status);
CREATE INDEX IF NOT EXISTS idx_equipamentos_localizacao ON public.equipamentos (localizacao_atual_id);

CREATE INDEX IF NOT EXISTS idx_os_cirurgia ON public.ordens_servico (cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_os_status ON public.ordens_servico (status);
CREATE INDEX IF NOT EXISTS idx_os_data ON public.ordens_servico (data_planejada);

CREATE INDEX IF NOT EXISTS idx_operational_events_cirurgia ON public.operational_events (cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_operational_events_protocolo ON public.operational_events (protocolo_id);
CREATE INDEX IF NOT EXISTS idx_operational_events_created ON public.operational_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_usuario ON public.notifications (usuario_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lida ON public.notifications (lida) WHERE lida = FALSE;

CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs (usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidade ON public.audit_logs (entidade, registro_id);

-- Text search index
CREATE INDEX IF NOT EXISTS idx_protocolos_fts ON public.protocolos_opme 
  USING GIN(to_tsvector('portuguese', COALESCE(numero_it,'') || ' ' || COALESCE(paciente,'') || ' ' || COALESCE(medico_nome,'') || ' ' || COALESCE(hospital_nome,'')));

-- =====================================================================
-- 23. ROW LEVEL SECURITY (RLS)
-- =====================================================================
ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centros_cirurgicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas_cirurgicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabricantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades_medida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_componentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_operacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolos_opme ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolo_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autorizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos_modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos_manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos_higienizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordem_servico_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rota_paradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrega_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retornos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retorno_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controle_uso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso

-- Empresa: todos autenticados leem, admin gerencia
DROP POLICY IF EXISTS "empresa_read" ON public.empresa;
CREATE POLICY "empresa_read" ON public.empresa FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "empresa_admin" ON public.empresa;
CREATE POLICY "empresa_admin" ON public.empresa FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: autenticados leem todos, cada um edita o próprio
DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_admin" ON public.profiles;
CREATE POLICY "profiles_admin" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Roles: admin gerencia, usuário vê o próprio
DROP POLICY IF EXISTS "user_roles_read" ON public.user_roles;
CREATE POLICY "user_roles_read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "user_roles_admin" ON public.user_roles;
CREATE POLICY "user_roles_admin" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Cadastros auxiliares: todos autenticados podem ler e criar/editar
DROP POLICY IF EXISTS "cadastros_full" ON public.hospitais;
CREATE POLICY "cadastros_full" ON public.hospitais FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cadastros_full" ON public.medicos;
CREATE POLICY "cadastros_full" ON public.medicos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cadastros_full" ON public.pacientes;
CREATE POLICY "cadastros_full" ON public.pacientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cadastros_full" ON public.procedimentos;
CREATE POLICY "cadastros_full" ON public.procedimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cadastros_full" ON public.convenios;
CREATE POLICY "cadastros_full" ON public.convenios FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cadastros_full" ON public.vendedores;
CREATE POLICY "cadastros_full" ON public.vendedores FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cadastros_full" ON public.centros_cirurgicos;
CREATE POLICY "cadastros_full" ON public.centros_cirurgicos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cadastros_full" ON public.salas_cirurgicas;
CREATE POLICY "cadastros_full" ON public.salas_cirurgicas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Produtos e estoque: todos autenticados operam
DROP POLICY IF EXISTS "produtos_full" ON public.produtos;
CREATE POLICY "produtos_full" ON public.produtos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "estoques_full" ON public.estoques;
CREATE POLICY "estoques_full" ON public.estoques FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "movimentacoes_full" ON public.movimentacoes_operacionais;
CREATE POLICY "movimentacoes_full" ON public.movimentacoes_operacionais FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "categorias_full" ON public.categorias_produtos;
CREATE POLICY "categorias_full" ON public.categorias_produtos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fabricantes_full" ON public.fabricantes;
CREATE POLICY "fabricantes_full" ON public.fabricantes FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "unidades_full" ON public.unidades_medida;
CREATE POLICY "unidades_full" ON public.unidades_medida FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "localizacoes_full" ON public.localizacoes;
CREATE POLICY "localizacoes_full" ON public.localizacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "kits_full" ON public.kits;
CREATE POLICY "kits_full" ON public.kits FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "kit_componentes_full" ON public.kit_componentes;
CREATE POLICY "kit_componentes_full" ON public.kit_componentes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Protocolos: 
-- Vendedores veem apenas os seus; gestores/admin veem todos
DROP POLICY IF EXISTS "protocolos_vendedor" ON public.protocolos_opme;
CREATE POLICY "protocolos_vendedor" ON public.protocolos_opme FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'gestor') OR
  public.has_role(auth.uid(), 'auditor') OR
  vendedor_id IN (SELECT id FROM public.vendedores WHERE user_id = auth.uid()) OR
  created_by = auth.uid()
);
DROP POLICY IF EXISTS "protocolos_insert" ON public.protocolos_opme;
CREATE POLICY "protocolos_insert" ON public.protocolos_opme FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "protocolos_update" ON public.protocolos_opme;
CREATE POLICY "protocolos_update" ON public.protocolos_opme FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'gestor') OR
  created_by = auth.uid() OR
  vendedor_id IN (SELECT id FROM public.vendedores WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "protocolo_itens_full" ON public.protocolo_itens;
CREATE POLICY "protocolo_itens_full" ON public.protocolo_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Autorizações
DROP POLICY IF EXISTS "autorizacoes_full" ON public.autorizacoes;
CREATE POLICY "autorizacoes_full" ON public.autorizacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Cirurgias: todos autenticados podem ver e operar
DROP POLICY IF EXISTS "cirurgias_full" ON public.cirurgias;
CREATE POLICY "cirurgias_full" ON public.cirurgias FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cirurgia_materiais_full" ON public.cirurgia_materiais;
CREATE POLICY "cirurgia_materiais_full" ON public.cirurgia_materiais FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cirurgia_equipamentos_full" ON public.cirurgia_equipamentos;
CREATE POLICY "cirurgia_equipamentos_full" ON public.cirurgia_equipamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reservas e itens
DROP POLICY IF EXISTS "reservas_full" ON public.reservas;
CREATE POLICY "reservas_full" ON public.reservas FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "reserva_itens_full" ON public.reserva_itens;
CREATE POLICY "reserva_itens_full" ON public.reserva_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Equipamentos
DROP POLICY IF EXISTS "equipamentos_full" ON public.equipamentos;
CREATE POLICY "equipamentos_full" ON public.equipamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "equipamentos_modelos_full" ON public.equipamentos_modelos;
CREATE POLICY "equipamentos_modelos_full" ON public.equipamentos_modelos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "eq_movimentacoes_full" ON public.equipamentos_movimentacoes;
CREATE POLICY "eq_movimentacoes_full" ON public.equipamentos_movimentacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "eq_manutencoes_full" ON public.equipamentos_manutencoes;
CREATE POLICY "eq_manutencoes_full" ON public.equipamentos_manutencoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "eq_higienizacoes_full" ON public.equipamentos_higienizacoes;
CREATE POLICY "eq_higienizacoes_full" ON public.equipamentos_higienizacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Logística
DROP POLICY IF EXISTS "os_full" ON public.ordens_servico;
CREATE POLICY "os_full" ON public.ordens_servico FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "os_itens_full" ON public.ordem_servico_itens;
CREATE POLICY "os_itens_full" ON public.ordem_servico_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "rotas_full" ON public.rotas;
CREATE POLICY "rotas_full" ON public.rotas FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "rota_paradas_full" ON public.rota_paradas;
CREATE POLICY "rota_paradas_full" ON public.rota_paradas FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "motoristas_full" ON public.motoristas;
CREATE POLICY "motoristas_full" ON public.motoristas FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "veiculos_full" ON public.veiculos;
CREATE POLICY "veiculos_full" ON public.veiculos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Entregas e retornos
DROP POLICY IF EXISTS "entregas_full" ON public.entregas;
CREATE POLICY "entregas_full" ON public.entregas FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "entrega_itens_full" ON public.entrega_itens;
CREATE POLICY "entrega_itens_full" ON public.entrega_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "retornos_full" ON public.retornos;
CREATE POLICY "retornos_full" ON public.retornos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "retorno_itens_full" ON public.retorno_itens;
CREATE POLICY "retorno_itens_full" ON public.retorno_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "controle_uso_full" ON public.controle_uso;
CREATE POLICY "controle_uso_full" ON public.controle_uso FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auditoria: INSERT para todos autenticados, SELECT apenas admin/auditor
DROP POLICY IF EXISTS "audit_insert" ON public.audit_logs;
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "audit_read" ON public.audit_logs;
CREATE POLICY "audit_read" ON public.audit_logs FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'auditor')
);

-- Eventos operacionais: todos leem, autenticados inserem
DROP POLICY IF EXISTS "events_read" ON public.operational_events;
CREATE POLICY "events_read" ON public.operational_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "events_insert" ON public.operational_events;
CREATE POLICY "events_insert" ON public.operational_events FOR INSERT TO authenticated WITH CHECK (true);

-- Notificações: cada usuário vê as suas
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated USING (usuario_id = auth.uid());
DROP POLICY IF EXISTS "notifications_admin" ON public.notifications;
CREATE POLICY "notifications_admin" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Alertas: todos leem, admin/gestor gerencia
DROP POLICY IF EXISTS "alerts_read" ON public.alerts;
CREATE POLICY "alerts_read" ON public.alerts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "alerts_manage" ON public.alerts;
CREATE POLICY "alerts_manage" ON public.alerts FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor')
);

-- Configurações
DROP POLICY IF EXISTS "config_read" ON public.configuracoes;
CREATE POLICY "config_read" ON public.configuracoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "config_admin" ON public.configuracoes;
CREATE POLICY "config_admin" ON public.configuracoes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Módulos e Permissões
DROP POLICY IF EXISTS "modulos_read" ON public.modulos;
CREATE POLICY "modulos_read" ON public.modulos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "modulos_admin" ON public.modulos;
CREATE POLICY "modulos_admin" ON public.modulos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "permissoes_read" ON public.permissoes;
CREATE POLICY "permissoes_read" ON public.permissoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "permissoes_admin" ON public.permissoes;
CREATE POLICY "permissoes_admin" ON public.permissoes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Especialidades
DROP POLICY IF EXISTS "especialidades_full" ON public.especialidades;
CREATE POLICY "especialidades_full" ON public.especialidades FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- 24. STORAGE BUCKETS
-- =====================================================================
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES 
    ('documentos-opme', 'documentos-opme', false),
    ('comprovantes-logistica', 'comprovantes-logistica', false),
    ('assinaturas', 'assinaturas', false)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================================
-- 25. SEED INICIAL DE PRODUÇÃO (DADOS MÍNIMOS PARA OPERAÇÃO)
-- =====================================================================

-- Empresa (entidade raiz — Single Tenant)
INSERT INTO public.empresa (id, razao_social, nome_fantasia, cnpj, ie, endereco, cidade, estado, cep, telefone, email)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Presty Medick Distribuidora de OPME Ltda.',
  'Presty Medick OPME',
  '12.345.678/0001-90',
  '110.293.847.112',
  'Av. Paulista, 1500 - Bela Vista',
  'São Paulo',
  'SP',
  '01310-100',
  '(11) 3200-4000',
  'atendimento@prestymedick.com.br'
) ON CONFLICT (cnpj) DO NOTHING;

-- Módulos do Sistema
INSERT INTO public.modulos (codigo, nome) VALUES
  ('dashboard', 'Dashboard'),
  ('mapa_cirurgico', 'Mapa Cirúrgico'),
  ('protocolo_opme', 'Protocolo OPME'),
  ('autorizacao', 'Autorização'),
  ('estoque', 'Estoque'),
  ('equipamentos', 'Equipamentos'),
  ('logistica', 'Logística'),
  ('rotas', 'Rotas'),
  ('usuarios', 'Usuários e Permissões'),
  ('cadastros', 'Cadastros'),
  ('auditoria', 'Auditoria'),
  ('configuracoes', 'Configurações')
ON CONFLICT (codigo) DO NOTHING;

-- Unidades de Medida
INSERT INTO public.unidades_medida (codigo, descricao) VALUES
  ('UN', 'Unidade'),
  ('CX', 'Caixa'),
  ('KIT', 'Kit'),
  ('PAR', 'Par'),
  ('PCT', 'Pacote'),
  ('FR', 'Frasco'),
  ('AMP', 'Ampola'),
  ('ML', 'Mililitro')
ON CONFLICT (codigo) DO NOTHING;

-- Categorias de Produtos
INSERT INTO public.categorias_produtos (nome) VALUES
  ('Próteses Ortopédicas'),
  ('Implantes Cirúrgicos'),
  ('Materiais de Síntese'),
  ('Instrumentais Cirúrgicos'),
  ('Equipamentos Médicos'),
  ('Descartáveis Cirúrgicos'),
  ('Endoscopia e Laparoscopia'),
  ('Urologia'),
  ('Ginecologia'),
  ('Neurocirurgia'),
  ('Cardiovascular'),
  ('Consumíveis Gerais')
ON CONFLICT (nome) DO NOTHING;

-- Localizações padrão
INSERT INTO public.localizacoes (codigo, descricao, tipo) VALUES
  ('DEP-CENTRAL', 'Depósito Central', 'GALPAO'),
  ('DEP-FRIO', 'Câmara Fria / Validade Crítica', 'GALPAO'),
  ('DEP-CONSIG', 'Área de Consignação', 'GALPAO'),
  ('EXTERNO', 'Material em Campo (Hospital)', 'HOSPITAL'),
  ('RETORNO', 'Área de Retorno / Conferência', 'GALPAO')
ON CONFLICT (codigo) DO NOTHING;

-- Configurações padrão
INSERT INTO public.configuracoes (chave, valor, descricao) VALUES
  ('sistema_modo', '"operacional"', 'Modo de operação do sistema'),
  ('protocolo_prefixo', '"PROT"', 'Prefixo para numeração de protocolos'),
  ('os_prefixo', '"OS"', 'Prefixo para numeração de ordens de serviço'),
  ('notificacoes_ativas', 'true', 'Habilitar notificações do sistema'),
  ('dias_alerta_validade', '30', 'Dias de antecedência para alertas de validade')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================================
-- PRESTY MEDICK - ESQUEMA DE BANCO DE DADOS COMPLETO (SUPABASE / POSTGRES)
-- ERP SaaS para Distribuidora de OPME (Órteses, Próteses e Materiais Especiais)
-- Versão 2.0 - Prontidão para Produção com RLS, Índices, Triggers e Storage
-- =====================================================================

-- 1. EXTENSÕES & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE app_role AS ENUM (
    'admin',
    'user',
    'editor',
    'supervisor',
    'comercial',
    'financeiro',
    'motorista',
    'gestor_frota',
    'estoque'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE situacao_cirurgia AS ENUM (
    'Agendada',
    'Confirmada',
    'Em Andamento',
    'Realizada',
    'Cancelada',
    'Faturada'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_protocolo AS ENUM (
    'Rascunho',
    'Em Análise',
    'Aprovado Convenio',
    'Recusado',
    'Entregue',
    'Faturado'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tipo_movimento AS ENUM (
    'entrada',
    'saida',
    'entrega',
    'devolucao',
    'consumo',
    'ajuste'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_venda AS ENUM (
    'Orcamento',
    'Pedido Criado',
    'Cirurgia Agendada',
    'Consumo Registrado',
    'Faturado',
    'Cancelado'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABELAS DE IDENTIDADE, EMPRESA E AUDITORIA
CREATE TABLE IF NOT EXISTS public.empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  ie VARCHAR(50),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  telefone VARCHAR(20),
  email VARCHAR(100),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Papéis em tabela separada para isolamento estrito de segurança RLS
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.empresa_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_empresa_user UNIQUE (empresa_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  user_id UUID,
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  route VARCHAR(255),
  method VARCHAR(10),
  ip VARCHAR(50),
  user_agent TEXT,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CADASTROS AUXILIARES
CREATE TABLE IF NOT EXISTS public.hospitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  contato VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  nome VARCHAR(255) NOT NULL,
  crm VARCHAR(20) NOT NULL,
  uf_crm VARCHAR(2) NOT NULL,
  especialidade VARCHAR(100) DEFAULT 'Ortopedia e Traumatologia',
  telefone VARCHAR(20),
  email VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  nome VARCHAR(255) NOT NULL,
  ans_codigo VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(50),
  tipo VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  user_id UUID REFERENCES public.profiles(id),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  comissao_padrao_pct NUMERIC(5,2) DEFAULT 5.00,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MAPA CIRÚRGICO
CREATE TABLE IF NOT EXISTS public.cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  hospital_id UUID REFERENCES public.hospitais(id),
  hospital_nome VARCHAR(255) NOT NULL,
  medico_id UUID REFERENCES public.medicos(id),
  medico_nome VARCHAR(255) NOT NULL,
  paciente VARCHAR(255) NOT NULL,
  paciente_cpf VARCHAR(14),
  convenio_id UUID REFERENCES public.convenios(id),
  convenio_nome VARCHAR(255) NOT NULL,
  vendedor_id UUID REFERENCES public.vendedores(id),
  vendedor_nome VARCHAR(255) NOT NULL,
  situacao situacao_cirurgia DEFAULT 'Agendada',
  equipamento VARCHAR(255),
  acessorio VARCHAR(255),
  ld_ct VARCHAR(50),
  material_previsto TEXT,
  tecnico_nome VARCHAR(255),
  observacao TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROTOCOLOS OPME (COTAÇÃO)
CREATE TABLE IF NOT EXISTS public.protocolos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  numero VARCHAR(50) UNIQUE NOT NULL,
  data DATE DEFAULT CURRENT_DATE,
  medico_nome VARCHAR(255) NOT NULL,
  crm VARCHAR(20) NOT NULL,
  paciente VARCHAR(255) NOT NULL,
  hospital_nome VARCHAR(255) NOT NULL,
  convenio_nome VARCHAR(255) NOT NULL,
  procedimento VARCHAR(255) NOT NULL,
  data_cirurgia DATE NOT NULL,
  status status_protocolo DEFAULT 'Rascunho',
  vendedor_nome VARCHAR(255) NOT NULL,
  vendedor_user_id UUID REFERENCES public.profiles(id),
  valor_total NUMERIC(12,2) DEFAULT 0.00,
  observacao TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.protocolo_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id UUID NOT NULL REFERENCES public.protocolos(id) ON DELETE CASCADE,
  produto_codigo VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  valor_total NUMERIC(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  anvisa VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS public.protocolo_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id UUID NOT NULL REFERENCES public.protocolos(id) ON DELETE CASCADE,
  campo VARCHAR(100) NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  acao VARCHAR(50) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ESTOQUE OPME (PRODUTOS, LOTES, SÉRIES, MOVIMENTOS, ENTREGAS)
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa(id),
  codigo VARCHAR(100) UNIQUE NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  fabricante VARCHAR(100) NOT NULL,
  anvisa VARCHAR(50) NOT NULL,
  grupo VARCHAR(100) NOT NULL,
  subgrupo VARCHAR(100),
  unidade VARCHAR(20) DEFAULT 'UN',
  valor_custo NUMERIC(10,2) DEFAULT 0.00,
  valor_venda NUMERIC(10,2) DEFAULT 0.00,
  controla_serie BOOLEAN DEFAULT FALSE,
  is_kit BOOLEAN DEFAULT FALSE,
  saldo_total INT DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.produto_lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  lote VARCHAR(100) NOT NULL,
  fabricacao DATE,
  validade DATE NOT NULL,
  quantidade INT DEFAULT 0,
  CONSTRAINT unique_produto_lote UNIQUE (produto_id, lote)
);

CREATE TABLE IF NOT EXISTS public.estoque_movimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id),
  produto_codigo VARCHAR(100) NOT NULL,
  produto_descricao VARCHAR(255) NOT NULL,
  lote VARCHAR(100) NOT NULL,
  numero_serie VARCHAR(100),
  tipo tipo_movimento NOT NULL,
  quantidade INT NOT NULL,
  origem VARCHAR(100),
  destino VARCHAR(100),
  hospital_nome VARCHAR(255),
  medico_nome VARCHAR(255),
  paciente_nome VARCHAR(255),
  protocolo_numero VARCHAR(50),
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  data DATE DEFAULT CURRENT_DATE,
  hospital_nome VARCHAR(255) NOT NULL,
  medico_nome VARCHAR(255) NOT NULL,
  paciente VARCHAR(255) NOT NULL,
  procedimento VARCHAR(255) NOT NULL,
  vendedor_nome VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pendente',
  assinatura_url TEXT,
  itens_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VENDAS OPME & COMISSÕES
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  nota_fiscal VARCHAR(50),
  data DATE DEFAULT CURRENT_DATE,
  cliente_hospital VARCHAR(255) NOT NULL,
  cliente_codigo VARCHAR(50),
  convenio_nome VARCHAR(255) NOT NULL,
  medico_nome VARCHAR(255) NOT NULL,
  crm VARCHAR(20),
  paciente VARCHAR(255) NOT NULL,
  procedimento VARCHAR(255) NOT NULL,
  vendedor_nome VARCHAR(255) NOT NULL,
  status status_venda DEFAULT 'Pedido Criado',
  valor_total NUMERIC(12,2) DEFAULT 0.00,
  valor_consumido NUMERIC(12,2) DEFAULT 0.00,
  valor_devolvido NUMERIC(12,2) DEFAULT 0.00,
  margem_pct NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.venda_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_codigo VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  lote VARCHAR(100) NOT NULL,
  numero_serie VARCHAR(100),
  quantidade INT NOT NULL DEFAULT 1,
  qtd_devolvida INT DEFAULT 0,
  qtd_consumida INT DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  valor_total NUMERIC(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  valor_consumido NUMERIC(12,2) GENERATED ALWAYS AS (qtd_consumida * valor_unitario) STORED
);

CREATE TABLE IF NOT EXISTS public.comissoes_regras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  alvo VARCHAR(50) CHECK (alvo IN ('Vendedor', 'Supervisor', 'Gerente')) DEFAULT 'Vendedor',
  percentual NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendas_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_nome VARCHAR(255) NOT NULL,
  ano INT NOT NULL,
  mes INT NOT NULL,
  valor_meta NUMERIC(12,2) NOT NULL DEFAULT 100000.00,
  valor_atingido NUMERIC(12,2) DEFAULT 0.00,
  CONSTRAINT unique_vendedor_meta UNIQUE (vendedor_nome, ano, mes)
);

-- 8. GESTÃO DE FROTA E VISTORIA FOTOGRÁFICA
CREATE TABLE IF NOT EXISTS public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(10) UNIQUE NOT NULL,
  frota VARCHAR(50) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INT NOT NULL,
  renavam VARCHAR(20),
  chassi VARCHAR(30),
  cor VARCHAR(30) NOT NULL,
  tipo_veiculo VARCHAR(50) DEFAULT 'Utilitário',
  combustivel VARCHAR(30) DEFAULT 'Flex',
  km_atual INT NOT NULL DEFAULT 0,
  responsavel_nome VARCHAR(255) NOT NULL,
  situacao VARCHAR(50) DEFAULT 'Ativo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.condutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  cnh VARCHAR(20) UNIQUE NOT NULL,
  categoria_cnh VARCHAR(5) NOT NULL,
  validade_cnh DATE NOT NULL,
  cargo VARCHAR(100) DEFAULT 'Entregador / Técnico',
  departamento VARCHAR(100) DEFAULT 'Logística OPME',
  status VARCHAR(20) DEFAULT 'Ativo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.abastecimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_placa VARCHAR(10) REFERENCES public.veiculos(placa),
  condutor_nome VARCHAR(255) NOT NULL,
  data DATE DEFAULT CURRENT_DATE,
  km_atual INT NOT NULL,
  posto VARCHAR(100) NOT NULL,
  combustivel VARCHAR(30) NOT NULL,
  litros NUMERIC(8,2) NOT NULL,
  valor_litro NUMERIC(6,2) NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  km_percorrido INT,
  km_por_litro NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_placa VARCHAR(10) REFERENCES public.veiculos(placa),
  condutor_nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('Saída', 'Retorno')) NOT NULL,
  data TIMESTAMPTZ DEFAULT NOW(),
  km INT NOT NULL,
  pontos_vistorias JSONB NOT NULL,
  assinatura_url TEXT,
  tem_avaria BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FUNÇÕES SECURITY DEFINER E TRIGGERS DE NEGÓCIO
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
END;
$$;

-- Trigger automatico ao criar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_first BOOLEAN;
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
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger de movimento de estoque que atualiza o saldo do lote
CREATE OR REPLACE FUNCTION public.mov_apply_saldo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.tipo IN ('entrada', 'devolucao', 'ajuste') THEN
    UPDATE public.produto_lotes
    SET quantidade = quantidade + NEW.quantidade
    WHERE produto_id = NEW.produto_id AND lote = NEW.lote;
  ELSIF NEW.tipo IN ('saida', 'entrega', 'consumo') THEN
    UPDATE public.produto_lotes
    SET quantidade = GREATEST(0, quantidade - NEW.quantidade)
    WHERE produto_id = NEW.produto_id AND lote = NEW.lote;
  END IF;

  -- Atualiza saldo_total do produto
  UPDATE public.produtos
  SET saldo_total = (
    SELECT COALESCE(SUM(quantidade), 0)
    FROM public.produto_lotes
    WHERE produto_id = NEW.produto_id
  )
  WHERE id = NEW.produto_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mov_apply_saldo ON public.estoque_movimentos;
CREATE TRIGGER trg_mov_apply_saldo
  AFTER INSERT ON public.estoque_movimentos
  FOR EACH ROW EXECUTE FUNCTION public.mov_apply_saldo();

-- 10. ÍNDICES DE PERFORMANCE (PRODUÇÃO)
CREATE INDEX IF NOT EXISTS idx_cirurgias_data ON public.cirurgias (data);
CREATE INDEX IF NOT EXISTS idx_cirurgias_hospital ON public.cirurgias (hospital_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_situacao ON public.cirurgias (situacao);
CREATE INDEX IF NOT EXISTS idx_protocolos_numero ON public.protocolos (numero);
CREATE INDEX IF NOT EXISTS idx_protocolos_data_cirurgia ON public.protocolos (data_cirurgia);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON public.produtos (codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_anvisa ON public.produtos (anvisa);
CREATE INDEX IF NOT EXISTS idx_produto_lotes_prod ON public.produto_lotes (produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_mov_prod ON public.estoque_movimentos (produto_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checklists_veiculo ON public.checklists (veiculo_placa);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES EM TODAS AS TABELAS
ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolo_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolo_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes_regras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas_metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Políticas de Autenticação e Perfis
DROP POLICY IF EXISTS "Leitura de perfis autenticados" ON public.profiles;
CREATE POLICY "Leitura de perfis autenticados" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuarios atualizam seu proprio perfil" ON public.profiles;
CREATE POLICY "Usuarios atualizam seu proprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin gerencia papeis" ON public.user_roles;
CREATE POLICY "Admin gerencia papeis" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Todos autenticados leem empresa" ON public.empresa;
CREATE POLICY "Todos autenticados leem empresa" ON public.empresa FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin gerencia empresa" ON public.empresa;
CREATE POLICY "Admin gerencia empresa" ON public.empresa FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auditoria (Inserção permitida a qualquer autenticado, leitura restrita a admin)
DROP POLICY IF EXISTS "Autenticados gravam auditoria" ON public.audit_logs;
CREATE POLICY "Autenticados gravam auditoria" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Apenas admin le logs de auditoria" ON public.audit_logs;
CREATE POLICY "Apenas admin le logs de auditoria" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Cadastros e Operações de Negócio
DROP POLICY IF EXISTS "Autenticados operam hospitais" ON public.hospitais;
CREATE POLICY "Autenticados operam hospitais" ON public.hospitais FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam medicos" ON public.medicos;
CREATE POLICY "Autenticados operam medicos" ON public.medicos FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam convenios" ON public.convenios;
CREATE POLICY "Autenticados operam convenios" ON public.convenios FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam equipamentos" ON public.equipamentos;
CREATE POLICY "Autenticados operam equipamentos" ON public.equipamentos FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam vendedores" ON public.vendedores;
CREATE POLICY "Autenticados operam vendedores" ON public.vendedores FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam tecnicos" ON public.tecnicos;
CREATE POLICY "Autenticados operam tecnicos" ON public.tecnicos FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam cirurgias" ON public.cirurgias;
CREATE POLICY "Autenticados operam cirurgias" ON public.cirurgias FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam protocolos" ON public.protocolos;
CREATE POLICY "Autenticados operam protocolos" ON public.protocolos FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam protocolo_itens" ON public.protocolo_itens;
CREATE POLICY "Autenticados operam protocolo_itens" ON public.protocolo_itens FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam produtos" ON public.produtos;
CREATE POLICY "Autenticados operam produtos" ON public.produtos FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam produto_lotes" ON public.produto_lotes;
CREATE POLICY "Autenticados operam produto_lotes" ON public.produto_lotes FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam estoque_movimentos" ON public.estoque_movimentos;
CREATE POLICY "Autenticados operam estoque_movimentos" ON public.estoque_movimentos FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam vendas" ON public.vendas;
CREATE POLICY "Autenticados operam vendas" ON public.vendas FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam veiculos" ON public.veiculos;
CREATE POLICY "Autenticados operam veiculos" ON public.veiculos FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam condutores" ON public.condutores;
CREATE POLICY "Autenticados operam condutores" ON public.condutores FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados operam checklists" ON public.checklists;
CREATE POLICY "Autenticados operam checklists" ON public.checklists FOR ALL TO authenticated USING (true);

-- 12. BUCKETS DE STORAGE (FOTOS DE VISTORIA E LAUDOS)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('vistorias-frota', 'vistorias-frota', true),
         ('documentos', 'documentos', true)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignora se storage schema ainda não estiver inicializado
    NULL;
END $$;

-- 13. SEED INICIAL DE PRODUÇÃO (IDEMPOTENTE)
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
)
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO public.hospitais (nome, cnpj, cidade, estado, contato, ativo) VALUES
('Hospital Israelita Albert Einstein', '60.765.823/0001-30', 'São Paulo', 'SP', 'Centro Cirúrgico OPME - (11) 2151-1234', true),
('Hospital Sírio-Libanês', '62.970.389/0001-15', 'São Paulo', 'SP', 'Farmácia Satélite OPME - (11) 3394-5000', true),
('HCor - Hospital do Coração', '60.884.855/0001-54', 'São Paulo', 'SP', 'Almoxarifado Consignado - (11) 3053-6600', true),
('Hospital Alemão Oswaldo Cruz', '60.884.111/0001-20', 'São Paulo', 'SP', 'SAD / Bloco Cirúrgico - (11) 3549-1000', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.medicos (nome, crm, uf_crm, especialidade, telefone, email, ativo) VALUES
('Dr. Roberto Silva Mendes', '145892', 'SP', 'Cirurgia da Coluna e Joelho', '(11) 99123-4455', 'roberto.mendes@medicos.com.br', true),
('Dra. Patricia Alencar', '178920', 'SP', 'Artroplastia de Quadril', '(11) 98877-6655', 'patricia.alencar@ortopedia.com.br', true),
('Dr. Fernando Vasconcelos', '123410', 'SP', 'Traumatologia Complexa', '(11) 97111-2233', 'f.vasconcelos@trauma.com.br', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.convenios (nome, ans_codigo, ativo) VALUES
('Bradesco Saúde', '005711', true),
('SulAmérica Saúde', '006246', true),
('Amil Assistência Médica', '326305', true),
('Porto Seguro Saúde', '000582', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.vendedores (nome, email, comissao_padrao_pct, ativo) VALUES
('Lucas Guimarães', 'lucas.g@prestymedick.com.br', 6.00, true),
('Mariana Duarte', 'mariana.d@prestymedick.com.br', 5.50, true),
('Rodrigo Santoro', 'rodrigo.s@prestymedick.com.br', 5.00, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.produtos (codigo, descricao, fabricante, anvisa, grupo, subgrupo, unidade, valor_custo, valor_venda, controla_serie, saldo_total, ativo) VALUES
('OPME-COL-001', 'Gaiola Cervical PEEK 12x14mm', 'Medtronic Spine', '80123450012', 'Coluna Vertebral', 'Cervical PEEK', 'UN', 3200.00, 8500.00, true, 18, true),
('OPME-QUAD-010', 'Haste Femoral Modular Ti 12mm', 'Zimmer Biomet', '10293847561', 'Prótese de Quadril', 'Hastes Femorais', 'UN', 6800.00, 18900.00, true, 8, true),
('OPME-JOE-005', 'Componente Femoral Prótese de Joelho Tam 3', 'Stryker Orthopaedics', '80998877665', 'Prótese de Joelho', 'Femoral', 'UN', 5400.00, 15200.00, true, 12, true)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.veiculos (placa, frota, marca, modelo, ano, renavam, chassi, cor, tipo_veiculo, combustivel, km_atual, responsavel_nome, situacao) VALUES
('OPM-8E29', 'FROTA-LOG-01', 'Fiat', 'Fiorino Endurance 1.4', 2024, '00987654321', '9BD12345678901234', 'Branco Banchisa', 'Utilitário', 'Flex', 24850, 'Sérgio Ramos (Entregador OPME)', 'Ativo'),
('MED-2A99', 'FROTA-LOG-02', 'Renault', 'Master Vitré L2H2', 2025, '00112233445', '8C112233445566778', 'Prata', 'Van', 'Diesel', 12300, 'Marcos Vinícius (Motorista)', 'Ativo')
ON CONFLICT (placa) DO NOTHING;

INSERT INTO public.condutores (nome, cpf, cnh, categoria_cnh, validade_cnh, cargo, departamento, status) VALUES
('Sérgio Ramos', '234.111.222-99', '0129384756', 'B', '2028-05-20', 'Entregador de Caixas OPME', 'Logística de Emergência', 'Ativo'),
('Marcos Vinícius', '888.333.222-11', '0987654321', 'D', '2027-11-10', 'Motorista de Distribuição', 'Frota Pesada', 'Ativo')
ON CONFLICT (cpf) DO NOTHING;

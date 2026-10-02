# Presty Medick - ERP OPME (Plataforma Médica Cirúrgica)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E.svg)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-21%20Tests%20Passed-FCC72B.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

ERP vertical de alta performance para distribuidores de **OPME** (Órteses, Próteses e Materiais Especiais), em conformidade com as diretrizes da **ANVISA (RDC 751/2022)** e **LGPD**.

---

## 🌟 Módulos da Plataforma

1. **Visão Executiva (Dashboard):** KPIs operacionais em tempo real, volume de cirurgias atendidas, conformidade ANVISA e capacidade hospitalar.
2. **Mapa Cirúrgico:** Agendamento cirúrgico centralizado com filtros por hospital, convênio, médico cirurgião, status e liberação de equipamento.
3. **Protocolos OPME:** Montagem ágil de requisições de materiais vinculadas a códigos e registros da ANVISA com contagem e itens solicitados.
4. **Estoque, Lotes & Rastreabilidade:**
   - Catálogo com saldos físicos em tempo real (sem precificação comercial).
   - Monitoramento de lotes e cálculo dinâmico de vencimento ANVISA (Válido, Atenção < 90 dias, Bloqueado).
   - Histórico de movimentações (Entradas por NF, Saídas cirúrgicas, Devoluções de consignados).
   - Linha do tempo visual de rastreabilidade ponta-a-ponta (Fabricação ➔ Estoque ➔ Logística ➔ Cirurgia/Paciente).
5. **Frota & Vistoria Fotográfica:**
   - Gestão de veículos utilitários e condutores credenciados.
   - Vistoria veicular guiada em **24 pontos** com registro fotográfico e checklist de avarias persistido no banco.
6. **Cadastros Auxiliares:** Hospitais parceiros, médicos cirurgiões (CRM/UF), operadoras de convênio, vendedores e técnicos instrumentadores.
7. **Relatórios & BI:** Emissão de relatórios em PDF formatados para auditoria hospitalar e sanitária (Cirurgias, Estoque e Frota).
8. **Gestão de Usuários (RBAC):** Controle de acessos por papel (`admin`, `comercial`, `estoque`, `gestor_frota`, `motorista`, `supervisor`, `financeiro`).
9. **Trilha de Auditoria (Audit Logs):** Log imutável de todas as ações sensíveis com categorização por severidade (`low`, `medium`, `high`, `critical`).

---

## 🏗️ Arquitetura Tecnológica

* **Frontend:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS v4, Lucide React, Recharts, jsPDF, html2canvas, DOMPurify.
* **Segurança:**
  - `ProtectedRoute`: Barreira de proteção de rotas com RBAC estrito.
  - `ErrorBoundary`: Resiliência contra exceções não tratadas no DOM.
  - Mascaramento de CPF (`maskCPF`) e E-mail (`maskEmail`) para conformidade LGPD.
  - Sanitização de strings (`sanitizeHTML`) contra ataques XSS.
* **Performance:**
  - Code-splitting dinâmico com `React.lazy` e `Suspense`.
  - Chunking inteligente no Vite (`vendor-pdf`, `vendor-charts`, `vendor-supabase`, `vendor-icons`).
  - Bundle inicial enxuto de apenas **286 kB** (84 kB gzip).
* **Banco de Dados (Supabase PostgreSQL):**
  - Row Level Security (RLS) habilitado em 100% das tabelas.
  - Triggers automáticos para atualização de estoque físico (`mov_apply_saldo`).
  - Trilha de auditoria persistida na tabela `public.audit_logs`.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js (v18 ou superior)
* npm (v9 ou superior)

### 1. Clonar e Instalar
```bash
git clone https://github.com/Anectta/OPMEPRESTY.git
cd OPMEPRESTY
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```
Preencha as credenciais do seu projeto Supabase:
```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anon-publica-aqui"
```

### 3. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em `http://localhost:3000`.

---

## 🧪 Testes Automatizados e Qualidade

O projeto possui suíte completa de testes unitários com **Vitest**:

```bash
# Executar todos os testes unitários
npm test

# Executar checagem estática de tipagem TypeScript
npm run lint

# Executar compilação otimizada de produção
npm run build
```

---

## 📖 Documentação de Produção

* [Guia de Deploy (DEPLOY.md)](DEPLOY.md) — Instruções detalhadas para deploy na Vercel, Netlify ou Docker.
* [Checklist de Prontidão (docs/CHECKLIST_PRODUCAO.md)](docs/CHECKLIST_PRODUCAO.md) — Matriz de auditoria dos 20 critérios do Prompt Mestre Universal.
* [Esquema do Banco de Dados (schema.sql)](src/lib/supabase/schema.sql) — DDL PostgreSQL completo com RLS, gatilhos e dados de seed.

---

## 🔒 Segurança e Responsabilidade

Todas as operações cirúrgicas e dados de pacientes manipulados na plataforma devem seguir as regulamentações vigentes do Conselho Federal de Medicina (CFM), ANVISA e LGPD. O acesso aos módulos de governança e auditoria é restrito aos administradores credenciados da instituição.

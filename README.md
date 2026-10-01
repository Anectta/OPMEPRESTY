# Presty Medick - ERP OPME

SaaS de gestão (ERP vertical) para distribuidoras de **OPME** (Órteses, Próteses e Materiais Especiais).

## 🚀 Módulos do Sistema
- **Visão Executiva:** Dashboards gerenciais, faturamento, margens e KPIs operacionais.
- **Mapa Cirúrgico:** Agendamento cirúrgico integrado por hospital, médico, paciente e convênio.
- **Mapa de Calor Operacional:** Monitoramento de conflitos de equipamentos e volume cirúrgico.
- **Protocolos & Cotação:** Cotações ágeis com vinculação direta a registros ANVISA.
- **Estoque & Lotes OPME:** Rastreabilidade rigorosa por lote, número de série e kits consignados.
- **Vendas & Comissões:** Pedidos faturados, apuração de consumo vs. devolução e comissionamento.
- **Frota & Vistorias:** Gestão veicular e vistorias fotográficas em 24 pontos.
- **Cadastros Auxiliares:** Hospitais, médicos, convênios, técnicos e representantes.
- **Relatórios & BI:** Emissão de relatórios em PDF formatados para auditoria sanitária.
- **Trilha de Auditoria:** Rastreabilidade e logs de ações críticas de usuários.

---

## 🛠️ Stack Tecnológica
- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React, Recharts, jsPDF
- **Backend / Database:** Supabase (PostgreSQL com Row Level Security)

---

## 💻 Como Executar Localmente

### Pré-requisitos
- Node.js (v18+)
- npm (v9+)

### Passo a Passo

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   Defina suas chaves do Supabase:
   ```env
   VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
   VITE_SUPABASE_ANON_KEY="sua-chave-anon-publica"
   ```

3. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:3000`

4. **Verificar tipagem e build:**
   ```bash
   npm run lint
   npm run build
   ```

# Guia de Deploy e Produção - Presty Medick (ERP OPME)

Este documento descreve os procedimentos recomendados para colocar o **Presty Medick** em produção com máxima segurança, performance e disponibilidade.

---

## 1. Arquitetura de Produção

* **Frontend:** Single Page Application (SPA) estática construída com Vite + React 19 + TypeScript.
* **Backend as a Service (BaaS):** Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security, Triggers e Storage).
* **Hospedagem Recomendada:** Vercel, Netlify, Cloudflare Pages ou Container Docker com Nginx.

---

## 2. Passo a Passo de Implantação

### 2.1. Provisionamento do Banco de Dados (Supabase)
1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** do projeto.
3. Copie o conteúdo integral do arquivo [`src/lib/supabase/schema.sql`](src/lib/supabase/schema.sql) e execute-o.
4. O script criará:
   - Todas as tabelas do domínio OPME com constraints de chave primária e estrangeira.
   - Políticas de **Row Level Security (RLS)** ativadas.
   - Gatilhos automáticos de atualização de saldo (`mov_apply_saldo`) e criação de perfil (`handle_new_user`).
   - Dados iniciais de hospitais, cirurgiões, convênios, veículos e produtos OPME com registro ANVISA.

### 2.2. Obtenção das Chaves de Conexão
No painel do Supabase, acesse **Project Settings > API**:
* Copie a **Project URL** (ex: `https://xyzcompany.supabase.co`).
* Copie a **anon / public key** (chave pública segura para navegadores).
> **Atenção:** NUNCA utilize ou exponha a chave `service_role` no frontend.

---

## 3. Implantação na Hospedagem (Exemplos)

### Opção A: Vercel (Recomendado para SPA)
1. Importe o repositório GitHub `https://github.com/Anectta/OPMEPRESTY.git`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Em **Environment Variables**, configure:
   - `VITE_SUPABASE_URL` = `https://seu-projeto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sua-chave-anon-publica`
6. Clique em **Deploy**.

> Para garantir que rotas diretas do SPA funcionem perfeitamente no Vercel, crie um arquivo `vercel.json` na raiz se necessário:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Opção B: Netlify
1. Crie um novo site a partir do repositório Git.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Crie um arquivo `public/_redirects` com:
```text
/*    /index.html   200
```

### Opção C: Docker + Nginx (Servidor Próprio / VPS / Cloud Run)
```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 4. Headers de Segurança Recomendados (Nginx / Cloudflare)

Para máxima segurança regulatória (ANVISA e LGPD):
* **X-Content-Type-Options:** `nosniff`
* **X-Frame-Options:** `DENY`
* **X-XSS-Protection:** `1; mode=block`
* **Referrer-Policy:** `strict-origin-when-cross-origin`
* **Content-Security-Policy:** Permitir conexões exclusivamente para o domínio do Supabase (`*.supabase.co`).

---

## 5. Rotinas Operacionais e Monitoramento

* **Auditoria de Acessos:** Acompanhe tentativas não autorizadas e modificações críticas diretamente pelo módulo **Trilha de Auditoria** (restrito a administradores).
* **Backups do Banco:** O Supabase realiza backups diários automáticos. Em ambientes de alta criticidade (Enterprise/Pro), ative o *Point-in-Time Recovery (PITR)*.
* **Testes de Regressão em CI/CD:** Antes de qualquer novo deploy, execute `npm test` e `npm run lint`.

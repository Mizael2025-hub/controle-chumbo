# BOOTSTRAP.md — Checklist ao Criar Projeto Novo

> Copie esta pasta inteira para o repositório do novo projeto e siga os passos abaixo na ordem.

---

## 1. Copiar a base

Duplique toda a pasta do kit (`docs/`, `.cursor/rules/`, `AGENTS.md`, `TASKS.md`, `PROJECT_MAP.md`, `BOOTSTRAP.md`, `README.md`).

---

## 2. Preencher arquivos por projeto (Fase A)

Cada arquivo abaixo tem um bloco **O que preencher aqui** no topo — abra o arquivo e siga as instruções.

| Arquivo | Resumo |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Identidade — 8 campos (fonte única: nome, offline, DATA_SOURCE) |
| [`docs/BUSINESS_RULES.md`](docs/BUSINESS_RULES.md) | Regras de domínio — substituir `[PREENCHER]` |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Apagar `[EXEMPLO]`; SQL, RLS, migrations reais |
| [`PROJECT_MAP.md`](PROJECT_MAP.md) | Módulos e rotas planejadas (não repetir nome/offline do AGENTS) |
| [`.env.example`](.env.example) | Copiar para `.env.local` — `DATA_SOURCE` igual ao AGENTS |

**Fase B (cada sessão Cursor):** [`TASKS.md`](TASKS.md) — só a TAREFA ATUAL.

**Fase C (conforme constrói):** atualizar [`PROJECT_MAP.md`](PROJECT_MAP.md).

**Fase D (migração Supabase):** `.env.local`, AGENTS (Fonte de dados), PROJECT_MAP (DATA_SOURCE atual).

---

## 3. Scaffold do Next.js

```bash
npx create-next-app@latest [nome-projeto] --typescript --tailwind --eslint --app --src-dir
```

**Dependências base (sempre):**

```bash
npm install @supabase/ssr @supabase/supabase-js zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query @tanstack/react-table zustand sonner date-fns date-fns-tz
npm install lucide-react uuid
npm install -D vitest @playwright/test @testing-library/react
```

**Somente se Offline/PWA = sim em AGENTS.md:**

```bash
npm install dexie next-pwa
```

**Design System iOS:**

1. Copiar extensões de [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md) para `tailwind.config.ts`
2. Copiar utilitários CSS para `globals.css`
3. Criar estrutura `src/` conforme [`AGENTS.md`](AGENTS.md)

> shadcn/ui é opcional. Se usar, aplicar tokens iOS por cima — visual nunca pode divergir de `docs/COMPONENTS.md`.

**Scripts esperados em `package.json`:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

**`.gitignore` mínimo:**

```
node_modules/
.next/
.env.local
.env*.local
playwright-report/
test-results/
```

**Se Offline = sim:** configurar `next-pwa` em `next.config.ts` conforme `docs/OFFLINE.md`.

---

## 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

**Fase de construção (sem Supabase):**

```bash
DATA_SOURCE=local
NEXT_PUBLIC_APP_TIMEZONE=America/Sao_Paulo
```

**Fase de produção (com Supabase):**

```bash
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
NEXT_PUBLIC_APP_TIMEZONE=America/Sao_Paulo
```

---

## 5. Implementar infraestrutura mínima

Antes da primeira feature, criar:

- `src/lib/data-source/` — factory local vs supabase (`docs/DEV_MODE.md`)
- `src/lib/auth/get-user.ts` — auth real + mock local (`docs/SECURITY.md`)
- `src/lib/auth/get-user-role.ts` — roles (`docs/SECURITY.md`)
- `src/lib/utils/date-time.ts` — formatadores PT-BR (`docs/DATE_TIME.md`)
- `src/lib/types/action-response.ts` (`docs/ERROR_HANDLING.md`)
- `src/lib/errors/app-error.ts` (`docs/ERROR_HANDLING.md`)

**Se Offline = sim:**

- `src/lib/offline/` — Dexie + Outbox + Executor (`docs/OFFLINE.md`)
- `src/app/api/sync/route.ts` — route handler de sincronização (`docs/OFFLINE.md`)
- Gate de login com internet (`LoginGate`)
- Tela admin de limpeza de dados locais (`docs/LOCAL_DATA.md`)

---

## 6. Antes de cada sessão com o Cursor

Atualize [`TASKS.md`](TASKS.md) com escopo explícito (arquivos permitidos, critérios de aceite).

---

## 7. Antes de subir para Supabase

- [ ] Telas e fluxos validados com `DATA_SOURCE=local`
- [ ] Aprovação do responsável
- [ ] Limpar dados locais via Configurações → Admin (`docs/LOCAL_DATA.md`)
- [ ] Alterar `DATA_SOURCE=supabase` no `.env.local`
- [ ] Criar projeto Supabase, aplicar migrations (`docs/DATABASE.md`)
- [ ] Configurar RLS e Auth
- [ ] Testar login + sync + offline end-to-end (se aplicável)

---

## 8. Antes de ir para produção

- [ ] `npm run lint && npm run type-check && npm run build` — zero erros
- [ ] Limpar dados locais de todos os dispositivos de teste
- [ ] `DATA_SOURCE=supabase` confirmado (ou app 100% local, sem backend)
- [ ] `SUPABASE_SECRET_KEY` apenas no servidor
- [ ] `PROJECT_MAP.md` atualizado

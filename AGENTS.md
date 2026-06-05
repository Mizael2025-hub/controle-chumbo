# AGENTS.md — Guia para Agentes de IA

> Este arquivo é lido automaticamente pelo Cursor (Agent mode), Claude Code e agentes compatíveis com agents.md.

---

## Kit Universal — Leia Primeiro

Este repositório é um **kit de governança**, não um projeto com código de domínio. Exemplos marcados `[EXEMPLO]` são didáticos — **nunca** tratá-los como schema ou regra real.

**Ao copiar para um projeto**, preencher: Identidade (abaixo), `docs/BUSINESS_RULES.md`, `docs/DATABASE.md`, `PROJECT_MAP.md`, `.env.local`. Antes de cada sessão: `TASKS.md`. Cada arquivo tem bloco **O que preencher aqui** no topo.

### Navegação do kit (pirâmide 3 níveis)


| Nível                      | Arquivos                                     | Quando ler                                         |
| -------------------------- | -------------------------------------------- | -------------------------------------------------- |
| **1 — Contrato**           | Este arquivo + `.cursor/rules/00-global.mdc` | Toda sessão                                        |
| **2 — Por tipo de código** | `.cursor/rules/01` a `04` (globs)            | Ao editar arquivos matching                        |
| **3 — Profundidade**       | `docs/`*                                     | Quando `TASKS.md` referencia ou link abaixo aponta |


**Antes de codar:** ler `TASKS.md` (escopo é lei) e `PROJECT_MAP.md` (evitar duplicação). **Não** reler todos os docs — seguir links do TASKS.

**Fonte única por tema** (em dúvida, prevalece o da direita):


| Tema                       | Fonte única                                    |
| -------------------------- | ---------------------------------------------- |
| Arquitetura                | `docs/ARCHITECTURE.md`                         |
| Nomenclatura               | `docs/CONVENTIONS.md`                          |
| Data/hora                  | `docs/DATE_TIME.md`                            |
| Erros / ActionResponse     | `docs/ERROR_HANDLING.md`                       |
| Templates Actions/Services | `.cursor/rules/02-actions-services.mdc`        |
| Templates Repositories     | `.cursor/rules/03-repositories.mdc`            |
| Templates Zod              | `.cursor/rules/04-validations.mdc`             |
| UI iOS                     | `docs/COMPONENTS.md` + `docs/DESIGN_TOKENS.md` |


---

## Identidade do Projeto

> ### O que preencher aqui (você — humano)
>
> - **Quando:** uma vez ao criar o projeto (Fase A).
> - **Substituir** os 8 campos abaixo: Nome, Descrição, Domínio, Status, Última atualização, Offline/PWA, Fonte de dados, Fuso horário.
> - **Não colocar aqui:** tabelas, rotas, SQL ou regras detalhadas → use `BUSINESS_RULES.md`, `DATABASE.md` e `PROJECT_MAP.md`.
> - **Fonte única** para: nome do projeto, offline sim/não e DATA_SOURCE inicial (`.env.local` deve ter o mesmo DATA_SOURCE).



- **Nome:** Controle de Chumbo
- **Descrição:** Sistema offline-first para espelhar montes de chumbo em grade 2D na fábrica, controlar peso (kg) e barras, registrar consumo diário e manter rastreabilidade/auditoria. Substitui controle manual em papel/PDF.
- **Domínio:** PCP Industrial — estoque e consumo de chumbo (fábrica única, estoque compartilhado)
- **Status:** Em desenvolvimento
- **Última atualização:** 2026-06-02
- **Offline/PWA:** sim — consultar `docs/OFFLINE.md` e `docs/BUSINESS_RULES.md` §5
- **Fonte de dados (construção):** local — ver `docs/DEV_MODE.md` (migração para supabase na Fase D)
- **Fuso horário da UI:** America/Sao_Paulo (horário de Brasília)

---

## Stack Obrigatória

- **Framework:** Next.js (App Router) + TypeScript STRICT
- **Estilização:** Tailwind CSS + **Design System iOS** (`docs/DESIGN_TOKENS.md` + `docs/COMPONENTS.md`)
- **Banco de dados:** Supabase (PostgreSQL + Auth + RLS) — quando `DATA_SOURCE=supabase`
- **Estado global:** Zustand
- **Sincronização/Cache:** TanStack Query (React Query)
- **Validação:** Zod + React Hook Form
- **Tabelas:** TanStack Table
- **Notificações:** Sonner (toasts)
- **Datas:** date-fns + date-fns-tz — ver `docs/DATE_TIME.md`
- **Offline/PWA:** next-pwa + Dexie.js (IndexedDB) — apenas se Offline/PWA = sim

> shadcn/ui é **opcional** (primitivos Radix internos). O visual **sempre** segue tokens iOS.
> NUNCA substitua uma biblioteca sem autorização explícita do usuário.

---

## Comandos Essenciais

```bash
npm run dev          # Iniciar servidor local (localhost:3000)
npm run build        # Build de produção (EXECUTAR antes de entregar)
npm run lint         # ESLint (ZERO warnings permitidos)
npm run type-check   # TypeScript strict (ZERO erros permitidos)
npm test             # Vitest — testes unitários
npm run test:e2e     # Playwright — testes end-to-end
```

> Antes de declarar qualquer tarefa como concluída: `npm run lint && npm run type-check && npm run build`

---

## Arquitetura de Camadas (IMUTÁVEL)

```
UI → Server Actions → Services → Repositories → Dexie (local) | Supabase (produção)
```

Detalhes, regras por camada e Server vs Client: `docs/ARCHITECTURE.md`.

### Regras de ouro

- **UI jamais acessa Supabase diretamente.** Sempre via repository.
- **Leitura** → Server Components + repository.
- **Escrita/mutação** → Server Actions + service + repository.
- **Validação** → client (Zod) E server (Zod novamente). Sempre os dois.
- **Lógica pesada** → nunca em componentes. Sempre em services.
- **Trocar fonte de dados** → apenas via factory de repositories (`docs/DEV_MODE.md`).

---

## Estrutura de Pastas

```
src/
  actions/         # Server Actions (mutações, auth)
  services/        # Regras de negócio e casos de uso
  repositories/    # Acesso ao Supabase e/ou Dexie
  validations/     # Schemas Zod
  hooks/           # Custom React hooks
  stores/          # Zustand stores
  lib/
    auth/          # getAuthenticatedUser, getUserRole
    supabase/      # Clientes Supabase (client, server, admin)
    offline/       # Dexie DB + Outbox + Executor (se Offline = sim)
    data-source/   # Factory: local vs supabase
    errors/        # AppError, handle-error
    types/         # ActionResponse e tipos compartilhados
    utils/         # cn(), formatters, helpers de data/hora
  components/
    ui/            # Primitivos visuais iOS reutilizáveis (sem lógica de negócio)
    layout/        # Navbar, sidebar, tabs, HeaderSyncStatus
    features/      # Componentes com regra de negócio
  app/             # Rotas Next.js App Router
```

---

## Convenções de Nomenclatura


| Contexto                 | Padrão                          | Exemplo                           |
| ------------------------ | ------------------------------- | --------------------------------- |
| Variáveis e campos DB    | `snake_case` PT-BR sem acento   | `data_evento`, `valor_total`      |
| Funções/APIs/integrações | `camelCase` inglês              | `getUserById`, `syncOutbox`       |
| Componentes React        | `PascalCase`                    | `RegistroCard`, `ModuloSelector`  |
| Arquivos de componente   | `kebab-case`                    | `registro-card.tsx`               |
| Server action            | `kebab-case` + `-actions.ts`    | `registro-actions.ts`             |
| Service                  | `kebab-case` + `-service.ts`    | `registro-service.ts`             |
| Repository (interface)   | `kebab-case` + `-repository.ts` | `registro-repository.ts`          |
| Repository local         | `+ .local.ts`                   | `registro-repository.local.ts`    |
| Repository supabase      | `+ .supabase.ts`                | `registro-repository.supabase.ts` |
| Schema Zod               | `kebab-case` + `-schema.ts`     | `registro-schema.ts`              |
| Store Zustand            | `kebab-case` + `-store.ts`      | `registro-store.ts`               |
| Comentários e UI         | PT-BR obrigatório               | "Salvo com sucesso"               |


Detalhes completos: `docs/CONVENTIONS.md`.

---

## Data e Hora (PT-BR)

> Fonte única: `docs/DATE_TIME.md`.

- UI: `dd/MM/yyyy` e horas em Brasília (`America/Sao_Paulo`).
- Banco: `TIMESTAMPTZ` UTC; campos só-data como `DATE`.
- Campo editável pelo usuário (ex: `data_real_evento`) ≠ `created_at`.
- **Nunca** exibir ISO ou formato americano na UI.

---

## Erros e Respostas

> Fonte única: `docs/ERROR_HANDLING.md`.

- Server Actions retornam `ActionResponse<T>` — nunca lançam exceção ao client.
- Todo `catch` com `console.error('[funcao]', error)` — **nunca** `catch {}` vazio.
- UI: toast via Sonner. Nunca expor stacktrace.

---

## Segurança

> Detalhes: `docs/SECURITY.md`.

- Nunca confiar no client. Validação crítica no server.
- RLS obrigatório em todas as tabelas Supabase (quando `DATA_SOURCE=supabase`).
- **Nunca** expor `SUPABASE_SECRET_KEY` no client — somente `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Secrets apenas server-side (sem prefixo `NEXT_PUBLIC_`).

---

## Offline (PWA) — quando habilitado

> Detalhes: `docs/OFFLINE.md`.

1. **Abertura/login:** internet obrigatória.
2. **Durante uso:** continua offline se a rede cair (Outbox/IndexedDB).
3. **Reconexão:** sync em segundo plano.
4. **Header:** status Online / Sincronizando / Offline / Erro.

---

## Modo de Construção sem Supabase

> Detalhes: `docs/DEV_MODE.md`.

- `DATA_SOURCE=local` → Dexie/IndexedDB, sem Supabase.
- Após aprovação → `DATA_SOURCE=supabase`, migrations, RLS.

---

## Limpeza de Dados Locais (Admin)

> Detalhes: `docs/LOCAL_DATA.md`.

- Configurações → Admin (role admin).
- Obrigatório antes de produção.

---

## Checklist de Entrega (OBRIGATÓRIO)

- `npm run lint` — zero warnings
- `npm run type-check` — zero erros
- `npm run build` — sucesso
- Sem `any`, sem `catch {}` vazio, sem Supabase em componentes
- Datas em `dd/MM/yyyy`, horas em Brasília
- `PROJECT_MAP.md` atualizado

---

## O que é ESTRITAMENTE PROIBIDO

- Refatorar código fora do escopo de `TASKS.md`
- Alterar arquitetura de camadas
- Abstrações ou hooks desnecessários
- `any`, `eslint-disable`, `@ts-ignore`
- Estilos fora do Design System iOS / Tailwind
- Inventar ou trocar bibliotecas sem autorização
- Componentes > 200 linhas
- Duplicar regras de negócio ou lógica pesada em componentes
- Datas ISO ou formato americano na UI

---

## Arquivos de Referência

- `README.md` — visão geral do kit e fluxo de uso
- `docs/ARCHITECTURE.md` — arquitetura detalhada
- `docs/CONVENTIONS.md` — nomenclatura
- `docs/DATABASE.md` — tabelas, RLS, migrations
- `docs/BUSINESS_RULES.md` — regras de domínio (preencher por projeto)
- `docs/COMPONENTS.md` + `docs/DESIGN_TOKENS.md` — UI iOS
- `docs/DATE_TIME.md` — data/hora PT-BR
- `docs/DEV_MODE.md` — local vs supabase
- `docs/ERROR_HANDLING.md` — erros e ActionResponse
- `docs/SECURITY.md` — auth, RLS, secrets
- `docs/OFFLINE.md` — offline/PWA
- `docs/LOCAL_DATA.md` — limpeza de dados locais
- `docs/TESTING.md` — Vitest + Playwright
- `BOOTSTRAP.md` — checklist ao criar projeto
- `PROJECT_MAP.md` — mapa vivo (preencher no projeto)
- `TASKS.md` — escopo da sessão atual


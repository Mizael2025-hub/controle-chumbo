# Kit de Governança — Next.js + Supabase

Template universal de **regras, documentação e arquitetura** para projetos Next.js.  
**Não contém código de aplicação** — copie esta pasta ao iniciar cada projeto novo.

---

## O que é / o que não é

| É | Não é |
|---|---|
| Regras para agentes de IA (Cursor) | Um app rodando |
| Docs de arquitetura, segurança, offline | Banco de dados de um domínio específico |
| Templates de TASKS e PROJECT_MAP | Código em `src/` |

Exemplos marcados `[EXEMPLO]` nos docs são **didáticos**. Dados reais vão em `DATABASE.md` e `BUSINESS_RULES.md` **após copiar** para o projeto.

---

## Fluxo rápido

```
1. Copiar pasta inteira → novo repositório
2. Preencher arquivos da Fase A (cada um tem bloco "O que preencher aqui" no topo)
3. Scaffold Next.js (ver BOOTSTRAP.md)
4. DATA_SOURCE=local → validar telas
5. Aprovar → DATA_SOURCE=supabase → produção (Fase D)
6. Antes de cada sessão Cursor → TASKS.md (Fase B)
```

---

## Fases — quando preencher o quê

| Fase | Quando | Arquivos |
|---|---|---|
| **A** | Ao criar o projeto | `AGENTS.md`, `BUSINESS_RULES.md`, `DATABASE.md`, `PROJECT_MAP.md`, `.env.local` |
| **B** | Antes de cada sessão IA | `TASKS.md` |
| **C** | Conforme constrói | `PROJECT_MAP.md` (+ `DATABASE.md` se schema mudar) |
| **D** | Migração local → Supabase | `.env.local`, `AGENTS.md` (Fonte de dados), `PROJECT_MAP.md` (DATA_SOURCE atual) |

Abra cada arquivo da Fase A — o bloco **O que preencher aqui** no topo diz exatamente o que substituir.

---

## Quem é dono de cada informação (não repetir)

| Informação | Escreva em | Não repetir em |
|---|---|---|
| Nome, offline, DATA_SOURCE inicial | `AGENTS.md` | `PROJECT_MAP.md` |
| Regras de negócio, roles, fluxos | `BUSINESS_RULES.md` | `DATABASE.md` (só SQL/RLS) |
| Schema SQL, RLS, migrations | `DATABASE.md` | `BUSINESS_RULES.md` |
| Inventário de código | `PROJECT_MAP.md` | outros |
| Escopo da sessão | `TASKS.md` | — |
| Secrets | `.env.local` | deve bater com AGENTS |

---

## Arquivos da Fase A (setup inicial)

| Arquivo | Leia o bloco no topo do arquivo |
|---|---|
| `AGENTS.md` | Identidade — 8 campos |
| `docs/BUSINESS_RULES.md` | Todas as seções `[PREENCHER]` |
| `docs/DATABASE.md` | Apagar `[EXEMPLO]`, criar tabelas reais |
| `PROJECT_MAP.md` | Módulos e rotas planejadas (sem repetir nome do AGENTS) |
| `.env.local` | Copiar de `.env.example` |

## Fase B (cada sessão com IA)

| Arquivo | Leia o bloco no topo do arquivo |
|---|---|
| `TASKS.md` | Só a TAREFA ATUAL |

---

## Como a IA navega este kit

1. **Sempre:** `AGENTS.md` + `.cursor/rules/00-global.mdc`
2. **Por arquivo editado:** rules `01`–`04` (carregamento automático por glob)
3. **Sob demanda:** docs referenciados em `TASKS.md`

Não é necessário ler todos os 13 docs em toda sessão.

---

## Estrutura do kit

```
├── AGENTS.md              ← contrato principal para IA
├── TASKS.md               ← escopo da sessão atual
├── PROJECT_MAP.md         ← inventário do projeto (vazio no kit)
├── BOOTSTRAP.md           ← checklist passo a passo
├── .cursor/rules/         ← regras automáticas do Cursor
├── docs/                  ← documentação técnica por domínio
└── .env.example           ← variáveis de ambiente
```

---

## Stack padrão

Next.js (App Router) · TypeScript strict · Tailwind · Design System iOS · Supabase · Zustand · TanStack Query/Table · Zod · React Hook Form · Sonner · date-fns · Dexie (se Offline/PWA)

Detalhes: `AGENTS.md` e `BOOTSTRAP.md`.

---

## Documentação técnica (`docs/`)

| Doc | Quando consultar |
|---|---|
| `ARCHITECTURE.md` | Camadas, fluxo de dados |
| `CONVENTIONS.md` | Nomenclatura de arquivos e código |
| `DATABASE.md` | Schema, RLS, migrations |
| `SECURITY.md` | Auth, roles, secrets |
| `DATE_TIME.md` | Formato dd/MM/yyyy, Brasília |
| `DEV_MODE.md` | DATA_SOURCE local vs supabase |
| `ERROR_HANDLING.md` | ActionResponse, AppError, toasts |
| `COMPONENTS.md` + `DESIGN_TOKENS.md` | UI estilo iOS |
| `OFFLINE.md` | PWA, Outbox, sync (se Offline=sim) |
| `LOCAL_DATA.md` | Limpeza de dados do navegador |
| `TESTING.md` | Vitest + Playwright |

---

Consulte `BOOTSTRAP.md` para o checklist completo de criação de projeto.

# ARCHITECTURE.md — Visão da Arquitetura

> Resumo da arquitetura. Detalhes completos em `AGENTS.md` e docs específicos.

---

## Fluxo de Dados

```
UI (Server/Client Components)
        ↓
Server Actions (mutações, auth)
        ↓
Services (regras de negócio, cálculos)
        ↓
Repositories (factory: local | supabase)
        ↓
Dexie (local)  OU  Supabase (produção)
```

---

## Regras por Camada

| Camada | Responsabilidade | Proibido |
|---|---|---|
| **UI** | Renderização, interação, formulários | Supabase direto, lógica de negócio |
| **Actions** | Validação Zod, auth, orquestração | Queries SQL, cálculos |
| **Services** | Regras de negócio, cálculos, AppError | Acesso direto ao banco |
| **Repositories** | Queries, CRUD, mapeamento | Lógica de negócio, validação Zod |

---

## Server vs Client Components

| Tipo | Usar para |
|---|---|
| **Server Component** (padrão) | Leitura, dashboards, tabelas, relatórios |
| **Client Component** (`'use client'`) | Estado, eventos, formulários, hooks de browser |

---

## Fonte de Dados (DATA_SOURCE)

| Modo | Quando | Repository |
|---|---|---|
| `local` | Fase de construção | `.local.ts` → Dexie |
| `supabase` | Produção | `.supabase.ts` → Supabase + RLS |

Ver `docs/DEV_MODE.md`.

---

## Data e Hora

- **UI:** `dd/MM/yyyy` e `HH:mm` (horário de Brasília)
- **Banco:** UTC (`TIMESTAMPTZ`) e `DATE`
- **Conversão:** no service, via `src/lib/utils/date-time.ts`

Ver `docs/DATE_TIME.md`.

---

## Offline (quando habilitado)

1. **Login/abertura:** internet obrigatória
2. **Durante uso:** continua offline se cair a rede
3. **Reconexão:** sync em segundo plano

Ver `docs/OFFLINE.md`.

---

## Validação

1. Client: Zod + React Hook Form (UX)
2. Server: Zod no Action (segurança)

Sempre os dois.

---

## Padrão de Resposta

Todo Server Action retorna `ActionResponse<T>`. Definição, AppError e templates: `docs/ERROR_HANDLING.md`.

---

## Referências

- `AGENTS.md` — guia completo para agentes
- `docs/CONVENTIONS.md` — nomenclatura
- `docs/SECURITY.md` — auth, RLS, secrets
- `docs/LOCAL_DATA.md` — limpeza de dados locais

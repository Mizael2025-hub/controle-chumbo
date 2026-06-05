# CONVENTIONS.md — Convenções de Nomenclatura e Organização

> Fonte única de nomenclatura. Templates de código: `.cursor/rules/02` a `04`.

---

## Princípio Fundamental

- **Domínio / campos de banco:** PT-BR sem acento, `snake_case`
- **Infraestrutura / APIs:** inglês, `camelCase` ou `kebab-case`
- **Comentários e UI:** PT-BR obrigatório
- **Datas/horas na UI:** `docs/DATE_TIME.md`

---

## Arquivos e Pastas

### Server Actions → `src/actions/[entidade]-actions.ts`

Funções em português: `criarRegistro`, `atualizarRegistro`, `deletarRegistro`, `buscarRegistros`.

Template: `.cursor/rules/02-actions-services.mdc`

### Services → `src/services/[entidade]-service.ts`

Toda lógica de negócio e cálculos. Template: `.cursor/rules/02-actions-services.mdc`

### Repositories → `src/repositories/`

Cada entidade tem **três arquivos** + factory:

```
[entidade]-repository.ts           ← interface/tipo compartilhado
[entidade]-repository.local.ts     ← Dexie (DATA_SOURCE=local)
[entidade]-repository.supabase.ts  ← Supabase (DATA_SOURCE=supabase)
```

Métodos CRUD em inglês (`findById`, `create`, `update`, `softDelete`).  
Uso via `getXxxRepository()` — nunca importar implementação concreta no service.

Template: `.cursor/rules/03-repositories.mdc` · Factory: `docs/DEV_MODE.md`

### Schemas Zod → `src/validations/[entidade]/`

```
[entidade]-schema.ts
[entidade]-types.ts
```

Template: `.cursor/rules/04-validations.mdc` · Datas: `docs/DATE_TIME.md`

### Hooks → `src/hooks/use-[descricao].ts`

### Stores → `src/stores/[entidade]-store.ts`

### Componentes → `src/components/`

| Pasta | Conteúdo |
|---|---|
| `ui/` | Primitivos visuais iOS — sem lógica de negócio |
| `layout/` | Navbar, Sidebar, HeaderSyncStatus |
| `features/[dominio]/` | Componentes com regra de negócio |

Visual: `docs/COMPONENTS.md` + `docs/DESIGN_TOKENS.md`

### Rotas → `src/app/`

```
(auth)/login/page.tsx
(app)/layout.tsx, dashboard/, [modulo]/, configuracoes/
```

Toda rota com fetch: `loading.tsx` + `error.tsx`.

---

## Data e Hora

> Fonte única: `docs/DATE_TIME.md`.

| Contexto | Formato |
|---|---|
| UI — data | `dd/MM/yyyy` |
| UI — hora | `HH:mm` (Brasília) |
| Banco — timestamp | UTC `TIMESTAMPTZ` |
| Banco — só data | `DATE` |

---

## Variáveis e Campos

**Banco (snake_case, PT-BR):** `data_evento`, `valor_total`, `categoria_id`, `created_by`

**TypeScript (camelCase):** `registroSelecionado`, `dataEvento`, `valorTotal`

**Repository (métodos, inglês):** `findById`, `findAll`, `create`, `update`, `softDelete`

---

## Tipos TypeScript

```typescript
// [EXEMPLO — substituir pela entidade do projeto]
type Registro = Database['public']['Tables']['registros']['Row']
type RegistroInsert = Database['public']['Tables']['registros']['Insert']
type RegistroUpdate = Database['public']['Tables']['registros']['Update']

type StatusSync = 'online' | 'sincronizando' | 'offline' | 'erro'
type DataSource = 'local' | 'supabase'
```

---

## Constantes e Roles

```typescript
const APP_TIMEZONE = 'America/Sao_Paulo'

// [EXEMPLO] Roles típicos — adaptar em docs/BUSINESS_RULES.md
const ROLES = {
  ADMIN: 'admin',
  GERENTE: 'gerente',
  OPERADOR: 'operador',
} as const
```

---

## Mensagens de UI (sempre PT-BR)

```typescript
toast.success('Registro salvo com sucesso!')
toast.error('Erro ao salvar. Tente novamente.')
toast.info('Salvo no dispositivo. Será sincronizado ao reconectar.')
```

---

## Resumo Rápido

| O que é | Convenção | Idioma |
|---|---|---|
| Campo do banco | `snake_case` | PT-BR sem acento |
| Variável de domínio | `camelCase` | PT-BR sem acento |
| Variável de infra | `camelCase` | Inglês |
| Repository (métodos) | `camelCase` CRUD | Inglês |
| Nome de arquivo | `kebab-case` | Inglês ou PT-BR |
| Componente React | `PascalCase` | PT-BR sem acento |
| Data na UI | `dd/MM/yyyy` | PT-BR |
| Hora na UI | `HH:mm` Brasília | PT-BR |
| Comentário / UI | — | PT-BR |

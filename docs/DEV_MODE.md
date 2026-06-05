# DEV_MODE.md — Modo de Construção sem Supabase

> Permite validar telas, fluxos e regras de negócio **antes** de configurar o Supabase.
> Após aprovação, altere `DATA_SOURCE=supabase` e configure o banco.

---

## Como Funciona

| `DATA_SOURCE` | Comportamento |
|---|---|
| `local` | Repositories usam Dexie/IndexedDB. Sem Supabase, sem Auth real. |
| `supabase` | Repositories usam Supabase com Auth + RLS. Modo produção. |

A **UI, services e actions não mudam** — apenas a camada de repository troca de implementação via factory.

---

## Variável de Ambiente

```bash
# .env.local — fase de construção
DATA_SOURCE=local

# .env.local — após aprovação
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
```

> `DATA_SOURCE` **não** usa prefixo `NEXT_PUBLIC_` — é lida apenas no server.

---

## Arquitetura da Factory

```
src/lib/data-source/
  index.ts              ← getDataSource() retorna 'local' | 'supabase'
  get-repository.ts     ← factory que retorna o repository correto

src/repositories/
  [entidade]-repository.ts          ← interface/tipo compartilhado [EXEMPLO: registro]
  [entidade]-repository.local.ts    ← implementação Dexie
  [entidade]-repository.supabase.ts ← implementação Supabase
```

### Factory

```typescript
// src/lib/data-source/index.ts
export type DataSource = 'local' | 'supabase'

export function getDataSource(): DataSource {
  const source = process.env.DATA_SOURCE
  if (source === 'supabase') return 'supabase'
  return 'local'
}
```

```typescript
// src/lib/data-source/get-repository.ts
import { getDataSource } from './index'
import { registroRepositoryLocal } from '@/repositories/registro-repository.local'
import { registroRepositorySupabase } from '@/repositories/registro-repository.supabase'

export function getRegistroRepository() {
  return getDataSource() === 'supabase'
    ? registroRepositorySupabase
    : registroRepositoryLocal
}
```

### Uso no Service

```typescript
// src/services/registro-service.ts
import { getRegistroRepository } from '@/lib/data-source/get-repository'

export async function criarRegistro(data: CriarRegistroInput) {
  const repo = getRegistroRepository()
  return repo.create(data)
}
```

---

## Modo Local — Comportamento

- **Auth:** usar usuário mock fixo (ex: `{ id: 'dev-user', role: 'admin' }`) em `getAuthenticatedUser()`.
- **Dados:** persistidos em Dexie/IndexedDB — sobrevivem ao recarregar a página.
- **Sem rede:** funciona normalmente (não precisa de internet).
- **Outbox/sync:** desabilitado enquanto `DATA_SOURCE=local`.
- **RLS:** não aplicável — validações de permissão simuladas no service se necessário.

---

## Modo Supabase — Comportamento

- **Auth:** Supabase Auth real (`getUser()` no server).
- **Dados:** PostgreSQL com RLS.
- **Offline:** conforme `docs/OFFLINE.md` (se habilitado).
- **Migrations:** aplicar conforme `docs/DATABASE.md`.

---

## Fluxo Recomendado

```
1. DATA_SOURCE=local
   → Construir telas, services, validations
   → Testar fluxos completos localmente

2. Aprovação do responsável
   → Limpar dados locais (docs/LOCAL_DATA.md)

3. DATA_SOURCE=supabase
   → Criar projeto Supabase
   → Aplicar migrations + RLS
   → Implementar repositories .supabase.ts
   → Testar login + sync + offline
```

---

## Regras para o Cursor

- **Nunca** acessar Supabase diretamente quando `DATA_SOURCE=local`.
- **Sempre** usar a factory `getXxxRepository()` — nunca importar repository concreto no service.
- **Nunca** commitar `.env.local` com secrets.
- Ao criar nova entidade, criar **duas** implementações de repository (local + supabase) ou documentar pendência.

---

## Checklist de Migração local → supabase

- [ ] Migrations criadas e aplicadas
- [ ] RLS configurado em todas as tabelas
- [ ] Repositories `.supabase.ts` implementados
- [ ] Auth real funcionando
- [ ] `DATA_SOURCE=supabase` no `.env.local`
- [ ] Dados locais limpos via Configurações → Admin
- [ ] Testes E2E passando com Supabase

# OFFLINE.md — Estratégia Offline e PWA

> O Cursor consulta este arquivo ao trabalhar com Dexie, Outbox, sync, service worker ou indicadores de status de rede.
> **Aplicável apenas quando AGENTS.md → Offline/PWA = sim.**

---

## Princípios

1. **Login/abertura exige internet** — autenticar, baixar dados de referência e sincronizar pendências.
2. **Durante o uso, internet cai → continua funcionando** — dados vão para IndexedDB (Outbox).
3. **Reconexão → sync em segundo plano** — a UI nunca trava.
4. **Header sempre mostra o status** — Online / Sincronizando / Offline / Erro.

> Quando `DATA_SOURCE=local`, offline/sync **não se aplica** — ver `docs/DEV_MODE.md`.

---

## Fluxo Completo

```
[Usuário abre app / faz login]
        ↓
[Tem internet?] ──NO──→ Bloquear com tela: "Conecte-se à internet para iniciar"
        │
       YES
        ↓
Autenticar (Supabase Auth) + baixar dados de referência + sync pendências
        ↓
[Usuário usa o sistema normalmente]
        ↓
[Salvar dado]
        ↓
[Online?] ──YES──→ Server Action → Supabase ✅
        │
        NO (internet caiu durante uso)
        ↓
IndexedDB (Dexie) → Outbox queue
Toast: "Salvo no dispositivo. Será sincronizado ao reconectar."
        ↓
[Internet volta] ──→ Outbox Executor (background) → Supabase ✅
        ↓
Remove da fila · Header: "Online"
```

---

## Gate de Login — Internet Obrigatória

```typescript
// src/components/features/auth/login-gate.tsx
'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (!online) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <WifiOff className="w-12 h-12 text-amber-500" />
        <h1 className="text-xl font-semibold">Sem conexão com a internet</h1>
        <p className="text-zinc-500 text-center">
          Conecte-se à internet para abrir ou entrar no sistema.
          Após o login, o sistema continua funcionando se a conexão cair.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
```

---

## Arquitetura de Arquivos

```
src/lib/offline/
  db.ts                    ← Dexie DB (schema das tabelas locais)
  outbox.ts                ← Funções de enqueue e dequeue
  outbox-executor.ts       ← Loop de sincronização em background
  clear-local-data.ts      ← Limpeza de dados locais (ver LOCAL_DATA.md)

src/lib/data-source/
  index.ts                 ← getDataSource()
  get-repository.ts        ← factory local vs supabase

src/components/providers/
  offline-sync-provider.tsx ← Provider React que gerencia sync foreground
  app-providers.tsx         ← Onde o OfflineSyncProvider é registrado

src/components/layout/
  header-sync-status.tsx    ← Indicador de status no header
```

---

## Dexie — Banco Local (IndexedDB)

```typescript
// src/lib/offline/db.ts
import Dexie, { type EntityTable } from 'dexie'

export interface OutboxItem {
  id: string               // UUID gerado no client (idempotency key)
  action: string           // 'CREATE_REGISTRO' | 'UPDATE_REGISTRO' | ...
  payload: Record<string, unknown>
  created_at: string       // ISO string — quando o usuário salvou
  tentativas: number
  status: 'pendente' | 'enviando' | 'erro'
  erro_mensagem?: string
}

class OfflineDB extends Dexie {
  outbox!: EntityTable<OutboxItem, 'id'>

  constructor() {
    super('app-offline')
    this.version(1).stores({
      outbox: 'id, action, status, created_at',
    })
  }
}

export const db = new OfflineDB()
```

---

## Outbox — Fila de Operações

```typescript
// src/lib/offline/outbox.ts
import { db, type OutboxItem } from './db'
import { v4 as uuid } from 'uuid'

export async function enqueueOutbox(
  action: string,
  payload: Record<string, unknown>
): Promise<void> {
  await db.outbox.add({
    id: uuid(),
    action,
    payload,
    created_at: new Date().toISOString(),
    tentativas: 0,
    status: 'pendente',
  })
}

export async function getPendingItems(): Promise<OutboxItem[]> {
  return db.outbox.where('status').anyOf(['pendente', 'erro']).toArray()
}

export async function removeFromOutbox(id: string): Promise<void> {
  await db.outbox.delete(id)
}

export async function markAsError(id: string, mensagem: string): Promise<void> {
  await db.outbox.update(id, { status: 'erro', erro_mensagem: mensagem })
}

export async function countPending(): Promise<number> {
  return db.outbox.where('status').equals('pendente').count()
}
```

---

## Outbox Executor — Sincronização em Background

```typescript
// src/lib/offline/outbox-executor.ts
import { getPendingItems, removeFromOutbox, markAsError, db } from './outbox'

const MAX_TENTATIVAS = 5

export async function executarSync(): Promise<void> {
  if (!navigator.onLine) return

  const pendentes = await getPendingItems()

  for (const item of pendentes) {
    if (item.tentativas >= MAX_TENTATIVAS) {
      await markAsError(item.id, 'Número máximo de tentativas atingido.')
      continue
    }

    try {
      await db.outbox.update(item.id, { status: 'enviando' })

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: item.action, payload: item.payload }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      await removeFromOutbox(item.id)
    } catch (error) {
      console.error('[outboxExecutor]', item.action, error)
      await db.outbox.update(item.id, {
        status: 'pendente',
        tentativas: item.tentativas + 1,
      })
    }
  }
}
```

---

## Provider de Sincronização (Foreground)

```typescript
// src/components/providers/offline-sync-provider.tsx
'use client'

import { useEffect, useCallback, useState } from 'react'
import { executarSync } from '@/lib/offline/outbox-executor'
import { countPending } from '@/lib/offline/outbox'

export type SyncStatus = 'online' | 'sincronizando' | 'offline' | 'erro'

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online'
  )

  const sync = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus('offline')
      return
    }

    const pendentes = await countPending()
    if (pendentes === 0) {
      setStatus('online')
      return
    }

    setStatus('sincronizando')

    try {
      await executarSync()
      const restantes = await countPending()
      setStatus(restantes > 0 ? 'erro' : 'online')
    } catch (error) {
      console.error('[OfflineSyncProvider.sync]', error)
      setStatus('erro')
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => { setStatus('online'); sync() }
    const handleOffline = () => setStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    sync()

    const interval = setInterval(() => {
      if (navigator.onLine) sync()
    }, 30_000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [sync])

  return <>{children}</>
}
```

---

## Salvar com Fallback Offline

```typescript
// [EXEMPLO — substituir pela entidade do projeto]
import { enqueueOutbox } from '@/lib/offline/outbox'
import { criarRegistroAction } from '@/actions/registro-actions'
import { toast } from 'sonner'

export async function salvarRegistro(data: CriarRegistroInput) {
  if (!navigator.onLine) {
    await enqueueOutbox('CREATE_REGISTRO', {
      ...data,
      queued_at: new Date().toISOString(),
    })
    toast.info('Salvo no dispositivo. Será sincronizado ao reconectar.')
    return { success: true }
  }

  const result = await criarRegistroAction(data)

  if (!result.success) {
    toast.error(result.message ?? 'Erro ao salvar.')
    return result
  }

  toast.success('Registro salvo!')
  return result
}
```

---

## Resolução de Conflitos

```typescript
// Regra: updated_at mais recente vence
function resolverConflito(
  local: { updated_at: string },
  servidor: { updated_at: string }
): 'local' | 'servidor' {
  return new Date(servidor.updated_at) > new Date(local.updated_at)
    ? 'servidor'
    : 'local'
}
```

---

## Indicador de Status no Header

| Status | Ícone | Texto |
|---|---|---|
| `online` | Wifi | Online |
| `sincronizando` | RefreshCw (spin) | Sincronizando... |
| `offline` | WifiOff | Offline · N pendente(s) |
| `erro` | AlertCircle | Erro de sincronização |

Implementação: `src/components/layout/header-sync-status.tsx` (ver `docs/COMPONENTS.md` seção Layout).

---

## Route Handler — `/api/sync`

O Outbox Executor envia pendências para este endpoint. Criar no scaffold:

```typescript
// src/app/api/sync/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
// [EXEMPLO] importar actions conforme entidade do projeto

export async function POST(request: Request) {
  try {
    await getAuthenticatedUser()
    const { action, payload } = await request.json()

    // [EXEMPLO] despachar action conforme tipo
    switch (action) {
      case 'CREATE_REGISTRO':
        // await criarRegistroAction(payload)
        break
      default:
        return NextResponse.json({ success: false, message: 'Ação desconhecida.' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/sync]', error)
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 })
  }
}
```

> Registrar rota em `BOOTSTRAP.md` (infra mínima Offline).

---

## Prioridades Absolutas

1. **Login/abertura bloqueia sem internet**
2. **Durante uso, nunca bloquear** por falta de conexão
3. **Sync sempre em background** — UI nunca trava
4. **Nunca perder** dados que o usuário digitou
5. **Nunca duplicar** registros (usar UUID do client como idempotency key)
6. **Limpar dados locais** antes de produção (`docs/LOCAL_DATA.md`)

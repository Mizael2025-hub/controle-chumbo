# LOCAL_DATA.md — Limpeza de Dados do Navegador

> Funcionalidade de **Configurações → Admin** para limpar todos os dados locais.
> Essencial na fase de testes e obrigatório antes de ir para produção.

---

## O que é Limpo

| Armazenamento | Conteúdo |
|---|---|
| **IndexedDB (Dexie)** | Fila offline (Outbox), cache local de dados |
| **localStorage** | Preferências, tokens de sessão local (se houver) |
| **sessionStorage** | Estado temporário da sessão |
| **Cache API** | Service Worker cache (PWA) |

> Funciona em Chrome, Firefox, Safari, Edge — desktop, celular e tablet.

---

## Onde Fica na UI

```
Configurações
  └── Admin (somente role admin)
        └── "Limpar dados locais"
              └── Modal de confirmação com aviso
                    └── Botão "Confirmar limpeza"
```

---

## Fluxo do Usuário

1. Admin acessa **Configurações → Limpar dados locais**.
2. Modal exibe aviso: *"Todos os dados salvos neste dispositivo serão removidos, incluindo registros pendentes de sincronização. Esta ação não pode ser desfeita."*
3. Admin confirma digitando **LIMPAR** ou clicando em confirmar.
4. Sistema executa limpeza e exibe toast: *"Dados locais removidos com sucesso."*
5. Redireciona para `/login` (se autenticado) ou recarrega a página.

---

## Implementação

### Server Action

```typescript
// src/actions/local-data-actions.ts
'use server'

import type { ActionResponse } from '@/lib/types/action-response'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'

export async function limparDadosLocaisAction(): Promise<ActionResponse> {
  try {
    await getAuthenticatedUser()
    const role = await getUserRole()

    if (role !== 'admin') {
      return { success: false, message: 'Acesso negado. Somente administradores.' }
    }

    // A limpeza real acontece no client (IndexedDB/cache não acessível no server)
    return { success: true, message: 'Autorizado. Execute a limpeza no dispositivo.' }
  } catch (error) {
    console.error('[limparDadosLocaisAction]', error)
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}
```

### Função Client (limpeza real)

```typescript
// src/lib/offline/clear-local-data.ts
import { db } from './db'

export async function clearAllLocalData(): Promise<void> {
  // 1. IndexedDB (Dexie)
  await db.delete()
  await db.open()

  // 2. localStorage e sessionStorage
  localStorage.clear()
  sessionStorage.clear()

  // 3. Cache API (Service Worker)
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
  }

  // 4. Desregistrar Service Workers (opcional, força reload limpo)
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((reg) => reg.unregister()))
  }
}
```

### Componente Admin

```typescript
// src/components/features/configuracoes/limpar-dados-locais.tsx
'use client'

import { clearAllLocalData } from '@/lib/offline/clear-local-data'
import { limparDadosLocaisAction } from '@/actions/local-data-actions'
import { toast } from 'sonner'

export async function handleLimparDados() {
  const auth = await limparDadosLocaisAction()
  if (!auth.success) {
    toast.error(auth.message)
    return
  }

  await clearAllLocalData()
  toast.success('Dados locais removidos com sucesso.')
  window.location.href = '/login'
}
```

---

## Reset operacional (testes)

Em **Cadastros base** (admin), painel **Reset operacional**: remove lotes, montes, consumo e histórico de saída, **mantendo** ligas, setores, destinos, operadores, turnos e modelos.

- Dexie: `src/lib/offline/reset-dados-operacionais.ts`
- Postgres: `supabase/scripts/reset_operacional_testes.sql`
- Rascunhos de **contagem física** (`contagem_estoque_linha`) **não** são apagados.

Confirmação: digitar `RESET`.

---

## Quando Usar

| Momento | Ação |
|---|---|
| **Durante testes** | Reset operacional (cadastros intactos) ou limpeza total do dispositivo |
| **Antes de DATA_SOURCE=supabase** | Limpar dados mock locais |
| **Antes de produção** | Limpar **todos** os dispositivos de teste |
| **Troca de usuário/dispositivo** | Limpar para evitar dados cruzados |

---

## Segurança

- Somente role `admin` pode executar.
- Confirmação explícita obrigatória (modal).
- Log no console: `console.warn('[clearAllLocalData] Dados locais removidos por admin')`.
- Não afeta dados no Supabase — apenas o dispositivo local.

---

## Checklist

- [ ] Tela em Configurações → Admin implementada
- [ ] Modal de confirmação com aviso claro
- [ ] Verificação de role admin no server
- [ ] IndexedDB, localStorage, sessionStorage e cache limpos
- [ ] Toast de sucesso + redirect para login
- [ ] Testado em Chrome mobile e desktop

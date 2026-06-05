import { isSupabaseDataSourceClient } from '@/lib/data-source/client'
import { db } from './db'
import {
  getPendingItems,
  markAsError,
  removeFromOutbox,
} from './outbox'

const MAX_TENTATIVAS = 5

export async function executarSync(): Promise<void> {
  if (!isSupabaseDataSourceClient()) return
  if (typeof navigator !== 'undefined' && !navigator.onLine) return

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

      const result = (await response.json()) as { success?: boolean; message?: string }

      if (!result.success) {
        throw new Error(result.message ?? 'Sync rejeitado pelo servidor.')
      }

      await removeFromOutbox(item.id)
    } catch (error) {
      console.error('[executarSync]', item.action, error)
      await db.outbox.update(item.id, {
        status: 'pendente',
        tentativas: item.tentativas + 1,
      })
    }
  }
}

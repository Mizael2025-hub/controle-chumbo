import { v4 as uuid } from 'uuid'
import { db } from './db'
import type { OutboxItem } from './types'

export async function enqueueOutbox(
  action: string,
  payload: Record<string, unknown>,
  id?: string
): Promise<string> {
  const itemId = id ?? uuid()

  await db.outbox.add({
    id: itemId,
    action,
    payload,
    created_at: new Date().toISOString(),
    tentativas: 0,
    status: 'pendente',
  })

  return itemId
}

export async function getPendingItems(): Promise<OutboxItem[]> {
  return db.outbox.where('status').anyOf(['pendente', 'erro']).sortBy('created_at')
}

export async function removeFromOutbox(id: string): Promise<void> {
  await db.outbox.delete(id)
}

export async function markAsError(id: string, mensagem: string): Promise<void> {
  await db.outbox.update(id, { status: 'erro', erro_mensagem: mensagem })
}

export async function countPending(): Promise<number> {
  return db.outbox.where('status').anyOf(['pendente', 'erro']).count()
}

export async function getOutboxItem(id: string): Promise<OutboxItem | undefined> {
  return db.outbox.get(id)
}

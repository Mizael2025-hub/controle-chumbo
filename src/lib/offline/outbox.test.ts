import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import {
  countPending,
  enqueueOutbox,
  getPendingItems,
  markAsError,
  removeFromOutbox,
} from './outbox'

describe('outbox', () => {
  beforeEach(async () => {
    await db.outbox.clear()
  })

  afterEach(async () => {
    await db.outbox.clear()
  })

  it('enfileira item com status pendente', async () => {
    const id = await enqueueOutbox('TEST_ACTION', { foo: 'bar' }, 'test-id-1')
    expect(id).toBe('test-id-1')

    const item = await db.outbox.get('test-id-1')
    expect(item?.status).toBe('pendente')
    expect(item?.action).toBe('TEST_ACTION')
  })

  it('lista pendentes em ordem FIFO por created_at', async () => {
    await enqueueOutbox('A', {}, 'id-a')
    await new Promise((r) => setTimeout(r, 5))
    await enqueueOutbox('B', {}, 'id-b')

    const pendentes = await getPendingItems()
    expect(pendentes).toHaveLength(2)
    expect(pendentes[0].id).toBe('id-a')
  })

  it('conta pendentes e remove da fila', async () => {
    await enqueueOutbox('A', {}, 'id-1')
    expect(await countPending()).toBe(1)

    await removeFromOutbox('id-1')
    expect(await countPending()).toBe(0)
  })

  it('marca erro com mensagem', async () => {
    await enqueueOutbox('A', {}, 'id-err')
    await markAsError('id-err', 'Falha de rede')

    const item = await db.outbox.get('id-err')
    expect(item?.status).toBe('erro')
    expect(item?.erro_mensagem).toBe('Falha de rede')
  })
})

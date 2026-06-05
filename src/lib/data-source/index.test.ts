import { describe, expect, it, afterEach } from 'vitest'
import { getDataSource, isLocalDataSource } from './index'

describe('getDataSource', () => {
  const original = process.env.DATA_SOURCE

  afterEach(() => {
    process.env.DATA_SOURCE = original
  })

  it('retorna local por padrão', () => {
    delete process.env.DATA_SOURCE
    expect(getDataSource()).toBe('local')
    expect(isLocalDataSource()).toBe(true)
  })

  it('retorna supabase quando configurado', () => {
    process.env.DATA_SOURCE = 'supabase'
    expect(getDataSource()).toBe('supabase')
  })
})

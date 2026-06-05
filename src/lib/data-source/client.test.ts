import { afterEach, describe, expect, it } from 'vitest'
import { getClientDataSource, isSupabaseDataSourceClient } from './client'

describe('getClientDataSource', () => {
  const original = process.env.NEXT_PUBLIC_DATA_SOURCE

  afterEach(() => {
    process.env.NEXT_PUBLIC_DATA_SOURCE = original
  })

  it('retorna local por padrão', () => {
    delete process.env.NEXT_PUBLIC_DATA_SOURCE
    expect(getClientDataSource()).toBe('local')
    expect(isSupabaseDataSourceClient()).toBe(false)
  })

  it('retorna supabase quando configurado', () => {
    process.env.NEXT_PUBLIC_DATA_SOURCE = 'supabase'
    expect(getClientDataSource()).toBe('supabase')
    expect(isSupabaseDataSourceClient()).toBe(true)
  })
})

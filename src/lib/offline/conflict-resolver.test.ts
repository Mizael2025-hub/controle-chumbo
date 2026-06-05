import { describe, expect, it } from 'vitest'
import { resolverConflito } from './conflict-resolver'

describe('resolverConflito', () => {
  it('prefere servidor quando updated_at é mais recente', () => {
    const result = resolverConflito(
      { updated_at: '2026-06-01T10:00:00Z' },
      { updated_at: '2026-06-02T10:00:00Z' }
    )
    expect(result).toBe('servidor')
  })

  it('prefere local quando updated_at local é mais recente', () => {
    const result = resolverConflito(
      { updated_at: '2026-06-03T10:00:00Z' },
      { updated_at: '2026-06-02T10:00:00Z' }
    )
    expect(result).toBe('local')
  })
})

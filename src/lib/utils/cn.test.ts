import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('combina classes Tailwind', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolve conflitos com tailwind-merge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

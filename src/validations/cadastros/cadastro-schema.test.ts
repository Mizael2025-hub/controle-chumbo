import { describe, expect, it } from 'vitest'
import {
  criarModeloProdutoSchema,
  atualizarModeloProdutoSchema,
} from '@/validations/cadastros/cadastro-schema'

describe('criarModeloProdutoSchema', () => {
  it('aceita modelo de grade completo', () => {
    const parsed = criarModeloProdutoSchema.safeParse({
      nome: 'Modelo A',
      polaridade: 'positiva',
      placas_por_grade: 4,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita placas por grade zero', () => {
    const parsed = criarModeloProdutoSchema.safeParse({
      nome: 'Modelo A',
      polaridade: 'negativa',
      placas_por_grade: 0,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejeita polaridade inválida', () => {
    const parsed = criarModeloProdutoSchema.safeParse({
      nome: 'Modelo A',
      polaridade: 'neutra',
      placas_por_grade: 4,
    })
    expect(parsed.success).toBe(false)
  })
})

describe('atualizarModeloProdutoSchema', () => {
  it('exige updated_at', () => {
    const parsed = atualizarModeloProdutoSchema.safeParse({
      id: '00000000-0000-4000-8000-000000000001',
      nome: 'Novo nome',
    })
    expect(parsed.success).toBe(false)
  })
})

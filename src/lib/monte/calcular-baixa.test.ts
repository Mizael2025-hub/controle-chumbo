import { describe, expect, it } from 'vitest'
import { calcularPesoBaixado } from '@/lib/monte/calcular-baixa'

describe('calcularPesoBaixado', () => {
  it('calcula peso proporcional às barras', () => {
    expect(calcularPesoBaixado(1200, 48, 10)).toBe(250)
  })

  it('retorna zero se barras atuais zero', () => {
    expect(calcularPesoBaixado(100, 0, 5)).toBe(0)
  })
})

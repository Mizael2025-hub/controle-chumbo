import { describe, expect, it } from 'vitest'
import { alocarBarrasConsumo } from '@/lib/consumo/alocar-barras'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type { Monte } from '@/repositories/monte-repository'

function monteMock(
  id: string,
  barras: number,
  peso: number,
  posY: number,
  posX: number
): Monte {
  const now = new Date().toISOString()
  return {
    id,
    lote_id: 'lote-1',
    peso_atual_kg: peso,
    barras_atuais: barras,
    posicao_x: posX,
    posicao_y: posY,
    status: STATUS_MONTE.DISPONIVEL,
    localizacao: 'setor',
    setor_id: 'setor-1',
    created_at: now,
    updated_at: now,
  }
}

describe('alocarBarrasConsumo', () => {
  it('consome em ordem até completar barras', () => {
    const montes = [
      monteMock('a', 15, 150, 0, 0),
      monteMock('b', 30, 300, 0, 1),
    ]
    const { alocacoes, barrasRestantes } = alocarBarrasConsumo(montes, 20)
    expect(barrasRestantes).toBe(0)
    expect(alocacoes).toHaveLength(2)
    expect(alocacoes[0].barras).toBe(15)
    expect(alocacoes[1].barras).toBe(5)
  })

  it('retorna saldo restante quando insuficiente', () => {
    const montes = [monteMock('a', 5, 50, 0, 0)]
    const { barrasRestantes } = alocarBarrasConsumo(montes, 10)
    expect(barrasRestantes).toBe(5)
  })
})

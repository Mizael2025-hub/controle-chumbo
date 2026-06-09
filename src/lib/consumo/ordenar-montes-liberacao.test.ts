import { describe, expect, it } from 'vitest'
import { alocarBarrasConsumo } from '@/lib/consumo/alocar-barras'
import { ordenarMontesPorLiberacao } from '@/lib/consumo/ordenar-montes-liberacao'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type { Monte } from '@/repositories/monte-repository'

function monteMock(
  id: string,
  barras: number,
  peso: number,
  movidoSetorEm: string | null,
  createdAt?: string
): Monte {
  const now = createdAt ?? new Date().toISOString()
  return {
    id,
    lote_id: 'lote-1',
    peso_atual_kg: peso,
    barras_atuais: barras,
    posicao_x: 0,
    posicao_y: 0,
    status: STATUS_MONTE.DISPONIVEL,
    localizacao: 'setor',
    setor_id: 'setor-1',
    movido_setor_em: movidoSetorEm,
    created_at: now,
    updated_at: now,
  }
}

describe('ordenarMontesPorLiberacao', () => {
  it('ordena por movido_setor_em ascendente', () => {
    const montes = [
      monteMock('b', 30, 300, '2026-06-08T12:00:00.000Z'),
      monteMock('a', 20, 200, '2026-06-08T10:00:00.000Z'),
    ]
    const ordenados = ordenarMontesPorLiberacao(montes)
    expect(ordenados.map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('desempata por id quando timestamps iguais', () => {
    const ts = '2026-06-08T10:00:00.000Z'
    const montes = [
      monteMock('z', 10, 100, ts),
      monteMock('a', 10, 100, ts),
    ]
    const ordenados = ordenarMontesPorLiberacao(montes)
    expect(ordenados.map((m) => m.id)).toEqual(['a', 'z'])
  })

  it('usa created_at quando movido_setor_em é nulo', () => {
    const montes = [
      monteMock('novo', 10, 100, null, '2026-06-08T14:00:00.000Z'),
      monteMock('antigo', 10, 100, null, '2026-06-08T08:00:00.000Z'),
    ]
    const ordenados = ordenarMontesPorLiberacao(montes)
    expect(ordenados.map((m) => m.id)).toEqual(['antigo', 'novo'])
  })

  it('cenário FIFO parcial: 10 do 1º + 5 do 2º em consumo de 15 barras', () => {
    const montes = ordenarMontesPorLiberacao([
      monteMock('b', 30, 300, '2026-06-08T12:00:00.000Z'),
      monteMock('a', 10, 100, '2026-06-08T10:00:00.000Z'),
    ])
    const { alocacoes, barrasRestantes } = alocarBarrasConsumo(montes, 15)
    expect(barrasRestantes).toBe(0)
    expect(alocacoes).toHaveLength(2)
    expect(alocacoes[0].monte.id).toBe('a')
    expect(alocacoes[0].barras).toBe(10)
    expect(alocacoes[1].monte.id).toBe('b')
    expect(alocacoes[1].barras).toBe(5)
  })
})

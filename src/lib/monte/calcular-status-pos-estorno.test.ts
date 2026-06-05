import { describe, expect, it } from 'vitest'
import { calcularStatusPosEstorno } from '@/lib/monte/calcular-status-pos-estorno'
import { STATUS_MONTE } from '@/lib/types/status-monte'

describe('calcularStatusPosEstorno', () => {
  it('retorna RESERVADO se monte tem reserva ativa', () => {
    expect(
      calcularStatusPosEstorno(
        { status: STATUS_MONTE.RESERVADO, reservado_para: 'VRLA', setor_reserva_id: 'x' },
        false
      )
    ).toBe(STATUS_MONTE.RESERVADO)
  })

  it('retorna PARCIAL se ainda há baixas não estornadas', () => {
    expect(
      calcularStatusPosEstorno(
        { status: STATUS_MONTE.CONSUMIDO, reservado_para: null, setor_reserva_id: null },
        true
      )
    ).toBe(STATUS_MONTE.PARCIAL)
  })

  it('retorna DISPONIVEL sem reserva e sem outras baixas', () => {
    expect(
      calcularStatusPosEstorno(
        { status: STATUS_MONTE.CONSUMIDO, reservado_para: null, setor_reserva_id: null },
        false
      )
    ).toBe(STATUS_MONTE.DISPONIVEL)
  })
})

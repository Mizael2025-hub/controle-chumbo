import { describe, expect, it } from 'vitest'
import { calcularSaldosMontes } from '@/lib/estoque/calcular-saldos'
import { STATUS_MONTE } from '@/lib/types/status-monte'

describe('calcularSaldosMontes', () => {
  it('ignora montes consumidos no saldo operacional', () => {
    const saldos = calcularSaldosMontes([
      {
        status: STATUS_MONTE.CONSUMIDO,
        peso_atual_kg: 0,
        barras_atuais: 0,
        reservado_para: null,
        setor_reserva_id: null,
        localizacao: 'almoxarifado',
      },
      {
        status: STATUS_MONTE.DISPONIVEL,
        peso_atual_kg: 100,
        barras_atuais: 10,
        reservado_para: null,
        setor_reserva_id: null,
        localizacao: 'almoxarifado',
      },
    ])

    expect(saldos.no_estoque.peso_kg).toBe(100)
    expect(saldos.reservado.peso_kg).toBe(0)
    expect(saldos.no_setor.peso_kg).toBe(0)
  })

  it('contabiliza reservado no almoxarifado dentro de no estoque', () => {
    const saldos = calcularSaldosMontes([
      {
        status: STATUS_MONTE.DISPONIVEL,
        peso_atual_kg: 500,
        barras_atuais: 20,
        reservado_para: null,
        setor_reserva_id: null,
        localizacao: 'almoxarifado',
      },
      {
        status: STATUS_MONTE.RESERVADO,
        peso_atual_kg: 300,
        barras_atuais: 12,
        reservado_para: 'Teleiras',
        setor_reserva_id: null,
        localizacao: 'almoxarifado',
      },
    ])

    expect(saldos.no_estoque.peso_kg).toBe(800)
    expect(saldos.reservado.peso_kg).toBe(300)
    expect(saldos.no_setor.peso_kg).toBe(0)
  })

  it('exclui montes no setor de no estoque e reservado', () => {
    const saldos = calcularSaldosMontes([
      {
        status: STATUS_MONTE.DISPONIVEL,
        peso_atual_kg: 200,
        barras_atuais: 10,
        reservado_para: null,
        setor_reserva_id: null,
        localizacao: 'setor',
      },
      {
        status: STATUS_MONTE.DISPONIVEL,
        peso_atual_kg: 100,
        barras_atuais: 5,
        reservado_para: null,
        setor_reserva_id: null,
        localizacao: 'almoxarifado',
      },
    ])

    expect(saldos.no_estoque.peso_kg).toBe(100)
    expect(saldos.reservado.peso_kg).toBe(0)
    expect(saldos.no_setor.peso_kg).toBe(200)
    expect(saldos.no_setor.barras).toBe(10)
  })
})

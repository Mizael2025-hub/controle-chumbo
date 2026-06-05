import type { MonteLocal } from '@/lib/offline/types'
import { STATUS_MONTE } from '@/lib/types/status-monte'

export type SaldosKgBarras = {
  peso_kg: number
  barras: number
}

export type SaldosEstoque = {
  no_estoque: SaldosKgBarras
  reservado: SaldosKgBarras
  no_setor: SaldosKgBarras
}

const ZEROS: SaldosKgBarras = { peso_kg: 0, barras: 0 }

export function criarSaldosVazios(): SaldosEstoque {
  return {
    no_estoque: { ...ZEROS },
    reservado: { ...ZEROS },
    no_setor: { ...ZEROS },
  }
}

export function monteEstaConsumido(monte: Pick<MonteLocal, 'status'>): boolean {
  return monte.status === STATUS_MONTE.CONSUMIDO
}

/** Reserva ativa: status RESERVADO ou campos de reserva preenchidos. */
export function monteTemReservaAtiva(
  monte: Pick<MonteLocal, 'status' | 'reservado_para' | 'setor_reserva_id'>
): boolean {
  if (monte.status === STATUS_MONTE.RESERVADO) return true
  return Boolean(monte.reservado_para) || Boolean(monte.setor_reserva_id)
}

export function calcularSaldosMontes(
  montes: Pick<
    MonteLocal,
    'status' | 'peso_atual_kg' | 'barras_atuais' | 'reservado_para' | 'setor_reserva_id' | 'localizacao'
  >[]
): SaldosEstoque {
  const saldos = criarSaldosVazios()

  for (const monte of montes) {
    if (monteEstaConsumido(monte)) continue

    if (monte.localizacao === 'setor') {
      saldos.no_setor.peso_kg += monte.peso_atual_kg
      saldos.no_setor.barras += monte.barras_atuais
      continue
    }

    saldos.no_estoque.peso_kg += monte.peso_atual_kg
    saldos.no_estoque.barras += monte.barras_atuais

    if (monteTemReservaAtiva(monte)) {
      saldos.reservado.peso_kg += monte.peso_atual_kg
      saldos.reservado.barras += monte.barras_atuais
    }
  }

  return saldos
}

export function somarSaldosEstoque(itens: SaldosEstoque[]): SaldosEstoque {
  return itens.reduce(
    (acc, item) => ({
      no_estoque: {
        peso_kg: acc.no_estoque.peso_kg + item.no_estoque.peso_kg,
        barras: acc.no_estoque.barras + item.no_estoque.barras,
      },
      reservado: {
        peso_kg: acc.reservado.peso_kg + item.reservado.peso_kg,
        barras: acc.reservado.barras + item.reservado.barras,
      },
      no_setor: {
        peso_kg: acc.no_setor.peso_kg + item.no_setor.peso_kg,
        barras: acc.no_setor.barras + item.no_setor.barras,
      },
    }),
    criarSaldosVazios()
  )
}

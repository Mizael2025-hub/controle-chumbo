import { monteTemReservaAtiva } from '@/lib/estoque/calcular-saldos'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type { MonteLocal } from '@/lib/offline/types'

/** Recalcula status do monte após estorno de uma baixa. */
export function calcularStatusPosEstorno(
  monte: Pick<MonteLocal, 'status' | 'reservado_para' | 'setor_reserva_id'>,
  temOutrasBaixasNaoEstornadas: boolean
): string {
  if (monteTemReservaAtiva(monte)) return STATUS_MONTE.RESERVADO
  if (temOutrasBaixasNaoEstornadas) return STATUS_MONTE.PARCIAL
  return STATUS_MONTE.DISPONIVEL
}

import { monteEstaConsumido, monteTemReservaAtiva } from '@/lib/estoque/calcular-saldos'
import type { Monte } from '@/repositories/estoque-repository'

export type TipoOperacaoSaida =
  | 'reserva'
  | 'cancelar_reserva'
  | 'mover_setor'
  | 'liberar_setor'
  | 'liberar_baixar'
  | 'venda_direta'

export function monteElegivelOperacao(monte: Monte, operacao: TipoOperacaoSaida): boolean {
  if (monteEstaConsumido(monte) || monte.barras_atuais <= 0) return false

  if (operacao === 'cancelar_reserva') {
    if (monte.localizacao !== 'almoxarifado') return false
    return monteTemReservaAtiva(monte)
  }

  if (operacao === 'mover_setor' || operacao === 'reserva') {
    if (monte.localizacao !== 'almoxarifado') return false
  }

  if (operacao === 'reserva' && monteTemReservaAtiva(monte)) return false

  if (
    operacao === 'liberar_setor' ||
    operacao === 'liberar_baixar' ||
    operacao === 'venda_direta'
  ) {
    if (monte.localizacao !== 'almoxarifado') return false
  }

  return true
}

export function monteElegivelSelecao(monte: Monte): boolean {
  if (monteEstaConsumido(monte) || monte.barras_atuais <= 0) return false
  if (monte.localizacao !== 'almoxarifado') return false
  return true
}

export function mensagemInelegivel(monte: Monte): string {
  if (monteEstaConsumido(monte)) return 'Monte já consumido.'
  if (monte.barras_atuais <= 0) return 'Monte sem saldo.'
  if (monte.localizacao !== 'almoxarifado') return 'Monte já está em um setor.'
  if (monteTemReservaAtiva(monte)) return 'Monte já reservado.'
  return 'Monte não elegível para esta operação.'
}

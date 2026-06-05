/** Status operacional do monte — ver docs/BUSINESS_RULES.md §3.2 */
export const STATUS_MONTE = {
  DISPONIVEL: 'DISPONIVEL',
  RESERVADO: 'RESERVADO',
  PARCIAL: 'PARCIAL',
  CONSUMIDO: 'CONSUMIDO',
} as const

export type StatusMonte = (typeof STATUS_MONTE)[keyof typeof STATUS_MONTE]

export const STATUS_MONTE_LABELS: Record<StatusMonte, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  PARCIAL: 'Parcial',
  CONSUMIDO: 'Consumido',
}

export function isStatusMonte(valor: string): valor is StatusMonte {
  return Object.values(STATUS_MONTE).includes(valor as StatusMonte)
}

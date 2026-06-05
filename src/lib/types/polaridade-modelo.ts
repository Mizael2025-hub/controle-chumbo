/** Polaridade de grade/painel/placa — ver docs/BUSINESS_RULES.md */
export const POLARIDADES_MODELO = ['positiva', 'negativa'] as const

export type PolaridadeModelo = (typeof POLARIDADES_MODELO)[number]

export const POLARIDADE_LABELS: Record<PolaridadeModelo, string> = {
  positiva: 'Positiva (+)',
  negativa: 'Negativa (−)',
}

export function isPolaridadeModelo(valor: string): valor is PolaridadeModelo {
  return POLARIDADES_MODELO.includes(valor as PolaridadeModelo)
}

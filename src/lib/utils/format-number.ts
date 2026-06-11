/** Formata número para exibição PT-BR (kg, barras, etc.). */
export function formatarNumeroPtBr(valor: number, casasDecimais = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor)
}

export function formatarKg(valor: number): string {
  return `${formatarNumeroPtBr(valor, valor % 1 === 0 ? 0 : 2)} kg`
}

/** Campo ordem opcional no form: vazio ou inválido vira undefined. */
export function parseSortOrderInput(value: string | number): number | undefined {
  return normalizeSortOrderInput(value)
}

/** Normaliza sort_order vindo de form ou server action antes de Zod/insert. */
export function normalizeSortOrderInput(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : Math.trunc(value)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const n = Number(trimmed)
    return Number.isNaN(n) ? undefined : Math.trunc(n)
  }
  return undefined
}

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
  if (value === '') return undefined
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(n) ? undefined : n
}

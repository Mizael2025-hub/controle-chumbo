/** Cálculo proporcional de peso na baixa por barras — ver BUSINESS_RULES §3.4 */
export function calcularPesoBaixado(
  pesoAtualKg: number,
  barrasAtuais: number,
  barrasBaixadas: number
): number {
  if (barrasAtuais <= 0 || barrasBaixadas <= 0) return 0
  const peso = (barrasBaixadas / barrasAtuais) * pesoAtualKg
  return Math.round(peso * 100) / 100
}

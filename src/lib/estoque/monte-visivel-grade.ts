/** Montes fora da grade 2D do almoxarifado (estoque virtual do setor). */
export const POSICAO_GRADE_SETOR_X = 99

export function monteVisivelNaGrade(monte: { posicao_x: number }): boolean {
  return monte.posicao_x < POSICAO_GRADE_SETOR_X
}

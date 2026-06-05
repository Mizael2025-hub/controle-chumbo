export type CelulaEntradaInput = {
  posicao_x: number
  posicao_y: number
  peso_atual_kg: number
  barras_atuais: number
}

export type SomaGradeEntrada = {
  peso_kg: number
  barras: number
}

export function somarCelulasEntrada(celulas: CelulaEntradaInput[]): SomaGradeEntrada {
  return celulas.reduce(
    (acc, c) => ({
      peso_kg: acc.peso_kg + c.peso_atual_kg,
      barras: acc.barras + c.barras_atuais,
    }),
    { peso_kg: 0, barras: 0 }
  )
}

export function temPosicoesDuplicadas(celulas: CelulaEntradaInput[]): boolean {
  const chaves = new Set<string>()
  for (const c of celulas) {
    const k = `${c.posicao_x}-${c.posicao_y}`
    if (chaves.has(k)) return true
    chaves.add(k)
  }
  return false
}

export function celulaForaDaGrade(
  c: CelulaEntradaInput,
  colunas: number,
  linhas: number
): boolean {
  return c.posicao_x < 0 || c.posicao_x >= colunas || c.posicao_y < 0 || c.posicao_y >= linhas
}

export function filtrarCelulasPreenchidas(celulas: CelulaEntradaInput[]): CelulaEntradaInput[] {
  return celulas.filter((c) => c.peso_atual_kg > 0 || c.barras_atuais > 0)
}

export function conferenciaDiferenteDosIniciais(
  soma: SomaGradeEntrada,
  pesoInicialKg: number,
  barrasIniciais: number
): boolean {
  const eps = 0.001
  return (
    Math.abs(soma.peso_kg - pesoInicialKg) > eps || soma.barras !== barrasIniciais
  )
}

export type TotalContagemPorLiga = {
  liga_id: string
  total_barras: number
}

export function agruparTotaisContagemPorLiga(
  linhas: { liga_id: string; quantidade_barras: number }[]
): TotalContagemPorLiga[] {
  const mapa = new Map<string, number>()
  for (const linha of linhas) {
    mapa.set(linha.liga_id, (mapa.get(linha.liga_id) ?? 0) + linha.quantidade_barras)
  }
  return Array.from(mapa.entries()).map(([liga_id, total_barras]) => ({
    liga_id,
    total_barras,
  }))
}

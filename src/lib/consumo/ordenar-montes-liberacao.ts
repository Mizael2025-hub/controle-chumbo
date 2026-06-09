import type { Monte } from '@/repositories/monte-repository'

type MonteOrdenavel = Pick<Monte, 'id' | 'movido_setor_em' | 'created_at'>

function timestampLiberacao(monte: MonteOrdenavel): string {
  return monte.movido_setor_em ?? monte.created_at
}

/** Ordena montes no setor: primeiro liberado = primeiro consumido (FIFO). */
export function ordenarMontesPorLiberacao<T extends MonteOrdenavel>(montes: T[]): T[] {
  return [...montes].sort((a, b) => {
    const cmp = timestampLiberacao(a).localeCompare(timestampLiberacao(b))
    if (cmp !== 0) return cmp

    const cmpCreated = a.created_at.localeCompare(b.created_at)
    if (cmpCreated !== 0) return cmpCreated

    return a.id.localeCompare(b.id)
  })
}

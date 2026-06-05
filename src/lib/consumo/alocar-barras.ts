import { calcularPesoBaixado } from '@/lib/monte/calcular-baixa'
import type { Monte } from '@/repositories/monte-repository'

export type AlocacaoBarrasItem = {
  monte: Monte
  barras: number
  peso: number
  kgPorBarra: number
}

/** Aloca barras entre montes na ordem fornecida (automático ou manual). */
export function alocarBarrasConsumo(
  montes: Monte[],
  barrasNecessarias: number
): { alocacoes: AlocacaoBarrasItem[]; barrasRestantes: number } {
  const alocacoes: AlocacaoBarrasItem[] = []
  let restante = barrasNecessarias

  for (const monte of montes) {
    if (restante <= 0) break
    const usar = Math.min(restante, monte.barras_atuais)
    const peso = calcularPesoBaixado(monte.peso_atual_kg, monte.barras_atuais, usar)
    const kgPorBarra =
      monte.barras_atuais > 0
        ? Math.round((monte.peso_atual_kg / monte.barras_atuais) * 10000) / 10000
        : 0
    alocacoes.push({ monte, barras: usar, peso, kgPorBarra })
    restante -= usar
  }

  return { alocacoes, barrasRestantes: restante }
}

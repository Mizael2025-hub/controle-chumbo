import { monteElegivelSelecao } from '@/lib/saida/monte-elegivel-operacao'
import type { Monte } from '@/repositories/estoque-repository'

/** Montes fora da seleção em lote (setor, consumido, etc.) abrem painel de resumo ao toque. */
export function monteDeveAbrirDetalhe(monte: Monte): boolean {
  return !monteElegivelSelecao(monte)
}

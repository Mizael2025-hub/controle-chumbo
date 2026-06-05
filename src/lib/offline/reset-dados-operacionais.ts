import { db } from './db'

/** Tabelas operacionais esvaziadas no reset — cadastros base permanecem intactos. */
export const TABELAS_RESET_OPERACIONAL = [
  'alocacoes_consumo',
  'apontamentos_consumo',
  'transacoes_saida',
  'eventos_monte',
  'montes',
  'lotes',
  'outbox',
] as const

/**
 * Remove movimentação, estoque, consumo e fila offline.
 * Preserva: ligas, destinos_saida, operadores, modelos_produto, setores, maquinas, turnos, usuarios.
 * Não remove: contagem_estoque_linha (rascunho de auditoria).
 */
export async function resetDadosOperacionaisLocal(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.alocacoes_consumo,
      db.apontamentos_consumo,
      db.transacoes_saida,
      db.eventos_monte,
      db.montes,
      db.lotes,
      db.outbox,
    ],
    async () => {
      await db.alocacoes_consumo.clear()
      await db.apontamentos_consumo.clear()
      await db.transacoes_saida.clear()
      await db.eventos_monte.clear()
      await db.montes.clear()
      await db.lotes.clear()
      await db.outbox.clear()
    }
  )

  console.warn('[resetDadosOperacionaisLocal] Dados operacionais removidos do IndexedDB')
}

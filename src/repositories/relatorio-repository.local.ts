import { db } from '@/lib/offline/db'
import type { RelatorioRepository } from '@/repositories/relatorio-repository'

export const relatorioRepositoryLocal: RelatorioRepository = {
  async listarLotesPorPeriodo(inicio, fim) {
    const registros = await db.lotes
      .where('data_chegada')
      .between(inicio, fim, true, true)
      .toArray()
    return registros.sort((a, b) => b.data_chegada.localeCompare(a.data_chegada))
  },

  async listarTransacoesPorPeriodo(inicio, fim) {
    const registros = await db.transacoes_saida.toArray()
    return registros
      .filter((t) => t.data_transacao >= inicio && t.data_transacao <= fim)
      .sort((a, b) => b.data_transacao.localeCompare(a.data_transacao))
  },

  async listarEventosPorPeriodo(inicio, fim) {
    const registros = await db.eventos_monte.toArray()
    return registros
      .filter((e) => e.data_evento >= inicio && e.data_evento <= fim)
      .sort((a, b) => b.data_evento.localeCompare(a.data_evento))
  },

  async listarApontamentosPorPeriodo(inicio, fim) {
    const registros = await db.apontamentos_consumo
      .where('data_consumo')
      .between(inicio, fim, true, true)
      .toArray()
    return registros.sort((a, b) => b.data_consumo.localeCompare(a.data_consumo))
  },

  async listarAlocacoesPorApontamentos(apontamentoIds) {
    if (apontamentoIds.length === 0) return []
    const conjunto = new Set(apontamentoIds)
    const registros = await db.alocacoes_consumo.toArray()
    return registros.filter((a) => conjunto.has(a.apontamento_id))
  },

  async findApontamentoById(id) {
    return (await db.apontamentos_consumo.get(id)) ?? null
  },

  async contarMontesPorLote(loteId) {
    return db.montes.where('lote_id').equals(loteId).count()
  },
}

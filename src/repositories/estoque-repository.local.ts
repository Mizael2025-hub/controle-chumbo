import { db } from '@/lib/offline/db'
import type { DadosBrutosEstoque, EstoqueRepository } from '@/repositories/estoque-repository'

export const estoqueRepositoryLocal: EstoqueRepository = {
  async fetchDadosBrutos(): Promise<DadosBrutosEstoque> {
    const [ligas, lotes, montes] = await Promise.all([
      db.ligas.orderBy('nome').toArray(),
      db.lotes.orderBy('numero_lote').toArray(),
      db.montes.toArray(),
    ])

    return {
      ligas: ligas.filter((l) => l.is_active),
      lotes,
      montes,
    }
  },
}

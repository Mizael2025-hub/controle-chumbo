import { v4 as uuid } from 'uuid'
import { monteEstaConsumido } from '@/lib/estoque/calcular-saldos'
import { db } from '@/lib/offline/db'
import { AppError } from '@/lib/errors/app-error'
import type {
  ConsumoRepository,
  CriarConsumoExecData,
  LoteConsumoOpcao,
} from '@/repositories/consumo-repository'
import { ordenarMontesPorLiberacao } from '@/lib/consumo/ordenar-montes-liberacao'

export const consumoRepositoryLocal: ConsumoRepository = {
  async listarLotesComSaldoNoSetor(setorId, ligaId) {
    const lotes = await db.lotes.where('liga_id').equals(ligaId).toArray()
    const opcoes: LoteConsumoOpcao[] = []

    for (const lote of lotes) {
      const montes = await db.montes.where('lote_id').equals(lote.id).toArray()
      const temSaldo = montes.some(
        (m) =>
          m.localizacao === 'setor' &&
          m.setor_id === setorId &&
          !monteEstaConsumido(m) &&
          m.barras_atuais > 0
      )
      if (temSaldo) {
        opcoes.push({ id: lote.id, numero_lote: lote.numero_lote, liga_id: lote.liga_id })
      }
    }

    return opcoes.sort((a, b) => a.numero_lote.localeCompare(b.numero_lote))
  },

  async listarMontesElegiveisConsumo(setorId, ligaId, loteId) {
    const lote = await db.lotes.get(loteId)
    if (!lote || lote.liga_id !== ligaId) return []

    const montes = await db.montes.where('lote_id').equals(loteId).toArray()
    return ordenarMontesPorLiberacao(
      montes.filter(
        (m) =>
          m.localizacao === 'setor' &&
          m.setor_id === setorId &&
          !monteEstaConsumido(m) &&
          m.barras_atuais > 0
      )
    )
  },

  async criarApontamento(data: CriarConsumoExecData) {
    if (data.alocacoes.length === 0) {
      throw AppError.validation('Nenhuma alocação de consumo gerada.')
    }

    const agora = new Date().toISOString()
    const apontamentoId = uuid()

    return db.transaction('rw', db.montes, db.apontamentos_consumo, db.alocacoes_consumo, async () => {
      let pesoTotal = 0

      for (const aloc of data.alocacoes) {
        const monte = await db.montes.get(aloc.monte_id)
        if (!monte) throw AppError.notFound('Monte')

        const patch = data.atualizacoes_montes.find((a) => a.monte_id === aloc.monte_id)
        if (!patch) throw AppError.validation('Atualização de monte ausente.')

        if (monte.updated_at !== patch.expected_updated_at) {
          throw AppError.conflict('Monte foi alterado por outro usuário. Recarregue e tente novamente.')
        }

        pesoTotal += aloc.peso_baixado_kg

        await db.montes.put({
          ...monte,
          peso_atual_kg: patch.peso_atual_kg,
          barras_atuais: patch.barras_atuais,
          status: patch.status,
          updated_at: agora,
        })
      }

      const apontamento = {
        id: apontamentoId,
        ...data.apontamento,
        peso_kg: Math.round(pesoTotal * 100) / 100,
        borra_pct: 0,
        created_at: agora,
        updated_at: agora,
      }

      await db.apontamentos_consumo.add(apontamento)

      const alocacoes = data.alocacoes.map((aloc) => {
        const registro = {
          id: uuid(),
          apontamento_id: apontamentoId,
          monte_id: aloc.monte_id,
          barras_baixadas: aloc.barras_baixadas,
          peso_baixado_kg: aloc.peso_baixado_kg,
          kg_por_barra_snapshot: aloc.kg_por_barra_snapshot,
          created_by: data.apontamento.created_by,
          created_at: agora,
          updated_at: agora,
        }
        return registro
      })

      await db.alocacoes_consumo.bulkAdd(alocacoes)

      return { apontamento, alocacoes }
    })
  },
}

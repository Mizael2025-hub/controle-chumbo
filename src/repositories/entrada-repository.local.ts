import { v4 as uuid } from 'uuid'
import { db } from '@/lib/offline/db'
import { filtrarCelulasPreenchidas } from '@/lib/entrada/validar-grade-entrada'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type { EntradaRepository } from '@/repositories/entrada-repository'

export const entradaRepositoryLocal: EntradaRepository = {
  async findLigaById(id) {
    return (await db.ligas.get(id)) ?? null
  },

  async findLoteByNumero(ligaId, numeroLote) {
    const normalizado = numeroLote.trim()
    const lista = await db.lotes.where('liga_id').equals(ligaId).toArray()
    return lista.find((l) => l.numero_lote === normalizado) ?? null
  },

  async createLoteComMontes(loteData, celulas) {
    const now = new Date().toISOString()
    const loteId = uuid()
    const preenchidas = filtrarCelulasPreenchidas(celulas)

    const lote = {
      id: loteId,
      liga_id: loteData.liga_id,
      numero_lote: loteData.numero_lote.trim(),
      data_chegada: loteData.data_chegada,
      peso_inicial_kg: loteData.peso_inicial_kg,
      barras_iniciais: loteData.barras_iniciais,
      colunas_grade: loteData.colunas_grade,
      linhas_grade: loteData.linhas_grade,
      created_by: loteData.created_by,
      created_at: now,
      updated_at: now,
    }

    const montes = preenchidas.map((c) => ({
      id: uuid(),
      lote_id: loteId,
      peso_atual_kg: c.peso_atual_kg,
      barras_atuais: c.barras_atuais,
      posicao_x: c.posicao_x,
      posicao_y: c.posicao_y,
      status: STATUS_MONTE.DISPONIVEL,
      reservado_para: null,
      reservado_em: null,
      setor_reserva_id: null,
      grupo_reserva_id: null,
      localizacao: 'almoxarifado' as const,
      setor_id: null,
      movido_setor_em: null,
      created_by: loteData.created_by,
      created_at: now,
      updated_at: now,
    }))

    await db.transaction('rw', db.lotes, db.montes, async () => {
      await db.lotes.add(lote)
      await db.montes.bulkAdd(montes)
    })

    return { lote, montes }
  },
}

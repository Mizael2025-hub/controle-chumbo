import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/offline/db'
import type {
  ContagemEstoqueLinha,
  ContagemEstoqueRepository,
} from '@/repositories/contagem-estoque-repository'

function agoraIso(): string {
  return new Date().toISOString()
}

export const contagemEstoqueRepositoryLocal: ContagemEstoqueRepository = {
  async listarPorUsuarioData(usuarioId, dataContagem) {
    const rows = await db.contagem_estoque_linha
      .where('[usuario_id+data_contagem]')
      .equals([usuarioId, dataContagem])
      .sortBy('created_at')
    return rows as ContagemEstoqueLinha[]
  },

  async criar(usuarioId, input) {
    const now = agoraIso()
    const row: ContagemEstoqueLinha = {
      id: uuidv4(),
      usuario_id: usuarioId,
      data_contagem: input.data_contagem,
      liga_id: input.liga_id,
      quantidade_barras: input.quantidade_barras,
      numero_lote: input.numero_lote,
      created_at: now,
      updated_at: now,
    }
    await db.contagem_estoque_linha.add(row)
    return row
  },

  async atualizar(id, usuarioId, input) {
    const existente = await db.contagem_estoque_linha.get(id)
    if (!existente || existente.usuario_id !== usuarioId) {
      throw new Error('Apontamento não encontrado.')
    }
    const now = agoraIso()
    const atualizado: ContagemEstoqueLinha = {
      ...existente,
      data_contagem: input.data_contagem,
      liga_id: input.liga_id,
      quantidade_barras: input.quantidade_barras,
      numero_lote: input.numero_lote,
      updated_at: now,
    }
    await db.contagem_estoque_linha.put(atualizado)
    return atualizado
  },

  async excluir(id, usuarioId) {
    const existente = await db.contagem_estoque_linha.get(id)
    if (!existente || existente.usuario_id !== usuarioId) {
      throw new Error('Apontamento não encontrado.')
    }
    await db.contagem_estoque_linha.delete(id)
  },
}

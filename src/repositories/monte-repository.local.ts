import { v4 as uuid } from 'uuid'
import { POSICAO_GRADE_SETOR_X } from '@/lib/estoque/monte-visivel-grade'
import { db } from '@/lib/offline/db'
import { AppError } from '@/lib/errors/app-error'
import type {
  CreateEventoMonteData,
  CreateMonteData,
  CreateTransacaoSaidaData,
  Monte,
  MonteRepository,
} from '@/repositories/monte-repository'

async function getMonteOrThrow(id: string): Promise<Monte> {
  const monte = await db.montes.get(id)
  if (!monte) throw AppError.notFound('Monte')
  return monte
}

function assertUpdatedAt(existente: Monte, expected: string): void {
  if (existente.updated_at !== expected) {
    throw AppError.conflict('Monte foi alterado por outro usuário. Recarregue e tente novamente.')
  }
}

export const monteRepositoryLocal: MonteRepository = {
  async findById(id) {
    return (await db.montes.get(id)) ?? null
  },

  async findLoteLimitesByMonteId(monteId) {
    const monte = await db.montes.get(monteId)
    if (!monte) return null
    const lote = await db.lotes.get(monte.lote_id)
    if (!lote) return null
    return { colunas_grade: lote.colunas_grade, linhas_grade: lote.linhas_grade }
  },

  async findByPosicao(loteId, posicaoX, posicaoY) {
    const lista = await db.montes
      .where('[lote_id+posicao_x+posicao_y]')
      .equals([loteId, posicaoX, posicaoY])
      .toArray()
    return lista[0] ?? null
  },

  async update(id, expectedUpdatedAt, data) {
    const existente = await getMonteOrThrow(id)
    assertUpdatedAt(existente, expectedUpdatedAt)

    const atualizado: Monte = {
      ...existente,
      ...data,
      updated_at: new Date().toISOString(),
    }
    await db.montes.put(atualizado)
    return atualizado
  },

  async countTransacoesNaoEstornadas(monteId) {
    return db.transacoes_saida.where('monte_id').equals(monteId).filter((t) => !t.estornada).count()
  },

  async createEvento(data: CreateEventoMonteData) {
    const now = new Date().toISOString()
    const registro = {
      id: uuid(),
      monte_id: data.monte_id,
      tipo: data.tipo,
      destinatario: data.destinatario,
      data_evento: data.data_evento,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    await db.eventos_monte.add(registro)
    return registro
  },

  async createMonte(data: CreateMonteData) {
    const now = new Date().toISOString()
    const registro: Monte = {
      id: uuid(),
      lote_id: data.lote_id,
      peso_atual_kg: data.peso_atual_kg,
      barras_atuais: data.barras_atuais,
      posicao_x: data.posicao_x,
      posicao_y: data.posicao_y,
      status: data.status,
      localizacao: data.localizacao,
      setor_id: data.setor_id ?? null,
      movido_setor_em: data.movido_setor_em ?? null,
      monte_origem_id: data.monte_origem_id ?? null,
      reservado_para: null,
      reservado_em: null,
      setor_reserva_id: null,
      grupo_reserva_id: null,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    await db.montes.add(registro)
    return registro
  },

  async listEventosByMonteId(monteId) {
    const registros = await db.eventos_monte.where('monte_id').equals(monteId).toArray()
    return registros.sort((a, b) => b.data_evento.localeCompare(a.data_evento))
  },

  async listTransacoesByMonteId(monteId) {
    const registros = await db.transacoes_saida.where('monte_id').equals(monteId).toArray()
    return registros.sort((a, b) => b.data_transacao.localeCompare(a.data_transacao))
  },

  async proximaPosicaoSetorNoLote(loteId) {
    const montesSetor = await db.montes
      .where('lote_id')
      .equals(loteId)
      .filter((m) => m.posicao_x === POSICAO_GRADE_SETOR_X)
      .toArray()
    const maxY = montesSetor.reduce((max, m) => Math.max(max, m.posicao_y), -1)
    return { posicao_x: POSICAO_GRADE_SETOR_X, posicao_y: maxY + 1 }
  },

  async createTransacao(data: CreateTransacaoSaidaData) {
    const now = new Date().toISOString()
    const registro = {
      id: uuid(),
      monte_id: data.monte_id,
      peso_baixado_kg: data.peso_baixado_kg,
      barras_baixadas: data.barras_baixadas,
      destino_saida_id: data.destino_saida_id,
      setor_id: data.setor_id ?? null,
      data_transacao: data.data_transacao,
      grupo_liberacao_id: data.grupo_liberacao_id ?? null,
      estornada: false,
      estornada_em: null,
      estornada_por: null,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    await db.transacoes_saida.add(registro)
    return registro
  },

  async trocarPosicoes(monteOrigemId, origemExpectedUpdatedAt, destinoX, destinoY) {
    return db.transaction('rw', db.montes, async () => {
      const origem = await getMonteOrThrow(monteOrigemId)
      assertUpdatedAt(origem, origemExpectedUpdatedAt)

      const destino = await monteRepositoryLocal.findByPosicao(
        origem.lote_id,
        destinoX,
        destinoY
      )

      const now = new Date().toISOString()

      if (!destino) {
        const movido: Monte = {
          ...origem,
          posicao_x: destinoX,
          posicao_y: destinoY,
          updated_at: now,
        }
        await db.montes.put(movido)
        return movido
      }

      if (destino.id === origem.id) return origem

      const origemAtualizado: Monte = {
        ...origem,
        posicao_x: destino.posicao_x,
        posicao_y: destino.posicao_y,
        updated_at: now,
      }
      const destinoAtualizado: Monte = {
        ...destino,
        posicao_x: origem.posicao_x,
        posicao_y: origem.posicao_y,
        updated_at: now,
      }

      await db.montes.bulkPut([origemAtualizado, destinoAtualizado])
      return origemAtualizado
    })
  },
}

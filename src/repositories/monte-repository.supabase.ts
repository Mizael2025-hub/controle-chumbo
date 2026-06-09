import { v4 as uuid } from 'uuid'
import { POSICAO_GRADE_SETOR_X } from '@/lib/estoque/monte-visivel-grade'
import { AppError } from '@/lib/errors/app-error'
import { createServerSupabase } from '@/lib/supabase/server'
import { assertUpdatedAt, throwIfSupabaseError } from '@/lib/supabase/repository-utils'
import type {
  CreateEventoMonteData,
  CreateMonteData,
  CreateTransacaoSaidaData,
  Monte,
  MonteRepository,
} from '@/repositories/monte-repository'

async function getMonteOrThrow(supabase: Awaited<ReturnType<typeof createServerSupabase>>, id: string) {
  const { data, error } = await supabase.from('montes').select('*').eq('id', id).maybeSingle()
  throwIfSupabaseError(error, 'Monte')
  if (!data) throw AppError.notFound('Monte')
  return data as Monte
}

export const monteRepositorySupabase: MonteRepository = {
  async findById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('montes').select('*').eq('id', id).maybeSingle()
    throwIfSupabaseError(error, 'Monte')
    return data as Monte | null
  },

  async findLoteLimitesByMonteId(monteId) {
    const supabase = await createServerSupabase()
    const monte = await monteRepositorySupabase.findById(monteId)
    if (!monte) return null
    const { data: lote, error } = await supabase
      .from('lotes')
      .select('colunas_grade, linhas_grade')
      .eq('id', monte.lote_id)
      .maybeSingle()
    throwIfSupabaseError(error, 'Lote')
    if (!lote) return null
    return { colunas_grade: lote.colunas_grade, linhas_grade: lote.linhas_grade }
  },

  async findByPosicao(loteId, posicaoX, posicaoY) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('montes')
      .select('*')
      .eq('lote_id', loteId)
      .eq('posicao_x', posicaoX)
      .eq('posicao_y', posicaoY)
      .maybeSingle()
    throwIfSupabaseError(error, 'Monte')
    return data as Monte | null
  },

  async update(id, expectedUpdatedAt, data) {
    const supabase = await createServerSupabase()
    const existente = await getMonteOrThrow(supabase, id)
    assertUpdatedAt(existente, expectedUpdatedAt, 'Monte')

    const { data: atualizado, error } = await supabase
      .from('montes')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    throwIfSupabaseError(error, 'Monte')
    return atualizado as Monte
  },

  async countTransacoesNaoEstornadas(monteId) {
    const supabase = await createServerSupabase()
    const { count, error } = await supabase
      .from('transacoes_saida')
      .select('*', { count: 'exact', head: true })
      .eq('monte_id', monteId)
      .eq('estornada', false)
    throwIfSupabaseError(error, 'Transação de saída')
    return count ?? 0
  },

  async createEvento(data: CreateEventoMonteData) {
    const supabase = await createServerSupabase()
    const registro = {
      id: uuid(),
      monte_id: data.monte_id,
      tipo: data.tipo,
      destinatario: data.destinatario,
      data_evento: data.data_evento,
      created_by: data.created_by ?? null,
    }
    const { data: criado, error } = await supabase
      .from('eventos_monte')
      .insert(registro)
      .select()
      .single()
    throwIfSupabaseError(error, 'Evento de monte')
    return criado
  },

  async createMonte(data: CreateMonteData) {
    const supabase = await createServerSupabase()
    const registro = {
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
      created_by: data.created_by ?? null,
    }
    const { data: criado, error } = await supabase.from('montes').insert(registro).select().single()
    throwIfSupabaseError(error, 'Monte')
    return criado as Monte
  },

  async listEventosByMonteId(monteId) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('eventos_monte')
      .select('*')
      .eq('monte_id', monteId)
      .order('data_evento', { ascending: false })
    throwIfSupabaseError(error, 'Evento de monte')
    return data ?? []
  },

  async listTransacoesByMonteId(monteId) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('transacoes_saida')
      .select('*')
      .eq('monte_id', monteId)
      .order('data_transacao', { ascending: false })
    throwIfSupabaseError(error, 'Transação de saída')
    return data ?? []
  },

  async proximaPosicaoSetorNoLote(loteId) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('montes')
      .select('posicao_y')
      .eq('lote_id', loteId)
      .eq('posicao_x', POSICAO_GRADE_SETOR_X)
    throwIfSupabaseError(error, 'Monte')
    const maxY = (data ?? []).reduce((max, m) => Math.max(max, m.posicao_y), -1)
    return { posicao_x: POSICAO_GRADE_SETOR_X, posicao_y: maxY + 1 }
  },

  async createTransacao(data: CreateTransacaoSaidaData) {
    const supabase = await createServerSupabase()
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
      created_by: data.created_by ?? null,
    }
    const { data: criado, error } = await supabase
      .from('transacoes_saida')
      .insert(registro)
      .select()
      .single()
    throwIfSupabaseError(error, 'Transação de saída')
    return criado
  },

  async trocarPosicoes(monteOrigemId, origemExpectedUpdatedAt, destinoX, destinoY) {
    const supabase = await createServerSupabase()
    const origem = await getMonteOrThrow(supabase, monteOrigemId)
    assertUpdatedAt(origem, origemExpectedUpdatedAt, 'Monte')

    const destino = await monteRepositorySupabase.findByPosicao(
      origem.lote_id,
      destinoX,
      destinoY
    )

    if (!destino) {
      const { data: movido, error } = await supabase
        .from('montes')
        .update({ posicao_x: destinoX, posicao_y: destinoY })
        .eq('id', monteOrigemId)
        .select()
        .single()
      throwIfSupabaseError(error, 'Monte')
      return movido as Monte
    }

    if (destino.id === origem.id) return origem

    const { data: origemAtualizado, error: erroOrigem } = await supabase
      .from('montes')
      .update({ posicao_x: destino.posicao_x, posicao_y: destino.posicao_y })
      .eq('id', origem.id)
      .select()
      .single()
    throwIfSupabaseError(erroOrigem, 'Monte')

    const { error: erroDestino } = await supabase
      .from('montes')
      .update({ posicao_x: origem.posicao_x, posicao_y: origem.posicao_y })
      .eq('id', destino.id)
    throwIfSupabaseError(erroDestino, 'Monte')

    return origemAtualizado as Monte
  },
}

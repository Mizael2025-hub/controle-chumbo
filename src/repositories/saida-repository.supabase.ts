import { v4 as uuid } from 'uuid'
import { monteEstaConsumido, monteTemReservaAtiva } from '@/lib/estoque/calcular-saldos'
import { calcularPesoBaixado } from '@/lib/monte/calcular-baixa'
import { calcularStatusPosEstorno } from '@/lib/monte/calcular-status-pos-estorno'
import { AppError } from '@/lib/errors/app-error'
import { createServerSupabase } from '@/lib/supabase/server'
import { assertUpdatedAt, throwIfSupabaseError } from '@/lib/supabase/repository-utils'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type { MonteLocal } from '@/lib/offline/types'
import type {
  BaixaAgrupadaExecData,
  BaixaAgrupadaResult,
  EstornarTransacoesData,
  SaidaRepository,
} from '@/repositories/saida-repository'

function limparReserva(): Pick<
  MonteLocal,
  'reservado_para' | 'reservado_em' | 'setor_reserva_id' | 'grupo_reserva_id'
> {
  return {
    reservado_para: null,
    reservado_em: null,
    setor_reserva_id: null,
    grupo_reserva_id: null,
  }
}

function assertMonteAtivo(monte: MonteLocal): void {
  if (monteEstaConsumido(monte)) {
    throw AppError.validation('Monte já está consumido.')
  }
  if (monte.barras_atuais <= 0 || monte.peso_atual_kg < 0) {
    throw AppError.validation('Monte sem saldo disponível.')
  }
}

async function countBaixasAtivas(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  monteId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('transacoes_saida')
    .select('*', { count: 'exact', head: true })
    .eq('monte_id', monteId)
    .eq('estornada', false)
  throwIfSupabaseError(error, 'Transação de saída')
  return count ?? 0
}

export const saidaRepositorySupabase: SaidaRepository = {
  async listarTransacoes() {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('transacoes_saida')
      .select('*')
      .order('data_transacao', { ascending: false })
    throwIfSupabaseError(error, 'Transação de saída')
    return data ?? []
  },

  async findTransacaoById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('transacoes_saida')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    throwIfSupabaseError(error, 'Transação de saída')
    return data
  },

  async findTransacoesByGrupo(grupoId) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('transacoes_saida')
      .select('*')
      .eq('grupo_liberacao_id', grupoId)
    throwIfSupabaseError(error, 'Transação de saída')
    return data ?? []
  },

  async executarBaixaAgrupada(data: BaixaAgrupadaExecData): Promise<BaixaAgrupadaResult> {
    if (data.linhas.length === 0) {
      throw AppError.validation('Selecione ao menos um monte para liberar.')
    }

    const supabase = await createServerSupabase()
    const { data: destino, error: erroDestino } = await supabase
      .from('destinos_saida')
      .select('*')
      .eq('id', data.destino_saida_id)
      .maybeSingle()
    throwIfSupabaseError(erroDestino, 'Destino de saída')
    if (!destino || !destino.is_active) {
      throw AppError.validation('Destino de saída inválido.')
    }

    const grupoLiberacaoId = uuid()
    const agora = new Date().toISOString()
    const transacaoIds: string[] = []

    for (const linha of data.linhas) {
      const { data: monte, error: erroMonte } = await supabase
        .from('montes')
        .select('*')
        .eq('id', linha.monte_id)
        .maybeSingle()
      throwIfSupabaseError(erroMonte, 'Monte')
      if (!monte) throw AppError.notFound('Monte')

      assertUpdatedAt(monte, linha.updated_at, 'Monte')
      assertMonteAtivo(monte as MonteLocal)

      if (linha.barras_baixadas > monte.barras_atuais) {
        throw AppError.validation('Barras informadas excedem o saldo do monte.')
      }

      const pesoBaixado = calcularPesoBaixado(
        monte.peso_atual_kg,
        monte.barras_atuais,
        linha.barras_baixadas
      )
      const novasBarras = monte.barras_atuais - linha.barras_baixadas
      const novoPeso = Math.max(0, Math.round((monte.peso_atual_kg - pesoBaixado) * 100) / 100)
      const baixaTotal = novasBarras <= 0

      let novoStatus: string
      const patchReserva = baixaTotal ? limparReserva() : {}

      if (baixaTotal) {
        novoStatus = STATUS_MONTE.CONSUMIDO
      } else if (
        monteTemReservaAtiva(monte as MonteLocal) ||
        monte.status === STATUS_MONTE.RESERVADO
      ) {
        novoStatus = STATUS_MONTE.RESERVADO
      } else {
        novoStatus = STATUS_MONTE.PARCIAL
      }

      const transacaoId = uuid()
      transacaoIds.push(transacaoId)

      const { error: erroTransacao } = await supabase.from('transacoes_saida').insert({
        id: transacaoId,
        monte_id: monte.id,
        peso_baixado_kg: pesoBaixado,
        barras_baixadas: linha.barras_baixadas,
        destino_saida_id: destino.id,
        setor_id: data.setor_id ?? null,
        data_transacao: agora,
        grupo_liberacao_id: grupoLiberacaoId,
        observacao: data.observacao?.trim() || null,
        estornada: false,
        estornada_em: null,
        estornada_por: null,
        created_by: data.created_by,
      })
      throwIfSupabaseError(erroTransacao, 'Transação de saída')

      const { error: erroUpdate } = await supabase
        .from('montes')
        .update({
          peso_atual_kg: baixaTotal ? 0 : novoPeso,
          barras_atuais: baixaTotal ? 0 : novasBarras,
          status: novoStatus,
          ...patchReserva,
        })
        .eq('id', monte.id)
      throwIfSupabaseError(erroUpdate, 'Monte')
    }

    return { grupo_liberacao_id: grupoLiberacaoId, transacao_ids: transacaoIds }
  },

  async estornarTransacoes(data: EstornarTransacoesData): Promise<void> {
    if (data.transacao_ids.length === 0) {
      throw AppError.validation('Nenhuma transação informada para estorno.')
    }

    const supabase = await createServerSupabase()
    const agora = new Date().toISOString()

    for (const transacaoId of data.transacao_ids) {
      const { data: transacao, error: erroTransacao } = await supabase
        .from('transacoes_saida')
        .select('*')
        .eq('id', transacaoId)
        .maybeSingle()
      throwIfSupabaseError(erroTransacao, 'Transação de saída')
      if (!transacao) throw AppError.notFound('Transação de saída')
      if (transacao.estornada) {
        throw AppError.validation('Esta liberação já foi estornada.')
      }

      const { data: monte, error: erroMonte } = await supabase
        .from('montes')
        .select('*')
        .eq('id', transacao.monte_id)
        .maybeSingle()
      throwIfSupabaseError(erroMonte, 'Monte')
      if (!monte) throw AppError.notFound('Monte')

      const { error: erroEstorno } = await supabase
        .from('transacoes_saida')
        .update({
          estornada: true,
          estornada_em: agora,
          estornada_por: data.estornada_por,
        })
        .eq('id', transacaoId)
      throwIfSupabaseError(erroEstorno, 'Transação de saída')

      const novasBarras = monte.barras_atuais + transacao.barras_baixadas
      const novoPeso = Math.round((monte.peso_atual_kg + transacao.peso_baixado_kg) * 100) / 100
      const temOutrasBaixas = (await countBaixasAtivas(supabase, monte.id)) > 0
      const novoStatus = calcularStatusPosEstorno(monte as MonteLocal, temOutrasBaixas)

      const { error: erroUpdateMonte } = await supabase
        .from('montes')
        .update({
          peso_atual_kg: novoPeso,
          barras_atuais: novasBarras,
          status: novoStatus,
        })
        .eq('id', monte.id)
      throwIfSupabaseError(erroUpdateMonte, 'Monte')
    }
  },
}

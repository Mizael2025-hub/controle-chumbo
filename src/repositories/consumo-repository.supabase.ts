import { v4 as uuid } from 'uuid'
import { monteEstaConsumido } from '@/lib/estoque/calcular-saldos'
import { ordenarMontesPorLiberacao } from '@/lib/consumo/ordenar-montes-liberacao'
import { AppError } from '@/lib/errors/app-error'
import { createServerSupabase } from '@/lib/supabase/server'
import { assertUpdatedAt, throwIfSupabaseError } from '@/lib/supabase/repository-utils'
import type {
  ConsumoRepository,
  CriarConsumoExecData,
  LoteConsumoOpcao,
} from '@/repositories/consumo-repository'

export const consumoRepositorySupabase: ConsumoRepository = {
  async listarLotesComSaldoNoSetor(setorId, ligaId) {
    const supabase = await createServerSupabase()
    const { data: lotes, error: erroLotes } = await supabase
      .from('lotes')
      .select('*')
      .eq('liga_id', ligaId)
    throwIfSupabaseError(erroLotes, 'Lote')

    const opcoes: LoteConsumoOpcao[] = []

    for (const lote of lotes ?? []) {
      const { data: montes, error: erroMontes } = await supabase
        .from('montes')
        .select('*')
        .eq('lote_id', lote.id)
      throwIfSupabaseError(erroMontes, 'Monte')

      const temSaldo = (montes ?? []).some(
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
    const supabase = await createServerSupabase()
    const { data: lote, error: erroLote } = await supabase
      .from('lotes')
      .select('*')
      .eq('id', loteId)
      .maybeSingle()
    throwIfSupabaseError(erroLote, 'Lote')
    if (!lote || lote.liga_id !== ligaId) return []

    const { data: montes, error: erroMontes } = await supabase
      .from('montes')
      .select('*')
      .eq('lote_id', loteId)
    throwIfSupabaseError(erroMontes, 'Monte')

    return ordenarMontesPorLiberacao(
      (montes ?? []).filter(
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

    const supabase = await createServerSupabase()
    const apontamentoId = uuid()
    let pesoTotal = 0

    for (const aloc of data.alocacoes) {
      const { data: monte, error: erroMonte } = await supabase
        .from('montes')
        .select('*')
        .eq('id', aloc.monte_id)
        .maybeSingle()
      throwIfSupabaseError(erroMonte, 'Monte')
      if (!monte) throw AppError.notFound('Monte')

      const patch = data.atualizacoes_montes.find((a) => a.monte_id === aloc.monte_id)
      if (!patch) throw AppError.validation('Atualização de monte ausente.')
      assertUpdatedAt(monte, patch.expected_updated_at, 'Monte')

      pesoTotal += aloc.peso_baixado_kg

      const { error: erroUpdate } = await supabase
        .from('montes')
        .update({
          peso_atual_kg: patch.peso_atual_kg,
          barras_atuais: patch.barras_atuais,
          status: patch.status,
        })
        .eq('id', monte.id)
      throwIfSupabaseError(erroUpdate, 'Monte')
    }

    const apontamento = {
      id: apontamentoId,
      ...data.apontamento,
      peso_kg: Math.round(pesoTotal * 100) / 100,
      borra_pct: 0,
    }

    const { data: apontamentoCriado, error: erroApontamento } = await supabase
      .from('apontamentos_consumo')
      .insert(apontamento)
      .select()
      .single()
    throwIfSupabaseError(erroApontamento, 'Apontamento de consumo')

    const alocacoes = data.alocacoes.map((aloc) => ({
      id: uuid(),
      apontamento_id: apontamentoId,
      monte_id: aloc.monte_id,
      barras_baixadas: aloc.barras_baixadas,
      peso_baixado_kg: aloc.peso_baixado_kg,
      kg_por_barra_snapshot: aloc.kg_por_barra_snapshot,
      created_by: data.apontamento.created_by ?? null,
    }))

    const { data: alocacoesCriadas, error: erroAlocacoes } = await supabase
      .from('alocacoes_consumo')
      .insert(alocacoes)
      .select()
    throwIfSupabaseError(erroAlocacoes, 'Alocação de consumo')

    return {
      apontamento: apontamentoCriado,
      alocacoes: alocacoesCriadas ?? [],
    }
  },
}

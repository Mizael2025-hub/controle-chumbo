import { createServerSupabase } from '@/lib/supabase/server'
import { throwIfSupabaseError } from '@/lib/supabase/repository-utils'
import type { RelatorioRepository } from '@/repositories/relatorio-repository'

export const relatorioRepositorySupabase: RelatorioRepository = {
  async listarLotesPorPeriodo(inicio, fim) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .gte('data_chegada', inicio)
      .lte('data_chegada', fim)
      .order('data_chegada', { ascending: false })
    throwIfSupabaseError(error, 'Lote')
    return data ?? []
  },

  async listarTransacoesPorPeriodo(inicio, fim) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('transacoes_saida')
      .select('*')
      .gte('data_transacao', inicio)
      .lte('data_transacao', fim)
      .order('data_transacao', { ascending: false })
    throwIfSupabaseError(error, 'Transação de saída')
    return data ?? []
  },

  async listarEventosPorPeriodo(inicio, fim) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('eventos_monte')
      .select('*')
      .gte('data_evento', inicio)
      .lte('data_evento', fim)
      .order('data_evento', { ascending: false })
    throwIfSupabaseError(error, 'Evento de monte')
    return data ?? []
  },

  async listarApontamentosPorPeriodo(inicio, fim) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('apontamentos_consumo')
      .select('*')
      .gte('data_consumo', inicio)
      .lte('data_consumo', fim)
      .order('data_consumo', { ascending: false })
    throwIfSupabaseError(error, 'Apontamento de consumo')
    return data ?? []
  },

  async listarAlocacoesPorApontamentos(apontamentoIds) {
    if (apontamentoIds.length === 0) return []
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('alocacoes_consumo')
      .select('*')
      .in('apontamento_id', apontamentoIds)
    throwIfSupabaseError(error, 'Alocação de consumo')
    return data ?? []
  },

  async findApontamentoById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('apontamentos_consumo')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    throwIfSupabaseError(error, 'Apontamento de consumo')
    return data
  },

  async contarMontesPorLote(loteId) {
    const supabase = await createServerSupabase()
    const { count, error } = await supabase
      .from('montes')
      .select('*', { count: 'exact', head: true })
      .eq('lote_id', loteId)
    throwIfSupabaseError(error, 'Monte')
    return count ?? 0
  },
}

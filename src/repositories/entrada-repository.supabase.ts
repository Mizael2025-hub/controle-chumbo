import { v4 as uuid } from 'uuid'
import { filtrarCelulasPreenchidas } from '@/lib/entrada/validar-grade-entrada'
import { createServerSupabase } from '@/lib/supabase/server'
import { throwIfSupabaseError } from '@/lib/supabase/repository-utils'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type { EntradaRepository } from '@/repositories/entrada-repository'

export const entradaRepositorySupabase: EntradaRepository = {
  async findLigaById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('ligas').select('*').eq('id', id).maybeSingle()
    throwIfSupabaseError(error, 'Liga')
    return data
  },

  async findLoteByNumero(ligaId, numeroLote) {
    const supabase = await createServerSupabase()
    const normalizado = numeroLote.trim()
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .eq('liga_id', ligaId)
      .eq('numero_lote', normalizado)
      .maybeSingle()
    throwIfSupabaseError(error, 'Lote')
    return data
  },

  async createLoteComMontes(loteData, celulas) {
    const supabase = await createServerSupabase()
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
      monte_origem_id: null,
      created_by: loteData.created_by,
    }))

    const { data: loteCriado, error: erroLote } = await supabase
      .from('lotes')
      .insert(lote)
      .select()
      .single()
    throwIfSupabaseError(erroLote, 'Lote')

    if (montes.length > 0) {
      const { data: montesCriados, error: erroMontes } = await supabase
        .from('montes')
        .insert(montes)
        .select()
      throwIfSupabaseError(erroMontes, 'Monte')
      return { lote: loteCriado, montes: montesCriados ?? [] }
    }

    return { lote: loteCriado, montes: [] }
  },
}

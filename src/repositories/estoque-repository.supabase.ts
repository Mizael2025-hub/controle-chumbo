import { createServerSupabase } from '@/lib/supabase/server'
import { throwIfSupabaseError } from '@/lib/supabase/repository-utils'
import type { EstoqueRepository } from '@/repositories/estoque-repository'

export const estoqueRepositorySupabase: EstoqueRepository = {
  async fetchDadosBrutos() {
    const supabase = await createServerSupabase()

    const [ligasRes, lotesRes, montesRes] = await Promise.all([
      supabase.from('ligas').select('*').eq('is_active', true).order('nome'),
      supabase.from('lotes').select('*').order('numero_lote'),
      supabase.from('montes').select('*'),
    ])

    throwIfSupabaseError(ligasRes.error, 'Ligas')
    throwIfSupabaseError(lotesRes.error, 'Lotes')
    throwIfSupabaseError(montesRes.error, 'Montes')

    return {
      ligas: ligasRes.data ?? [],
      lotes: lotesRes.data ?? [],
      montes: montesRes.data ?? [],
    }
  },
}

import { AppError } from '@/lib/errors/app-error'
import { normalizeSortOrderInput } from '@/lib/utils/format-number'
import type { PostgrestError } from '@supabase/supabase-js'

export function assertUpdatedAt(
  existente: { updated_at: string },
  expected: string,
  entidade: string
): void {
  if (existente.updated_at !== expected) {
    throw AppError.conflict(
      `${entidade} foi alterado por outro usuário. Recarregue e tente novamente.`
    )
  }
}

export function throwIfSupabaseError(
  error: PostgrestError | null,
  entidade: string
): void {
  if (error) {
    console.error(`[supabase:${entidade}]`, error)
    throw AppError.validation(`${entidade}: ${error.message}`)
  }
}

export async function resolveSortOrderForInsert(
  value: number | undefined,
  proximo: () => Promise<number>
): Promise<number> {
  const normalizado = normalizeSortOrderInput(value)
  if (normalizado !== undefined) return normalizado
  return proximo()
}

export async function proximoSortOrder(
  tabela: string,
  filtro?: { coluna: string; valor: string }
): Promise<number> {
  const { createServerSupabase } = await import('@/lib/supabase/server')
  const supabase = await createServerSupabase()

  let query = supabase.from(tabela).select('sort_order').order('sort_order', {
    ascending: false,
  }).limit(1)

  if (filtro) {
    query = query.eq(filtro.coluna, filtro.valor)
  }

  const { data, error } = await query
  throwIfSupabaseError(error, tabela)

  const ultimo = data?.[0] as { sort_order: number } | undefined
  return ultimo ? ultimo.sort_order + 1 : 0
}

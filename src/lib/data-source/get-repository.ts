import { getDataSource } from './index'

/**
 * Factory genérica para repositories — usar ao criar cada entidade.
 * @example export const getLigaRepository = createRepositoryFactory(local, supabase)
 */
export function createRepositoryFactory<T>(
  localImpl: T,
  supabaseImpl: T
): () => T {
  return () => (getDataSource() === 'supabase' ? supabaseImpl : localImpl)
}

export { getDataSource, isLocalDataSource, isSupabaseDataSource } from './index'

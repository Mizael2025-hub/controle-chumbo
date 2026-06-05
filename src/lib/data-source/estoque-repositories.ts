import { createRepositoryFactory } from '@/lib/data-source/get-repository'
import { estoqueRepositoryLocal } from '@/repositories/estoque-repository.local'
import { estoqueRepositorySupabase } from '@/repositories/estoque-repository.supabase'

export const getEstoqueRepository = createRepositoryFactory(
  estoqueRepositoryLocal,
  estoqueRepositorySupabase
)

/** Repositório local para uso no client (DATA_SOURCE=local). */
export const estoqueRepositoryLocalClient = estoqueRepositoryLocal

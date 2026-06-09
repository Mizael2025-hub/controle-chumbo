import 'server-only'

import { createRepositoryFactory } from '@/lib/data-source/get-repository'
import { estoqueRepositoryLocal } from '@/repositories/estoque-repository.local'
import { estoqueRepositorySupabase } from '@/repositories/estoque-repository.supabase'

export const getEstoqueRepository = createRepositoryFactory(
  estoqueRepositoryLocal,
  estoqueRepositorySupabase
)

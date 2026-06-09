import 'server-only'

import { createRepositoryFactory } from '@/lib/data-source/get-repository'
import { relatorioRepositoryLocal } from '@/repositories/relatorio-repository.local'
import { relatorioRepositorySupabase } from '@/repositories/relatorio-repository.supabase'

export const getRelatorioRepository = createRepositoryFactory(
  relatorioRepositoryLocal,
  relatorioRepositorySupabase
)

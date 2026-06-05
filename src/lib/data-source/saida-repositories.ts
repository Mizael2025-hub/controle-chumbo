import { createRepositoryFactory } from '@/lib/data-source/get-repository'
import { saidaRepositoryLocal } from '@/repositories/saida-repository.local'
import { saidaRepositorySupabase } from '@/repositories/saida-repository.supabase'

export const getSaidaRepository = createRepositoryFactory(
  saidaRepositoryLocal,
  saidaRepositorySupabase
)

export const saidaRepositoryLocalClient = saidaRepositoryLocal

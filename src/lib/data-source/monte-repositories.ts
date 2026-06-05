import { createRepositoryFactory } from '@/lib/data-source/get-repository'
import { monteRepositoryLocal } from '@/repositories/monte-repository.local'
import { monteRepositorySupabase } from '@/repositories/monte-repository.supabase'

export const getMonteRepository = createRepositoryFactory(
  monteRepositoryLocal,
  monteRepositorySupabase
)

export const monteRepositoryLocalClient = monteRepositoryLocal

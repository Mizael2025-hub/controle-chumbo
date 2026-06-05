import { createRepositoryFactory } from '@/lib/data-source/get-repository'
import { consumoRepositoryLocal } from '@/repositories/consumo-repository.local'
import { consumoRepositorySupabase } from '@/repositories/consumo-repository.supabase'

export const getConsumoRepository = createRepositoryFactory(
  consumoRepositoryLocal,
  consumoRepositorySupabase
)

export const consumoRepositoryLocalClient = consumoRepositoryLocal

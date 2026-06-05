import { createRepositoryFactory } from '@/lib/data-source/get-repository'
import { entradaRepositoryLocal } from '@/repositories/entrada-repository.local'
import { entradaRepositorySupabase } from '@/repositories/entrada-repository.supabase'

export const getEntradaRepository = createRepositoryFactory(
  entradaRepositoryLocal,
  entradaRepositorySupabase
)

export const entradaRepositoryLocalClient = entradaRepositoryLocal

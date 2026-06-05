import { createRepositoryFactory } from '@/lib/data-source/get-repository'
import {
  destinoSaidaRepositoryLocal,
  ligaRepositoryLocal,
  maquinaRepositoryLocal,
  modeloProdutoRepositoryLocal,
  operadorRepositoryLocal,
  setorRepositoryLocal,
  turnoRepositoryLocal,
} from '@/repositories/cadastro-repository.local'
import {
  destinoSaidaRepositorySupabase,
  ligaRepositorySupabase,
  maquinaRepositorySupabase,
  modeloProdutoRepositorySupabase,
  operadorRepositorySupabase,
  setorRepositorySupabase,
  turnoRepositorySupabase,
} from '@/repositories/cadastro-repository.supabase'

export const getLigaRepository = createRepositoryFactory(
  ligaRepositoryLocal,
  ligaRepositorySupabase
)

export const getSetorRepository = createRepositoryFactory(
  setorRepositoryLocal,
  setorRepositorySupabase
)

export const getDestinoSaidaRepository = createRepositoryFactory(
  destinoSaidaRepositoryLocal,
  destinoSaidaRepositorySupabase
)

export const getOperadorRepository = createRepositoryFactory(
  operadorRepositoryLocal,
  operadorRepositorySupabase
)

export const getTurnoRepository = createRepositoryFactory(
  turnoRepositoryLocal,
  turnoRepositorySupabase
)

export const getModeloProdutoRepository = createRepositoryFactory(
  modeloProdutoRepositoryLocal,
  modeloProdutoRepositorySupabase
)

export const getMaquinaRepository = createRepositoryFactory(
  maquinaRepositoryLocal,
  maquinaRepositorySupabase
)

/** Repositórios locais para uso no client (DATA_SOURCE=local). */
export const cadastroRepositoriesLocal = {
  ligas: ligaRepositoryLocal,
  setores: setorRepositoryLocal,
  destinos_saida: destinoSaidaRepositoryLocal,
  operadores: operadorRepositoryLocal,
  turnos: turnoRepositoryLocal,
  modelos_produto: modeloProdutoRepositoryLocal,
  maquinas: maquinaRepositoryLocal,
} as const

import {
  destinoSaidaRepositoryLocal,
  ligaRepositoryLocal,
  maquinaRepositoryLocal,
  modeloProdutoRepositoryLocal,
  operadorRepositoryLocal,
  setorRepositoryLocal,
  turnoRepositoryLocal,
} from '@/repositories/cadastro-repository.local'

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

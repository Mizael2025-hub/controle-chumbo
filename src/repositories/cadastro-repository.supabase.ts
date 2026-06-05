import { AppError } from '@/lib/errors/app-error'
import type {
  DestinoSaidaRepository,
  LigaRepository,
  MaquinaRepository,
  ModeloProdutoRepository,
  OperadorRepository,
  SetorRepository,
  TurnoRepository,
} from '@/repositories/cadastro-repository'

function naoImplementado(entidade: string): never {
  throw AppError.validation(`${entidade}: implementação Supabase pendente (Fase D).`)
}

function criarStub<T extends object>(entidade: string): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      if (typeof prop === 'string') {
        return async () => naoImplementado(entidade)
      }
      return undefined
    },
  })
}

export const ligaRepositorySupabase = criarStub<LigaRepository>('Liga')
export const setorRepositorySupabase = criarStub<SetorRepository>('Setor')
export const destinoSaidaRepositorySupabase = criarStub<DestinoSaidaRepository>('Destino de saída')
export const operadorRepositorySupabase = criarStub<OperadorRepository>('Operador')
export const turnoRepositorySupabase = criarStub<TurnoRepository>('Turno')
export const modeloProdutoRepositorySupabase = criarStub<ModeloProdutoRepository>(
  'Modelo de produto'
)
export const maquinaRepositorySupabase = criarStub<MaquinaRepository>('Máquina')

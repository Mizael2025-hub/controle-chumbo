import { AppError } from '@/lib/errors/app-error'
import type { MonteRepository } from '@/repositories/monte-repository'

function naoImplementado(): never {
  throw AppError.validation('Monte: implementação Supabase pendente (Fase D).')
}

export const monteRepositorySupabase: MonteRepository = {
  findById: async () => naoImplementado(),
  findLoteLimitesByMonteId: async () => naoImplementado(),
  findByPosicao: async () => naoImplementado(),
  update: async () => naoImplementado(),
  countTransacoesNaoEstornadas: async () => naoImplementado(),
  createEvento: async () => naoImplementado(),
  createTransacao: async () => naoImplementado(),
  createMonte: async () => naoImplementado(),
  listEventosByMonteId: async () => naoImplementado(),
  listTransacoesByMonteId: async () => naoImplementado(),
  proximaPosicaoSetorNoLote: async () => naoImplementado(),
  trocarPosicoes: async () => naoImplementado(),
}

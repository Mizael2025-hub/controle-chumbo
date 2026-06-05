import { AppError } from '@/lib/errors/app-error'
import type { EntradaRepository } from '@/repositories/entrada-repository'

function naoImplementado(): never {
  throw AppError.validation('Entrada: implementação Supabase pendente (Fase D).')
}

export const entradaRepositorySupabase: EntradaRepository = {
  findLigaById: async () => naoImplementado(),
  findLoteByNumero: async () => naoImplementado(),
  createLoteComMontes: async () => naoImplementado(),
}

import { AppError } from '@/lib/errors/app-error'
import type { EstoqueRepository } from '@/repositories/estoque-repository'

function naoImplementado(): never {
  throw AppError.validation('Estoque: implementação Supabase pendente (Fase D).')
}

export const estoqueRepositorySupabase: EstoqueRepository = {
  async fetchDadosBrutos() {
    return naoImplementado()
  },
}

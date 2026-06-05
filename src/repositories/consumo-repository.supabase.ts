import { AppError } from '@/lib/errors/app-error'
import type { ConsumoRepository } from '@/repositories/consumo-repository'

function naoImplementado(): never {
  throw AppError.validation('Consumo: implementação Supabase pendente (Fase D).')
}

export const consumoRepositorySupabase: ConsumoRepository = {
  listarLotesComSaldoNoSetor: async () => naoImplementado(),
  listarMontesElegiveisConsumo: async () => naoImplementado(),
  criarApontamento: async () => naoImplementado(),
}

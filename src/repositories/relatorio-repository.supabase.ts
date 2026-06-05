import { AppError } from '@/lib/errors/app-error'
import type { RelatorioRepository } from '@/repositories/relatorio-repository'

function naoImplementado(): never {
  throw AppError.validation('Relatórios: implementação Supabase pendente (Fase D).')
}

export const relatorioRepositorySupabase: RelatorioRepository = {
  listarLotesPorPeriodo: async () => naoImplementado(),
  listarTransacoesPorPeriodo: async () => naoImplementado(),
  listarEventosPorPeriodo: async () => naoImplementado(),
  listarApontamentosPorPeriodo: async () => naoImplementado(),
  listarAlocacoesPorApontamentos: async () => naoImplementado(),
  findApontamentoById: async () => naoImplementado(),
  contarMontesPorLote: async () => naoImplementado(),
}

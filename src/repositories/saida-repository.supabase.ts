import { AppError } from '@/lib/errors/app-error'
import type { SaidaRepository } from '@/repositories/saida-repository'

function naoImplementado(): never {
  throw AppError.validation('Saída: implementação Supabase pendente (Fase D).')
}

export const saidaRepositorySupabase: SaidaRepository = {
  listarTransacoes: async () => naoImplementado(),
  findTransacaoById: async () => naoImplementado(),
  findTransacoesByGrupo: async () => naoImplementado(),
  executarBaixaAgrupada: async () => naoImplementado(),
  estornarTransacoes: async () => naoImplementado(),
}

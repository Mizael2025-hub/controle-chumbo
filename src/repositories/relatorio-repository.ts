import type {
  AlocacaoConsumoLocal,
  ApontamentoConsumoLocal,
  EventoMonteLocal,
  LoteLocal,
} from '@/lib/offline/types'
import type { TransacaoSaida } from '@/repositories/saida-repository'

export interface RelatorioRepository {
  listarLotesPorPeriodo(inicio: string, fim: string): Promise<LoteLocal[]>
  listarTransacoesPorPeriodo(inicio: string, fim: string): Promise<TransacaoSaida[]>
  listarEventosPorPeriodo(inicio: string, fim: string): Promise<EventoMonteLocal[]>
  listarApontamentosPorPeriodo(inicio: string, fim: string): Promise<ApontamentoConsumoLocal[]>
  listarAlocacoesPorApontamentos(apontamentoIds: string[]): Promise<AlocacaoConsumoLocal[]>
  findApontamentoById(id: string): Promise<ApontamentoConsumoLocal | null>
  contarMontesPorLote(loteId: string): Promise<number>
}

import type { AlocacaoConsumoLocal, ApontamentoConsumoLocal } from '@/lib/offline/types'
import type { Monte } from '@/repositories/monte-repository'

export type ApontamentoConsumo = ApontamentoConsumoLocal
export type AlocacaoConsumo = AlocacaoConsumoLocal

export type LoteConsumoOpcao = {
  id: string
  numero_lote: string
  liga_id: string
}

export type CriarConsumoExecData = {
  apontamento: Omit<
    ApontamentoConsumoLocal,
    'id' | 'created_at' | 'updated_at' | 'peso_kg' | 'borra_pct'
  >
  alocacoes: {
    monte_id: string
    barras_baixadas: number
    peso_baixado_kg: number
    kg_por_barra_snapshot: number
  }[]
  atualizacoes_montes: {
    monte_id: string
    expected_updated_at: string
    peso_atual_kg: number
    barras_atuais: number
    status: string
  }[]
}

export type CriarConsumoResult = {
  apontamento: ApontamentoConsumo
  alocacoes: AlocacaoConsumo[]
}

export interface ConsumoRepository {
  listarLotesComSaldoNoSetor(setorId: string, ligaId: string): Promise<LoteConsumoOpcao[]>
  listarMontesElegiveisConsumo(
    setorId: string,
    ligaId: string,
    loteId: string
  ): Promise<Monte[]>
  criarApontamento(data: CriarConsumoExecData): Promise<CriarConsumoResult>
}

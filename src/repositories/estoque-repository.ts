import type { LigaLocal, LoteLocal, MonteLocal } from '@/lib/offline/types'

export type Liga = LigaLocal
export type Lote = LoteLocal
export type Monte = MonteLocal

export type DadosBrutosEstoque = {
  ligas: Liga[]
  lotes: Lote[]
  montes: Monte[]
}

export interface EstoqueRepository {
  fetchDadosBrutos(): Promise<DadosBrutosEstoque>
}

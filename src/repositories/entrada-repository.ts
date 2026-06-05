import type { LigaLocal, LoteLocal, MonteLocal } from '@/lib/offline/types'
import type { CelulaEntradaInput } from '@/validations/entrada/entrada-schema'

export type Liga = LigaLocal
export type Lote = LoteLocal
export type Monte = MonteLocal

export type CreateLoteData = {
  liga_id: string
  numero_lote: string
  data_chegada: string
  peso_inicial_kg: number
  barras_iniciais: number
  colunas_grade: number
  linhas_grade: number
  created_by: string
}

export type CriarEntradaResult = {
  lote: Lote
  montes: Monte[]
}

export interface EntradaRepository {
  findLigaById(id: string): Promise<Liga | null>
  findLoteByNumero(ligaId: string, numeroLote: string): Promise<Lote | null>
  createLoteComMontes(
    lote: CreateLoteData,
    celulas: CelulaEntradaInput[]
  ): Promise<CriarEntradaResult>
}

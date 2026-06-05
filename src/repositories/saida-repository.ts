import type { TransacaoSaidaLocal } from '@/lib/offline/types'

export type TransacaoSaida = TransacaoSaidaLocal

export type LinhaBaixaAgrupadaExec = {
  monte_id: string
  barras_baixadas: number
  updated_at: string
}

export type BaixaAgrupadaExecData = {
  destino_saida_id: string
  setor_id?: string | null
  observacao?: string
  linhas: LinhaBaixaAgrupadaExec[]
  created_by: string
}

export type BaixaAgrupadaResult = {
  grupo_liberacao_id: string
  transacao_ids: string[]
}

export type EstornarTransacoesData = {
  transacao_ids: string[]
  estornada_por: string
}

export interface SaidaRepository {
  listarTransacoes(): Promise<TransacaoSaida[]>
  findTransacaoById(id: string): Promise<TransacaoSaida | null>
  findTransacoesByGrupo(grupoId: string): Promise<TransacaoSaida[]>
  executarBaixaAgrupada(data: BaixaAgrupadaExecData): Promise<BaixaAgrupadaResult>
  estornarTransacoes(data: EstornarTransacoesData): Promise<void>
}

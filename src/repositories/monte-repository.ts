import type { EventoMonteLocal, MonteLocal, TransacaoSaidaLocal } from '@/lib/offline/types'

export type Monte = MonteLocal
export type EventoMonte = EventoMonteLocal
export type TransacaoSaida = TransacaoSaidaLocal

export type UpdateMonteData = {
  peso_atual_kg?: number
  barras_atuais?: number
  posicao_x?: number
  posicao_y?: number
  status?: string
  reservado_para?: string | null
  reservado_em?: string | null
  setor_reserva_id?: string | null
  grupo_reserva_id?: string | null
  localizacao?: string
  setor_id?: string | null
  movido_setor_em?: string | null
  monte_origem_id?: string | null
  updated_at: string
}

export type CreateMonteData = {
  lote_id: string
  peso_atual_kg: number
  barras_atuais: number
  posicao_x: number
  posicao_y: number
  status: string
  localizacao: string
  setor_id?: string | null
  movido_setor_em?: string | null
  monte_origem_id?: string | null
  created_by?: string
}

export type CreateEventoMonteData = {
  monte_id: string
  tipo: string
  destinatario: string
  data_evento: string
  created_by?: string
}

export type CreateTransacaoSaidaData = {
  monte_id: string
  peso_baixado_kg: number
  barras_baixadas: number
  destino_saida_id: string
  setor_id?: string | null
  data_transacao: string
  grupo_liberacao_id?: string | null
  created_by?: string
}

export type LoteGradeLimites = {
  colunas_grade: number
  linhas_grade: number
}

export interface MonteRepository {
  findById(id: string): Promise<Monte | null>
  findLoteLimitesByMonteId(monteId: string): Promise<LoteGradeLimites | null>
  findByPosicao(loteId: string, posicaoX: number, posicaoY: number): Promise<Monte | null>
  update(id: string, expectedUpdatedAt: string, data: Omit<UpdateMonteData, 'updated_at'>): Promise<Monte>
  countTransacoesNaoEstornadas(monteId: string): Promise<number>
  createEvento(data: CreateEventoMonteData): Promise<EventoMonte>
  createTransacao(data: CreateTransacaoSaidaData): Promise<TransacaoSaida>
  createMonte(data: CreateMonteData): Promise<Monte>
  listEventosByMonteId(monteId: string): Promise<EventoMonte[]>
  listTransacoesByMonteId(monteId: string): Promise<TransacaoSaida[]>
  proximaPosicaoSetorNoLote(loteId: string): Promise<{ posicao_x: number; posicao_y: number }>
  trocarPosicoes(
    monteOrigemId: string,
    origemExpectedUpdatedAt: string,
    destinoX: number,
    destinoY: number
  ): Promise<Monte>
}

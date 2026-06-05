/** Tipos espelhando docs/DATABASE.md — campos snake_case PT-BR */

export type OutboxStatus = 'pendente' | 'enviando' | 'erro'

export type OutboxItem = {
  id: string
  action: string
  payload: Record<string, unknown>
  created_at: string
  tentativas: number
  status: OutboxStatus
  erro_mensagem?: string
}

export type UsuarioLocal = {
  id: string
  user_id: string
  nome: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type LigaLocal = {
  id: string
  nome: string
  chave_cor: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type LoteLocal = {
  id: string
  liga_id: string
  numero_lote: string
  data_chegada: string
  peso_inicial_kg: number
  barras_iniciais: number
  colunas_grade: number
  linhas_grade: number
  created_by?: string
  created_at: string
  updated_at: string
}

export type SetorLocal = {
  id: string
  nome: string
  slug: string
  tipo: string
  sort_order: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type MaquinaLocal = {
  id: string
  setor_id: string
  nome: string
  sort_order: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type MonteLocal = {
  id: string
  lote_id: string
  peso_atual_kg: number
  barras_atuais: number
  posicao_x: number
  posicao_y: number
  status: string
  reservado_para?: string | null
  reservado_em?: string | null
  setor_reserva_id?: string | null
  grupo_reserva_id?: string | null
  localizacao: string
  setor_id?: string | null
  movido_setor_em?: string | null
  monte_origem_id?: string | null
  created_by?: string
  created_at: string
  updated_at: string
}

export type DestinoSaidaLocal = {
  id: string
  nome: string
  slug: string
  sort_order: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type TransacaoSaidaLocal = {
  id: string
  monte_id: string
  peso_baixado_kg: number
  barras_baixadas: number
  destino_saida_id: string
  setor_id?: string | null
  data_transacao: string
  grupo_liberacao_id?: string | null
  observacao?: string | null
  estornada: boolean
  estornada_em?: string | null
  estornada_por?: string | null
  created_by?: string
  created_at: string
  updated_at: string
}

export type EventoMonteLocal = {
  id: string
  monte_id: string
  tipo: string
  destinatario: string
  data_evento: string
  created_by?: string
  created_at: string
  updated_at: string
}

export type OperadorLocal = {
  id: string
  nome: string
  sort_order: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type TurnoLocal = {
  id: string
  nome: string
  sort_order: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type ModeloProdutoLocal = {
  id: string
  nome: string
  tipo_produto: string
  polaridade: string
  placas_por_grade: number
  sort_order: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type ApontamentoConsumoLocal = {
  id: string
  data_consumo: string
  liga_id: string
  lote_id?: string | null
  setor_id: string
  maquina_id?: string | null
  operador_id?: string | null
  turno_id?: string | null
  modelo_produto_id?: string | null
  barras: number
  peso_kg: number
  borra_kg: number
  borra_pct: number
  modo_selecao_montes: string
  lote_produto?: string | null
  observacoes?: string | null
  nome_operador: string
  nome_turno: string
  nome_maquina: string
  nome_setor: string
  nome_modelo_produto: string
  numero_lote_snapshot: string
  created_by?: string
  created_at: string
  updated_at: string
}

export type AlocacaoConsumoLocal = {
  id: string
  apontamento_id: string
  monte_id: string
  barras_baixadas: number
  peso_baixado_kg: number
  kg_por_barra_snapshot: number
  created_by?: string
  created_at: string
  updated_at: string
}

/** Linha de rascunho — contagem física diária (auditoria). */
export type ContagemEstoqueLinhaLocal = {
  id: string
  usuario_id: string
  data_contagem: string
  liga_id: string
  quantidade_barras: number
  numero_lote: string | null
  created_at: string
  updated_at: string
}

export type RegistroComUpdatedAt = {
  updated_at: string
}

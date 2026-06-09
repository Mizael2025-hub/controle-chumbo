import Dexie, { type EntityTable } from 'dexie'
import type {
  AlocacaoConsumoLocal,
  ApontamentoConsumoLocal,
  ContagemEstoqueLinhaLocal,
  DestinoSaidaLocal,
  EventoMonteLocal,
  LigaLocal,
  LoteLocal,
  MaquinaLocal,
  ModeloProdutoLocal,
  MonteLocal,
  OperadorLocal,
  OutboxItem,
  SetorLocal,
  TransacaoSaidaLocal,
  TurnoLocal,
  UsuarioLocal,
} from './types'

export const DB_NAME = 'controle-chumbo-offline'
export const DB_VERSION = 4

class ControleChumboDB extends Dexie {
  usuarios!: EntityTable<UsuarioLocal, 'id'>
  ligas!: EntityTable<LigaLocal, 'id'>
  lotes!: EntityTable<LoteLocal, 'id'>
  setores!: EntityTable<SetorLocal, 'id'>
  maquinas!: EntityTable<MaquinaLocal, 'id'>
  montes!: EntityTable<MonteLocal, 'id'>
  destinos_saida!: EntityTable<DestinoSaidaLocal, 'id'>
  transacoes_saida!: EntityTable<TransacaoSaidaLocal, 'id'>
  eventos_monte!: EntityTable<EventoMonteLocal, 'id'>
  operadores!: EntityTable<OperadorLocal, 'id'>
  turnos!: EntityTable<TurnoLocal, 'id'>
  modelos_produto!: EntityTable<ModeloProdutoLocal, 'id'>
  apontamentos_consumo!: EntityTable<ApontamentoConsumoLocal, 'id'>
  alocacoes_consumo!: EntityTable<AlocacaoConsumoLocal, 'id'>
  outbox!: EntityTable<OutboxItem, 'id'>
  contagem_estoque_linha!: EntityTable<ContagemEstoqueLinhaLocal, 'id'>

  constructor() {
    super(DB_NAME)

    this.version(1).stores({
      usuarios: 'id, user_id, email, role, updated_at',
      ligas: 'id, nome, chave_cor, is_active, updated_at',
      lotes: 'id, liga_id, numero_lote, data_chegada, updated_at',
      setores: 'id, slug, tipo, sort_order, updated_at',
      maquinas: 'id, setor_id, sort_order, updated_at',
      montes: 'id, lote_id, status, setor_id, setor_reserva_id, localizacao, monte_origem_id, updated_at, [lote_id+posicao_x+posicao_y]',
      destinos_saida: 'id, slug, sort_order, updated_at',
      transacoes_saida: 'id, monte_id, destino_saida_id, grupo_liberacao_id, estornada, updated_at',
      eventos_monte: 'id, monte_id, tipo, data_evento, updated_at',
      operadores: 'id, sort_order, updated_at',
      turnos: 'id, sort_order, updated_at',
      modelos_produto: 'id, sort_order, updated_at',
      apontamentos_consumo: 'id, data_consumo, liga_id, lote_id, setor_id, updated_at',
      alocacoes_consumo: 'id, apontamento_id, monte_id, updated_at',
      outbox: 'id, action, status, created_at',
    })

    this.version(2)
      .stores({
        modelos_produto: 'id, sort_order, polaridade, tipo_produto, updated_at',
      })
      .upgrade(async (tx) => {
        await tx
          .table('modelos_produto')
          .toCollection()
          .modify((registro: Record<string, unknown>) => {
            if (registro.tipo_produto === undefined) registro.tipo_produto = 'grade'
            if (registro.polaridade === undefined) registro.polaridade = 'positiva'
            if (registro.placas_por_grade === undefined) registro.placas_por_grade = 4
          })
      })

    this.version(3)
      .stores({
        montes: 'id, lote_id, status, setor_id, setor_reserva_id, localizacao, monte_origem_id, updated_at, [lote_id+posicao_x+posicao_y]',
      })
      .upgrade(async (tx) => {
        await tx
          .table('montes')
          .toCollection()
          .modify((registro: Record<string, unknown>) => {
            if (registro.monte_origem_id === undefined) registro.monte_origem_id = null
          })
      })

    this.version(DB_VERSION).stores({
      contagem_estoque_linha:
        'id, usuario_id, data_contagem, liga_id, updated_at, [usuario_id+data_contagem]',
    })
  }
}

export const db = new ControleChumboDB()

/** Garante IndexedDB aberto antes de operações no client (evita hang no iOS). */
export async function ensureDbOpen(): Promise<void> {
  if (db.isOpen()) return
  await db.open()
}

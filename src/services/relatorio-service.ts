import { AppError } from '@/lib/errors/app-error'
import { filtrarResultadoRelatorio, filtrosAvancadosDeUrl } from '@/lib/relatorio/filtros-relatorio'
import {
  mesclarMetadadosGrupo,
  metadadosIniciaisGrupo,
} from '@/lib/saida/atualizar-grupo-liberacao-view'
import { TIPOS_EVENTO_MONTE } from '@/lib/types/tipo-evento-monte'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import {
  formatarData,
  formatarDataHora,
  periodoParaLimitesDate,
  periodoParaLimitesTimestamptz,
} from '@/lib/utils/date-time'
import type { DestinoSaidaRepository, LigaRepository, SetorRepository } from '@/repositories/cadastro-repository'
import type { EstoqueRepository } from '@/repositories/estoque-repository'
import type { RelatorioRepository } from '@/repositories/relatorio-repository'
import type { RelatorioConsultaInput } from '@/validations/relatorio/relatorio-schema'
import type { LiberacaoGrupoView, LiberacaoLinhaView } from '@/services/saida-service'

export type RelatorioConsultaDeps = {
  ligaRepo: LigaRepository
  destinoRepo: DestinoSaidaRepository
  estoqueRepo: EstoqueRepository
  setorRepo: SetorRepository
}

function requireRepo<T>(repo: T | undefined): T {
  if (!repo) throw AppError.validation('Repositório não informado.')
  return repo
}

type ContextoRelatorio = {
  userId: string
  role: UsuarioRole
}

export type EntradaRelatorioLinha = {
  id: string
  numero_lote: string
  liga_nome: string
  data_chegada: string
  peso_inicial_kg: number
  barras_iniciais: number
  qtd_montes: number
}

export type EventoRelatorioLinha = {
  id: string
  tipo: string
  tipo_rotulo: string
  monte_id: string
  lote_numero: string
  posicao_label: string
  destinatario: string
  data_evento: string
}

export type ConsumoRelatorioLinha = {
  id: string
  data_consumo: string
  nome_setor: string
  nome_operador: string
  nome_turno: string
  nome_maquina: string
  liga_nome: string
  numero_lote_snapshot: string
  barras: number
  peso_kg: number
  borra_kg: number
  modo_selecao_montes: string
}

export type AlocacaoConsumoDetalhe = {
  monte_id: string
  lote_numero: string
  posicao_label: string
  barras_baixadas: number
  peso_baixado_kg: number
}

export type ConsumoRelatorioDetalhe = ConsumoRelatorioLinha & {
  nome_maquina: string
  nome_modelo_produto: string
  observacoes: string | null
  alocacoes: AlocacaoConsumoDetalhe[]
}

export type EntradaRelatorioDetalhe = EntradaRelatorioLinha & {
  colunas_grade: number
  linhas_grade: number
  created_at: string
}

export type RelatorioResultado =
  | { aba: 'entradas'; linhas: EntradaRelatorioLinha[] }
  | { aba: 'saidas'; linhas: LiberacaoGrupoView[] }
  | { aba: 'reservas'; linhas: EventoRelatorioLinha[] }
  | { aba: 'consumo'; linhas: ConsumoRelatorioLinha[] }

function assertPodeVerRelatorios(role: UsuarioRole): void {
  if (role !== 'admin' && role !== 'operador') {
    throw AppError.unauthorized()
  }
}

function assertPodeExportarCsv(role: UsuarioRole): void {
  if (role !== 'admin') {
    throw AppError.unauthorized()
  }
}

function chaveGrupo(grupoId: string | null | undefined, transacaoId: string): string {
  return grupoId ?? transacaoId
}

function rotuloTipoEvento(tipo: string): string {
  switch (tipo) {
    case TIPOS_EVENTO_MONTE.RESERVA:
      return 'Reserva'
    case TIPOS_EVENTO_MONTE.CANCELAMENTO_RESERVA:
      return 'Cancelamento de reserva'
    case TIPOS_EVENTO_MONTE.MOVIDO_PARA_SETOR:
      return 'Movido para setor'
    case TIPOS_EVENTO_MONTE.DEVOLVIDO_ALMOXARIFADO:
      return 'Devolvido ao almoxarifado'
    default:
      return tipo
  }
}

function resolverLimites(input: RelatorioConsultaInput): {
  date: { inicio: string; fim: string }
  timestamptz: { inicio: string; fim: string }
} {
  const date = periodoParaLimitesDate(input.de, input.ate)
  const timestamptz = periodoParaLimitesTimestamptz(input.de, input.ate)
  if (!date || !timestamptz) {
    throw AppError.validation('Período inválido. Verifique as datas informadas.')
  }
  return { date, timestamptz }
}

export async function listarEntradasRelatorio(
  ctx: ContextoRelatorio,
  input: RelatorioConsultaInput,
  repo?: RelatorioRepository,
  deps?: RelatorioConsultaDeps
): Promise<EntradaRelatorioLinha[]> {
  assertPodeVerRelatorios(ctx.role)
  const { date } = resolverLimites(input)

  const relatorioRepo = requireRepo(repo)
  const [lotes, ligas] = await Promise.all([
    relatorioRepo.listarLotesPorPeriodo(date.inicio, date.fim),
    requireRepo(deps).ligaRepo.findAll(true),
  ])

  const ligasPorId = new Map(ligas.map((l) => [l.id, l.nome]))

  const linhas = await Promise.all(
    lotes.map(async (lote) => ({
      id: lote.id,
      numero_lote: lote.numero_lote,
      liga_nome: ligasPorId.get(lote.liga_id) ?? '—',
      data_chegada: lote.data_chegada,
      peso_inicial_kg: lote.peso_inicial_kg,
      barras_iniciais: lote.barras_iniciais,
      qtd_montes: await relatorioRepo.contarMontesPorLote(lote.id),
    }))
  )

  return linhas
}

export async function listarSaidasRelatorio(
  ctx: ContextoRelatorio,
  input: RelatorioConsultaInput,
  repo?: RelatorioRepository,
  deps?: RelatorioConsultaDeps
): Promise<LiberacaoGrupoView[]> {
  assertPodeVerRelatorios(ctx.role)
  const { timestamptz } = resolverLimites(input)

  const [transacoes, destinos, dadosEstoque, setores] = await Promise.all([
    requireRepo(repo).listarTransacoesPorPeriodo(timestamptz.inicio, timestamptz.fim),
    requireRepo(deps).destinoRepo.findAll(true),
    requireRepo(deps).estoqueRepo.fetchDadosBrutos(),
    requireRepo(deps).setorRepo.findAll(true),
  ])

  const { montes, lotes, ligas } = dadosEstoque
  const destinosPorId = new Map(destinos.map((d) => [d.id, d.nome]))
  const setoresPorId = new Map(setores.map((s) => [s.id, s.nome]))
  const ligasPorId = new Map(ligas.map((l) => [l.id, l.nome]))
  const montesPorId = new Map(montes.map((m) => [m.id, m]))
  const lotesPorId = new Map(lotes.map((l) => [l.id, l]))
  const grupos = new Map<string, LiberacaoGrupoView>()

  for (const t of transacoes) {
    const chave = chaveGrupo(t.grupo_liberacao_id, t.id)
    const monte = montesPorId.get(t.monte_id)
    const lote = monte ? lotesPorId.get(monte.lote_id) : undefined

    const linha: LiberacaoLinhaView = {
      transacao_id: t.id,
      monte_id: t.monte_id,
      lote_numero: lote?.numero_lote ?? '—',
      posicao_label: monte ? `(${monte.posicao_x + 1},${monte.posicao_y + 1})` : '—',
      barras_baixadas: t.barras_baixadas,
      peso_baixado_kg: t.peso_baixado_kg,
      estornada: t.estornada,
    }

    const ligaNome = lote ? ligasPorId.get(lote.liga_id) : undefined
    const setorNome = t.setor_id ? setoresPorId.get(t.setor_id) : undefined

    const existente = grupos.get(chave)
    if (!existente) {
      grupos.set(chave, {
        chave,
        grupo_liberacao_id: t.grupo_liberacao_id ?? null,
        destino_nome: destinosPorId.get(t.destino_saida_id) ?? '—',
        data_transacao: t.data_transacao,
        total_barras: t.barras_baixadas,
        total_peso_kg: t.peso_baixado_kg,
        estornada: t.estornada,
        ...metadadosIniciaisGrupo({
          observacao: t.observacao,
          ligaNome,
          setorNome,
        }),
        linhas: [linha],
      })
    } else {
      existente.linhas.push(linha)
      existente.total_barras += t.barras_baixadas
      existente.total_peso_kg =
        Math.round((existente.total_peso_kg + t.peso_baixado_kg) * 100) / 100
      existente.estornada = existente.estornada && t.estornada
      if (t.data_transacao > existente.data_transacao) {
        existente.data_transacao = t.data_transacao
      }
      mesclarMetadadosGrupo(existente, {
        observacao: t.observacao,
        ligaNome,
        setorNome,
      })
    }
  }

  return [...grupos.values()].sort((a, b) =>
    b.data_transacao.localeCompare(a.data_transacao)
  )
}

export async function listarReservasRelatorio(
  ctx: ContextoRelatorio,
  input: RelatorioConsultaInput,
  repo?: RelatorioRepository,
  deps?: RelatorioConsultaDeps
): Promise<EventoRelatorioLinha[]> {
  assertPodeVerRelatorios(ctx.role)
  const { timestamptz } = resolverLimites(input)

  const [eventos, dadosEstoque] = await Promise.all([
    requireRepo(repo).listarEventosPorPeriodo(timestamptz.inicio, timestamptz.fim),
    requireRepo(deps).estoqueRepo.fetchDadosBrutos(),
  ])

  const { montes, lotes } = dadosEstoque
  const montesPorId = new Map(montes.map((m) => [m.id, m]))
  const lotesPorId = new Map(lotes.map((l) => [l.id, l]))

  return eventos.map((evento) => {
    const monte = montesPorId.get(evento.monte_id)
    const lote = monte ? lotesPorId.get(monte.lote_id) : undefined
    return {
      id: evento.id,
      tipo: evento.tipo,
      tipo_rotulo: rotuloTipoEvento(evento.tipo),
      monte_id: evento.monte_id,
      lote_numero: lote?.numero_lote ?? '—',
      posicao_label: monte ? `(${monte.posicao_x + 1},${monte.posicao_y + 1})` : '—',
      destinatario: evento.destinatario,
      data_evento: evento.data_evento,
    }
  })
}

export async function listarConsumoRelatorio(
  ctx: ContextoRelatorio,
  input: RelatorioConsultaInput,
  repo?: RelatorioRepository,
  deps?: RelatorioConsultaDeps
): Promise<ConsumoRelatorioLinha[]> {
  assertPodeVerRelatorios(ctx.role)
  const { date } = resolverLimites(input)

  const [apontamentos, ligas] = await Promise.all([
    requireRepo(repo).listarApontamentosPorPeriodo(date.inicio, date.fim),
    requireRepo(deps).ligaRepo.findAll(true),
  ])
  const ligasPorId = new Map(ligas.map((l) => [l.id, l.nome]))

  return apontamentos.map((a) => ({
    id: a.id,
    data_consumo: a.data_consumo,
    nome_setor: a.nome_setor,
    nome_operador: a.nome_operador,
    nome_turno: a.nome_turno,
    nome_maquina: a.nome_maquina,
    liga_nome: ligasPorId.get(a.liga_id) ?? '—',
    numero_lote_snapshot: a.numero_lote_snapshot,
    barras: a.barras,
    peso_kg: a.peso_kg,
    borra_kg: a.borra_kg,
    modo_selecao_montes: a.modo_selecao_montes,
  }))
}

export async function buscarEntradaDetalhe(
  ctx: ContextoRelatorio,
  loteId: string,
  repo?: RelatorioRepository,
  deps?: RelatorioConsultaDeps
): Promise<EntradaRelatorioDetalhe | null> {
  assertPodeVerRelatorios(ctx.role)

  const { lotes, ligas } = await requireRepo(deps).estoqueRepo.fetchDadosBrutos()
  const lote = lotes.find((l) => l.id === loteId)
  if (!lote) return null

  const liga = ligas.find((l) => l.id === lote.liga_id)

  return {
    id: lote.id,
    numero_lote: lote.numero_lote,
    liga_nome: liga?.nome ?? '—',
    data_chegada: lote.data_chegada,
    peso_inicial_kg: lote.peso_inicial_kg,
    barras_iniciais: lote.barras_iniciais,
    qtd_montes: await requireRepo(repo).contarMontesPorLote(lote.id),
    colunas_grade: lote.colunas_grade,
    linhas_grade: lote.linhas_grade,
    created_at: lote.created_at,
  }
}

export async function buscarConsumoDetalhe(
  ctx: ContextoRelatorio,
  apontamentoId: string,
  repo?: RelatorioRepository,
  deps?: RelatorioConsultaDeps
): Promise<ConsumoRelatorioDetalhe | null> {
  assertPodeVerRelatorios(ctx.role)

  const relatorioRepo = requireRepo(repo)
  const apontamento = await relatorioRepo.findApontamentoById(apontamentoId)
  if (!apontamento) return null

  const [alocacoesRaw, ligas] = await Promise.all([
    relatorioRepo.listarAlocacoesPorApontamentos([apontamentoId]),
    requireRepo(deps).ligaRepo.findAll(true),
  ])
  const ligasPorId = new Map(ligas.map((l) => [l.id, l.nome]))
  const { montes, lotes } = await requireRepo(deps).estoqueRepo.fetchDadosBrutos()
  const montesPorId = new Map(montes.map((m) => [m.id, m]))
  const lotesPorId = new Map(lotes.map((l) => [l.id, l]))

  const alocacoes: AlocacaoConsumoDetalhe[] = alocacoesRaw.map((a) => {
    const monte = montesPorId.get(a.monte_id)
    const lote = monte ? lotesPorId.get(monte.lote_id) : undefined
    return {
      monte_id: a.monte_id,
      lote_numero: lote?.numero_lote ?? '—',
      posicao_label: monte ? `(${monte.posicao_x + 1},${monte.posicao_y + 1})` : '—',
      barras_baixadas: a.barras_baixadas,
      peso_baixado_kg: a.peso_baixado_kg,
    }
  })

  return {
    id: apontamento.id,
    data_consumo: apontamento.data_consumo,
    nome_setor: apontamento.nome_setor,
    nome_operador: apontamento.nome_operador,
    nome_turno: apontamento.nome_turno,
    nome_maquina: apontamento.nome_maquina,
    liga_nome: ligasPorId.get(apontamento.liga_id) ?? '—',
    numero_lote_snapshot: apontamento.numero_lote_snapshot,
    barras: apontamento.barras,
    peso_kg: apontamento.peso_kg,
    borra_kg: apontamento.borra_kg,
    modo_selecao_montes: apontamento.modo_selecao_montes,
    nome_modelo_produto: apontamento.nome_modelo_produto,
    observacoes: apontamento.observacoes ?? null,
    alocacoes,
  }
}

export async function consultarRelatorio(
  ctx: ContextoRelatorio,
  input: RelatorioConsultaInput,
  repo?: RelatorioRepository,
  deps?: RelatorioConsultaDeps
): Promise<RelatorioResultado> {
  switch (input.aba) {
    case 'entradas':
      return { aba: 'entradas', linhas: await listarEntradasRelatorio(ctx, input, repo, deps) }
    case 'saidas':
      return { aba: 'saidas', linhas: await listarSaidasRelatorio(ctx, input, repo, deps) }
    case 'reservas':
      return { aba: 'reservas', linhas: await listarReservasRelatorio(ctx, input, repo, deps) }
    case 'consumo':
      return { aba: 'consumo', linhas: await listarConsumoRelatorio(ctx, input, repo, deps) }
  }
}

function escaparCsv(valor: string | number): string {
  const texto = String(valor)
  if (texto.includes(';') || texto.includes('"') || texto.includes('\n')) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

function linhaCsv(celulas: (string | number)[]): string {
  return celulas.map(escaparCsv).join(';')
}

export async function gerarCsvRelatorio(
  ctx: ContextoRelatorio,
  input: RelatorioConsultaInput,
  repo?: RelatorioRepository,
  deps?: RelatorioConsultaDeps
): Promise<string> {
  assertPodeExportarCsv(ctx.role)
  const resultadoBruto = await consultarRelatorio(ctx, input, repo, deps)
  const resultado = filtrarResultadoRelatorio(
    resultadoBruto,
    filtrosAvancadosDeUrl(input)
  )
  const linhas: string[] = []

  switch (resultado.aba) {
    case 'entradas':
      linhas.push(
        linhaCsv([
          'Lote',
          'Liga',
          'Data chegada',
          'Peso inicial (kg)',
          'Barras iniciais',
          'Qtd montes',
        ])
      )
      for (const item of resultado.linhas) {
        linhas.push(
          linhaCsv([
            item.numero_lote,
            item.liga_nome,
            formatarData(item.data_chegada),
            item.peso_inicial_kg,
            item.barras_iniciais,
            item.qtd_montes,
          ])
        )
      }
      break
    case 'saidas':
      linhas.push(
        linhaCsv([
          'Destino',
          'Data',
          'Status',
          'Total barras',
          'Total peso (kg)',
          'Lote',
          'Posição',
          'Barras',
          'Peso (kg)',
        ])
      )
      for (const grupo of resultado.linhas) {
        for (const linha of grupo.linhas) {
          linhas.push(
            linhaCsv([
              grupo.destino_nome,
              formatarDataHora(grupo.data_transacao),
              grupo.estornada ? 'Estornada' : 'Ativa',
              grupo.total_barras,
              grupo.total_peso_kg,
              linha.lote_numero,
              linha.posicao_label,
              linha.barras_baixadas,
              linha.peso_baixado_kg,
            ])
          )
        }
      }
      break
    case 'reservas':
      linhas.push(
        linhaCsv(['Tipo', 'Data', 'Lote', 'Posição', 'Destinatário'])
      )
      for (const item of resultado.linhas) {
        linhas.push(
          linhaCsv([
            item.tipo_rotulo,
            formatarDataHora(item.data_evento),
            item.lote_numero,
            item.posicao_label,
            item.destinatario,
          ])
        )
      }
      break
    case 'consumo':
      linhas.push(
        linhaCsv([
          'Data',
          'Setor',
          'Operador',
          'Turno',
          'Lote',
          'Barras',
          'Peso (kg)',
          'Borra (kg)',
          'Modo',
        ])
      )
      for (const item of resultado.linhas) {
        linhas.push(
          linhaCsv([
            formatarData(item.data_consumo),
            item.nome_setor,
            item.nome_operador,
            item.nome_turno,
            item.numero_lote_snapshot,
            item.barras,
            item.peso_kg,
            item.borra_kg,
            item.modo_selecao_montes,
          ])
        )
      }
      break
  }

  return `\uFEFF${linhas.join('\n')}`
}

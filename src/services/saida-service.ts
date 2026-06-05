import { monteEstaConsumido } from '@/lib/estoque/calcular-saldos'
import { getDestinoSaidaRepository, getSetorRepository } from '@/lib/data-source/cadastro-repositories'
import { getEstoqueRepository } from '@/lib/data-source/estoque-repositories'
import { getSaidaRepository } from '@/lib/data-source/saida-repositories'
import { AppError } from '@/lib/errors/app-error'
import {
  mesclarMetadadosGrupo,
  metadadosIniciaisGrupo,
} from '@/lib/saida/atualizar-grupo-liberacao-view'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { SaidaRepository } from '@/repositories/saida-repository'
import { seedDestinosSaidaSeVazio } from '@/services/cadastro-service'
import type {
  BaixaAgrupadaInput,
  EstornarLiberacaoInput,
} from '@/validations/saida/saida-schema'

type ContextoSaida = {
  userId: string
  role: UsuarioRole
}

export type MonteElegivelSaida = {
  id: string
  lote_id: string
  lote_numero: string
  liga_nome: string
  posicao_x: number
  posicao_y: number
  barras_atuais: number
  peso_atual_kg: number
  status: string
  updated_at: string
}

export type LiberacaoLinhaView = {
  transacao_id: string
  monte_id: string
  lote_numero: string
  posicao_label: string
  barras_baixadas: number
  peso_baixado_kg: number
  estornada: boolean
}

export type LiberacaoGrupoView = {
  chave: string
  grupo_liberacao_id: string | null
  destino_nome: string
  data_transacao: string
  total_barras: number
  total_peso_kg: number
  estornada: boolean
  observacao?: string | null
  ligas: string[]
  setores: string[]
  linhas: LiberacaoLinhaView[]
}

function assertAdmin(role: UsuarioRole): void {
  if (role !== 'admin') {
    throw AppError.unauthorized()
  }
}

function chaveGrupo(grupoId: string | null | undefined, transacaoId: string): string {
  return grupoId ?? transacaoId
}

export async function listarMontesElegiveisSaida(
  ctx: ContextoSaida,
  estoqueRepo = getEstoqueRepository()
): Promise<MonteElegivelSaida[]> {
  assertAdmin(ctx.role)

  const { ligas, lotes, montes } = await estoqueRepo.fetchDadosBrutos()

  const ligasPorId = new Map(ligas.map((l) => [l.id, l.nome]))
  const lotesPorId = new Map(lotes.map((l) => [l.id, l]))

  return montes
    .filter((m) => !monteEstaConsumido(m) && m.barras_atuais > 0)
    .map((m) => {
      const lote = lotesPorId.get(m.lote_id)
      return {
        id: m.id,
        lote_id: m.lote_id,
        lote_numero: lote?.numero_lote ?? '—',
        liga_nome: lote ? (ligasPorId.get(lote.liga_id) ?? '—') : '—',
        posicao_x: m.posicao_x,
        posicao_y: m.posicao_y,
        barras_atuais: m.barras_atuais,
        peso_atual_kg: m.peso_atual_kg,
        status: m.status,
        updated_at: m.updated_at,
      }
    })
    .sort(
      (a, b) =>
        a.liga_nome.localeCompare(b.liga_nome) ||
        a.lote_numero.localeCompare(b.lote_numero) ||
        a.posicao_y - b.posicao_y ||
        a.posicao_x - b.posicao_x
    )
}

export async function listarLiberacoes(
  ctx: ContextoSaida,
  repo: SaidaRepository = getSaidaRepository()
): Promise<LiberacaoGrupoView[]> {
  assertAdmin(ctx.role)

  const [transacoes, destinos, dadosEstoque, setores] = await Promise.all([
    repo.listarTransacoes(),
    getDestinoSaidaRepository().findAll(true),
    getEstoqueRepository().fetchDadosBrutos(),
    getSetorRepository().findAll(true),
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
      posicao_label: monte ? `(${monte.posicao_x},${monte.posicao_y})` : '—',
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

export async function baixaAgrupada(
  ctx: ContextoSaida,
  input: BaixaAgrupadaInput,
  repo: SaidaRepository = getSaidaRepository()
) {
  try {
    assertAdmin(ctx.role)
    await seedDestinosSaidaSeVazio(ctx.userId)
    return repo.executarBaixaAgrupada({
      destino_saida_id: input.destino_saida_id,
      setor_id: input.setor_id ?? null,
      observacao: input.observacao,
      linhas: input.linhas,
      created_by: ctx.userId,
    })
  } catch (error) {
    console.error('[baixaAgrupada]', error)
    throw error
  }
}

export async function estornarLiberacao(
  ctx: ContextoSaida,
  input: EstornarLiberacaoInput,
  repo: SaidaRepository = getSaidaRepository()
) {
  try {
    assertAdmin(ctx.role)

    let transacaoIds: string[] = []

    if (input.grupo_liberacao_id) {
      const grupo = await repo.findTransacoesByGrupo(input.grupo_liberacao_id)
      transacaoIds = grupo.filter((t) => !t.estornada).map((t) => t.id)
    } else if (input.transacao_id) {
      const transacao = await repo.findTransacaoById(input.transacao_id)
      if (!transacao) throw AppError.notFound('Transação de saída')
      if (transacao.estornada) {
        throw AppError.validation('Esta liberação já foi estornada.')
      }
      transacaoIds = [transacao.id]
    }

    if (transacaoIds.length === 0) {
      throw AppError.validation('Nenhuma transação ativa para estornar.')
    }

    await repo.estornarTransacoes({
      transacao_ids: transacaoIds,
      estornada_por: ctx.userId,
    })
  } catch (error) {
    console.error('[estornarLiberacao]', error)
    throw error
  }
}

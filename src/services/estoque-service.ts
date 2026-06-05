import {
  calcularSaldosMontes,
  somarSaldosEstoque,
  type SaldosEstoque,
} from '@/lib/estoque/calcular-saldos'
import { getSetorRepository } from '@/lib/data-source/cadastro-repositories'
import { getEstoqueRepository } from '@/lib/data-source/estoque-repositories'
import { AppError } from '@/lib/errors/app-error'

const LOTE_DEMO_NUMERO = 'DEMO-001'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { EstoqueRepository, Liga, Lote, Monte } from '@/repositories/estoque-repository'

type ContextoEstoque = {
  userId: string
  role: UsuarioRole
}

export type LoteEstoque = Lote & {
  montes: Monte[]
  saldos: SaldosEstoque
}

export type LigaEstoque = Liga & {
  lotes: LoteEstoque[]
  saldos: SaldosEstoque
}

export type VisaoEstoque = {
  ligas: LigaEstoque[]
  setores_por_id: Record<string, string>
}

function assertPodeVerEstoque(role: UsuarioRole): void {
  if (role !== 'admin' && role !== 'operador') {
    throw AppError.unauthorized()
  }
}

function montarVisao(ligas: Liga[], lotes: Lote[], montes: Monte[]): { ligas: LigaEstoque[] } {
  const montesPorLote = new Map<string, Monte[]>()
  for (const monte of montes) {
    const lista = montesPorLote.get(monte.lote_id) ?? []
    lista.push(monte)
    montesPorLote.set(monte.lote_id, lista)
  }

  const lotesPorLiga = new Map<string, LoteEstoque[]>()

  for (const lote of lotes.filter((l) => l.numero_lote !== LOTE_DEMO_NUMERO)) {
    const montesLote = montesPorLote.get(lote.id) ?? []
    montesLote.sort((a, b) => a.posicao_y - b.posicao_y || a.posicao_x - b.posicao_x)

    const loteEstoque: LoteEstoque = {
      ...lote,
      montes: montesLote,
      saldos: calcularSaldosMontes(montesLote),
    }

    const lista = lotesPorLiga.get(lote.liga_id) ?? []
    lista.push(loteEstoque)
    lotesPorLiga.set(lote.liga_id, lista)
  }

  for (const [, lista] of lotesPorLiga) {
    lista.sort((a, b) => b.data_chegada.localeCompare(a.data_chegada))
  }

  const ligasEstoque: LigaEstoque[] = ligas.map((liga) => {
    const lotesLiga = lotesPorLiga.get(liga.id) ?? []
    return {
      ...liga,
      lotes: lotesLiga,
      saldos: somarSaldosEstoque(lotesLiga.map((l) => l.saldos)),
    }
  })

  return { ligas: ligasEstoque }
}

export async function listarVisaoEstoque(
  ctx: ContextoEstoque,
  repo: EstoqueRepository = getEstoqueRepository()
): Promise<VisaoEstoque> {
  try {
    assertPodeVerEstoque(ctx.role)

    const [{ ligas, lotes, montes }, setores] = await Promise.all([
      repo.fetchDadosBrutos(),
      getSetorRepository().findAll(),
    ])

    const setores_por_id = Object.fromEntries(setores.map((s) => [s.id, s.nome]))
    return { ...montarVisao(ligas, lotes, montes), setores_por_id }
  } catch (error) {
    console.error('[listarVisaoEstoque]', error)
    throw error
  }
}

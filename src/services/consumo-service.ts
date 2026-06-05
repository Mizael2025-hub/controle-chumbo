import { alocarBarrasConsumo } from '@/lib/consumo/alocar-barras'
import {
  getMaquinaRepository,
  getOperadorRepository,
  getSetorRepository,
  getTurnoRepository,
} from '@/lib/data-source/cadastro-repositories'
import { getConsumoRepository } from '@/lib/data-source/consumo-repositories'
import { getEstoqueRepository } from '@/lib/data-source/estoque-repositories'
import { AppError } from '@/lib/errors/app-error'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type {
  ApontamentoConsumo,
  ConsumoRepository,
  CriarConsumoResult,
  LoteConsumoOpcao,
} from '@/repositories/consumo-repository'
import type { CriarConsumoInput, ListarLotesConsumoInput } from '@/validations/consumo/consumo-schema'

type ContextoConsumo = {
  userId: string
  role: UsuarioRole
}

function assertPodeConsumir(role: UsuarioRole): void {
  if (role !== 'admin' && role !== 'operador') {
    throw AppError.unauthorized()
  }
}

export async function listarLotesConsumoSetor(
  ctx: ContextoConsumo,
  input: ListarLotesConsumoInput,
  repo: ConsumoRepository = getConsumoRepository()
): Promise<LoteConsumoOpcao[]> {
  assertPodeConsumir(ctx.role)
  return repo.listarLotesComSaldoNoSetor(input.setor_id, input.liga_id)
}

export async function criarApontamentoConsumo(
  ctx: ContextoConsumo,
  input: CriarConsumoInput,
  repo: ConsumoRepository = getConsumoRepository()
): Promise<CriarConsumoResult> {
  try {
    assertPodeConsumir(ctx.role)

    const setor = await getSetorRepository().findById(input.setor_id)
    if (!setor || !setor.is_active) throw AppError.validation('Setor inválido.')

    const maquina = await getMaquinaRepository().findById(input.maquina_id)
    if (!maquina || !maquina.is_active) throw AppError.validation('Máquina inválida.')
    if (maquina.setor_id !== input.setor_id) {
      throw AppError.validation('Máquina não pertence ao setor selecionado.')
    }

    const operador = await getOperadorRepository().findById(input.operador_id)
    if (!operador || !operador.is_active) throw AppError.validation('Operador inválido.')

    const turno = await getTurnoRepository().findById(input.turno_id)
    if (!turno || !turno.is_active) throw AppError.validation('Turno inválido.')

    const { ligas, lotes } = await getEstoqueRepository().fetchDadosBrutos()
    const liga = ligas.find((l) => l.id === input.liga_id)
    if (!liga) throw AppError.validation('Liga inválida.')
    const lote = lotes.find((l) => l.id === input.lote_id && l.liga_id === input.liga_id)
    if (!lote) throw AppError.validation('Lote inválido para esta liga.')

    let montesOrdenados = await repo.listarMontesElegiveisConsumo(
      input.setor_id,
      input.liga_id,
      input.lote_id
    )

    if (input.modo_selecao_montes === 'manual' && input.montes_ids?.length) {
      const mapa = new Map(montesOrdenados.map((m) => [m.id, m]))
      montesOrdenados = input.montes_ids
        .map((id) => mapa.get(id))
        .filter((m): m is NonNullable<typeof m> => Boolean(m))
    }

    const { alocacoes, barrasRestantes } = alocarBarrasConsumo(montesOrdenados, input.barras)
    if (barrasRestantes > 0) {
      throw AppError.validation('Saldo insuficiente no setor para o consumo informado.')
    }

    const atualizacoes_montes = alocacoes.map(({ monte, barras, peso }) => {
      const novasBarras = monte.barras_atuais - barras
      const novoPeso = Math.round((monte.peso_atual_kg - peso) * 100) / 100
      return {
        monte_id: monte.id,
        expected_updated_at: monte.updated_at,
        peso_atual_kg: novasBarras === 0 ? 0 : novoPeso,
        barras_atuais: novasBarras,
        status: novasBarras === 0 ? STATUS_MONTE.CONSUMIDO : STATUS_MONTE.PARCIAL,
      }
    })

    return repo.criarApontamento({
      apontamento: {
        data_consumo: input.data_consumo,
        liga_id: input.liga_id,
        lote_id: input.lote_id,
        setor_id: input.setor_id,
        maquina_id: input.maquina_id,
        operador_id: input.operador_id,
        turno_id: input.turno_id,
        modelo_produto_id: null,
        barras: input.barras,
        borra_kg: input.borra_kg,
        modo_selecao_montes: input.modo_selecao_montes,
        lote_produto: null,
        observacoes: input.observacoes?.trim() || null,
        nome_operador: operador.nome,
        nome_turno: turno.nome,
        nome_maquina: maquina.nome,
        nome_setor: setor.nome,
        nome_modelo_produto: '',
        numero_lote_snapshot: lote.numero_lote,
        created_by: ctx.userId,
      },
      alocacoes: alocacoes.map(({ monte, barras, peso, kgPorBarra }) => ({
        monte_id: monte.id,
        barras_baixadas: barras,
        peso_baixado_kg: peso,
        kg_por_barra_snapshot: kgPorBarra,
      })),
      atualizacoes_montes,
    })
  } catch (error) {
    console.error('[criarApontamentoConsumo]', error)
    throw error
  }
}

export type { ApontamentoConsumo }

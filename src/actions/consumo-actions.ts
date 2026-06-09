'use server'

import {
  getConsumoRepository,
  getEstoqueRepository,
  getMaquinaRepository,
  getOperadorRepository,
  getSetorRepository,
  getTurnoRepository,
} from '@/lib/data-source/server-repositories'

import { getActionContext } from '@/lib/auth/get-session-context'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { CriarConsumoResult, LoteConsumoOpcao } from '@/repositories/consumo-repository'
import * as consumoService from '@/services/consumo-service'
import {
  criarConsumoSchema,
  listarLotesConsumoSchema,
} from '@/validations/consumo/consumo-schema'

async function getContexto() {
  const ctx = await getActionContext()
  return { userId: ctx.user.id, role: ctx.role as UsuarioRole }
}

function handleError<T = void>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) return { success: false, message: error.message }
  console.error('[consumoAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function listarLotesConsumoAction(
  rawData: unknown
): Promise<ActionResponse<LoteConsumoOpcao[]>> {
  try {
    const parsed = listarLotesConsumoSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await consumoService.listarLotesConsumoSetor(ctx, parsed.data, await getConsumoRepository())
    return { success: true, data, message: 'Lotes carregados.' }
  } catch (error) {
    return handleError(error)
  }
}

export async function criarConsumoAction(
  rawData: unknown
): Promise<ActionResponse<CriarConsumoResult>> {
  try {
    const parsed = criarConsumoSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await consumoService.criarApontamentoConsumo(ctx, parsed.data, await getConsumoRepository(), {
      setorRepo: await getSetorRepository(),
      maquinaRepo: await getMaquinaRepository(),
      operadorRepo: await getOperadorRepository(),
      turnoRepo: await getTurnoRepository(),
      estoqueRepo: await getEstoqueRepository(),
    })
    return { success: true, data, message: 'Consumo registrado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

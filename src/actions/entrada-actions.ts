'use server'

import { getEntradaRepository } from '@/lib/data-source/server-repositories'

import { getActionContext } from '@/lib/auth/get-session-context'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as entradaService from '@/services/entrada-service'
import type { ResultadoCriarEntrada } from '@/services/entrada-service'
import { criarEntradaSchema } from '@/validations/entrada/entrada-schema'

async function getContexto() {
  const ctx = await getActionContext()
  return { userId: ctx.user.id, role: ctx.role as UsuarioRole }
}

function handleError<T = void>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) return { success: false, message: error.message }
  console.error('[entradaAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function criarEntradaAction(
  rawData: unknown
): Promise<ActionResponse<ResultadoCriarEntrada>> {
  try {
    const parsed = criarEntradaSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        message: 'Dados inválidos.',
        errors: parsed.error.flatten().fieldErrors,
      }
    }
    const ctx = await getContexto()
    const data = await entradaService.criarEntrada(ctx, parsed.data, await getEntradaRepository())
    return {
      success: true,
      data,
      message: 'Lote e grade cadastrados com sucesso!',
    }
  } catch (error) {
    return handleError(error)
  }
}

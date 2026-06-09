'use client'

import { criarEntradaAction } from '@/actions/entrada-actions'
import { dispatchLocalOrAction } from '@/lib/data-source/client-dispatch'
import { entradaRepositoryLocalClient } from '@/lib/data-source/entrada-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as entradaService from '@/services/entrada-service'
import type { ResultadoCriarEntrada } from '@/services/entrada-service'
import type { CriarEntradaInput } from '@/validations/entrada/entrada-schema'

type ContextoClient = {
  userId: string
  role: UsuarioRole
}

async function executarLocal<T>(
  operacao: () => Promise<T>,
  message: string
): Promise<ActionResponse<T>> {
  try {
    const data = await operacao()
    return { success: true, data, message }
  } catch (error) {
    console.error('[entradaClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

export const entradaClient = {
  criar: (ctx: ContextoClient, input: CriarEntradaInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => entradaService.criarEntrada(ctx, input, entradaRepositoryLocalClient),
          'Lote e grade cadastrados com sucesso!'
        ),
      () => criarEntradaAction(input)
    ) as Promise<ActionResponse<ResultadoCriarEntrada>>,
}

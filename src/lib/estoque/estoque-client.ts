'use client'

import { listarVisaoEstoqueAction } from '@/actions/estoque-actions'
import { cadastroRepositoriesLocal } from '@/lib/data-source/cadastro-repositories'
import { dispatchLocalOrAction } from '@/lib/data-source/client-dispatch'
import { estoqueRepositoryLocalClient } from '@/lib/data-source/estoque-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as estoqueService from '@/services/estoque-service'

type ContextoClient = {
  userId: string
  role: UsuarioRole
}

function wrapSuccess<T>(data: T): ActionResponse<T> {
  return { success: true, data }
}

function wrapError(error: unknown): ActionResponse {
  if (error instanceof AppError) {
    return { success: false, message: error.message }
  }
  if (error instanceof Error) {
    return { success: false, message: error.message }
  }
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export const estoqueClient = {
  listarVisaoEstoque: async (
    ctx: ContextoClient
  ): Promise<ActionResponse<estoqueService.VisaoEstoque>> =>
    dispatchLocalOrAction(
      async () => {
        try {
          const data = await estoqueService.listarVisaoEstoque(
            ctx,
            estoqueRepositoryLocalClient,
            cadastroRepositoriesLocal.setores
          )
          return wrapSuccess(data)
        } catch (error) {
          console.error('[estoqueClient.listarVisaoEstoque]', error)
          return wrapError(error) as ActionResponse<estoqueService.VisaoEstoque>
        }
      },
      () => listarVisaoEstoqueAction()
    ),
}

'use server'

import { getEstoqueRepository, getSetorRepository } from '@/lib/data-source/server-repositories'

import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as estoqueService from '@/services/estoque-service'

async function getContexto() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()
  if (!role) throw AppError.unauthorized()
  return { userId: user.id, role: role as UsuarioRole }
}

function handleError<T = void>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) return { success: false, message: error.message }
  console.error('[estoqueAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function listarVisaoEstoqueAction(): Promise<
  ActionResponse<Awaited<ReturnType<typeof estoqueService.listarVisaoEstoque>>>
> {
  try {
    const ctx = await getContexto()
    const data = await estoqueService.listarVisaoEstoque(ctx, await getEstoqueRepository(), await getSetorRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

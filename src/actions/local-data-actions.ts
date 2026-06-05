'use server'

import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import type { ActionResponse } from '@/lib/types/action-response'

export async function limparDadosLocaisAction(): Promise<ActionResponse> {
  try {
    await getAuthenticatedUser()
    const role = await getUserRole()

    if (role !== 'admin') {
      return { success: false, message: 'Acesso negado. Somente administradores.' }
    }

    return {
      success: true,
      message: 'Autorizado. Execute a limpeza no dispositivo.',
    }
  } catch (error) {
    console.error('[limparDadosLocaisAction]', error)
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

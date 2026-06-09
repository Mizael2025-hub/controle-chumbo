'use server'

import { getActionContext } from '@/lib/auth/get-session-context'
import type { ActionResponse } from '@/lib/types/action-response'

export async function limparDadosLocaisAction(): Promise<ActionResponse> {
  try {
    const ctx = await getActionContext()

    if (ctx.role !== 'admin') {
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

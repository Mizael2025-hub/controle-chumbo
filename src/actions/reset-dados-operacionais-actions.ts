'use server'

import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { getDataSource } from '@/lib/data-source'
import type { ActionResponse } from '@/lib/types/action-response'

export async function autorizarResetOperacionalAction(): Promise<
  ActionResponse<{ data_source: string }>
> {
  try {
    await getAuthenticatedUser()
    const role = await getUserRole()

    if (role !== 'admin') {
      return { success: false, message: 'Acesso negado. Somente administradores.' }
    }

    const permitido =
      process.env.ALLOW_RESET_OPERACIONAL === 'true' || process.env.NODE_ENV !== 'production'

    if (!permitido) {
      return {
        success: false,
        message: 'Reset operacional desabilitado neste ambiente.',
      }
    }

    const dataSource = getDataSource()

    return {
      success: true,
      message:
        dataSource === 'local'
          ? 'Autorizado. Execute o reset no dispositivo.'
          : 'Autorizado. Execute supabase/scripts/reset_operacional_testes.sql no projeto.',
      data: { data_source: dataSource },
    }
  } catch (error) {
    console.error('[autorizarResetOperacionalAction]', error)
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

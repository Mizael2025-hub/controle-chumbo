'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getDataSource } from '@/lib/data-source'
import { MOCK_AUTH_COOKIE, getMockUserById } from '@/lib/auth/mock-users'
import type { ActionResponse } from '@/lib/types/action-response'

export async function trocarMockUsuarioAction(
  userId: string
): Promise<ActionResponse<{ userId: string }>> {
  try {
    if (getDataSource() !== 'local') {
      return {
        success: false,
        message: 'Troca de usuário mock disponível apenas com DATA_SOURCE=local.',
      }
    }

    const mockUser = getMockUserById(userId)
    if (!mockUser) {
      return { success: false, message: 'Usuário mock não encontrado.' }
    }

    const cookieStore = await cookies()
    cookieStore.set(MOCK_AUTH_COOKIE, userId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    revalidatePath('/')

    return {
      success: true,
      data: { userId },
      message: `Perfil alterado para ${mockUser.nome} (${mockUser.role}).`,
    }
  } catch (error) {
    console.error('[trocarMockUsuarioAction]', error)
    return { success: false, message: 'Erro ao trocar usuário mock.' }
  }
}

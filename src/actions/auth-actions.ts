'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getDataSource } from '@/lib/data-source'
import { MOCK_AUTH_COOKIE, getMockUserById } from '@/lib/auth/mock-users'
import { createServerSupabase } from '@/lib/supabase/server'
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

export async function loginAction(
  email: string,
  senha: string
): Promise<ActionResponse<null>> {
  try {
    if (getDataSource() !== 'supabase') {
      return { success: false, message: 'Login real disponível apenas com DATA_SOURCE=supabase.' }
    }

    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    if (error) {
      console.error('[loginAction]', error)
      return { success: false, message: 'E-mail ou senha inválidos.' }
    }

    revalidatePath('/')
    return { success: true, data: null, message: 'Login realizado com sucesso.' }
  } catch (error) {
    console.error('[loginAction]', error)
    return { success: false, message: 'Erro ao fazer login.' }
  }
}

export async function logoutAction(): Promise<ActionResponse<null>> {
  try {
    if (getDataSource() !== 'supabase') {
      return { success: false, message: 'Logout disponível apenas com DATA_SOURCE=supabase.' }
    }

    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[logoutAction]', error)
      return { success: false, message: 'Erro ao sair.' }
    }

    revalidatePath('/')
    return { success: true, data: null, message: 'Sessão encerrada.' }
  } catch (error) {
    console.error('[logoutAction]', error)
    return { success: false, message: 'Erro ao sair.' }
  }
}

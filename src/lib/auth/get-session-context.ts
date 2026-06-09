import { cache } from 'react'
import { cookies } from 'next/headers'
import { getDataSource } from '@/lib/data-source'
import {
  DEFAULT_MOCK_USER_ID,
  getMockUserById,
  MOCK_AUTH_COOKIE,
  type AuthUser,
} from '@/lib/auth/mock-users'
import { AppError } from '@/lib/errors/app-error'
import { createServerSupabase } from '@/lib/supabase/server'
import type { UsuarioRole } from '@/lib/types/usuario-role'

export type SessionContext = {
  user: AuthUser
  role: UsuarioRole
}

async function resolveSessionContext(): Promise<SessionContext | null> {
  if (getDataSource() === 'local') {
    const cookieStore = await cookies()
    const userId = cookieStore.get(MOCK_AUTH_COOKIE)?.value ?? DEFAULT_MOCK_USER_ID
    const mockUser = getMockUserById(userId) ?? getMockUserById(DEFAULT_MOCK_USER_ID)

    if (!mockUser) {
      throw new Error('Usuário mock padrão não configurado.')
    }

    return { user: mockUser, role: mockUser.role }
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from('usuarios')
    .select('nome, email, role, is_active')
    .eq('user_id', user.id)
    .maybeSingle()

  if (erroPerfil) {
    console.error('[getSessionContext.perfil]', erroPerfil)
  }

  const role: UsuarioRole =
    perfil?.is_active === false
      ? 'operador'
      : (perfil?.role as UsuarioRole | undefined) ?? 'operador'

  return {
    user: {
      id: user.id,
      email: perfil?.email ?? user.email ?? '',
      nome: perfil?.nome ?? user.email ?? 'Usuário',
      role,
    },
    role,
  }
}

/** Uma chamada auth + perfil por request (React.cache). */
export const getSessionContext = cache(resolveSessionContext)

/** Contexto para server actions — exige sessão autenticada. */
export async function getActionContext(): Promise<SessionContext> {
  const ctx = await getSessionContext()
  if (!ctx?.role) {
    throw AppError.unauthorized()
  }
  return ctx
}

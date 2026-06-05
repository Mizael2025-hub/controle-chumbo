import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDataSource } from '@/lib/data-source'
import {
  DEFAULT_MOCK_USER_ID,
  getMockUserById,
  MOCK_AUTH_COOKIE,
  type AuthUser,
} from '@/lib/auth/mock-users'
import { createServerSupabase } from '@/lib/supabase/server'

export async function getAuthenticatedUser(): Promise<AuthUser> {
  if (getDataSource() === 'local') {
    const cookieStore = await cookies()
    const userId = cookieStore.get(MOCK_AUTH_COOKIE)?.value ?? DEFAULT_MOCK_USER_ID
    const mockUser = getMockUserById(userId) ?? getMockUserById(DEFAULT_MOCK_USER_ID)

    if (!mockUser) {
      throw new Error('Usuário mock padrão não configurado.')
    }

    return mockUser
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return {
    id: user.id,
    email: user.email ?? '',
    nome: user.email ?? 'Usuário',
    role: 'operador',
  }
}

export async function getAuthenticatedUserId(): Promise<string> {
  const user = await getAuthenticatedUser()
  return user.id
}

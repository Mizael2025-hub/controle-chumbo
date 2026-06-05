import { getDataSource } from '@/lib/data-source'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { createServerSupabase } from '@/lib/supabase/server'
import type { UsuarioRole } from '@/lib/types/usuario-role'

export async function getUserRole(): Promise<UsuarioRole | null> {
  if (getDataSource() === 'local') {
    const user = await getAuthenticatedUser()
    return user.role
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('usuarios')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('[getUserRole]', error)
    return null
  }

  return (data?.role as UsuarioRole | undefined) ?? null
}

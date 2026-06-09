import { getSessionContext } from '@/lib/auth/get-session-context'
import type { UsuarioRole } from '@/lib/types/usuario-role'

export async function getUserRole(): Promise<UsuarioRole | null> {
  const ctx = await getSessionContext()
  return ctx?.role ?? null
}

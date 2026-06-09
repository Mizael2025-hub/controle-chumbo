import { redirect } from 'next/navigation'
import { getSessionContext } from '@/lib/auth/get-session-context'
import type { AuthUser } from '@/lib/auth/mock-users'

export async function getAuthenticatedUser(): Promise<AuthUser> {
  const ctx = await getSessionContext()
  if (!ctx) {
    redirect('/login')
  }
  return ctx.user
}

export async function getAuthenticatedUserId(): Promise<string> {
  const user = await getAuthenticatedUser()
  return user.id
}

import { AppError } from '@/lib/errors/app-error'
import { getUserRole } from '@/lib/auth/get-user-role'
import type { UsuarioRole } from '@/lib/types/usuario-role'

export async function requireRole(rolesPermitidos: UsuarioRole[]): Promise<UsuarioRole> {
  const role = await getUserRole()

  if (!role || !rolesPermitidos.includes(role)) {
    throw AppError.unauthorized()
  }

  return role
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

export async function isOperador(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'operador'
}

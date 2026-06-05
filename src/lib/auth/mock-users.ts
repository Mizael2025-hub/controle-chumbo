import type { UsuarioRole } from '@/lib/types/usuario-role'

export type AuthUser = {
  id: string
  email: string
  nome: string
  role: UsuarioRole
}

export const MOCK_AUTH_COOKIE = 'mock-auth-user-id'

export const MOCK_USERS: Record<string, AuthUser> = {
  'admin-dev-id': {
    id: 'admin-dev-id',
    email: 'pcp@local.test',
    nome: 'Admin PCP',
    role: 'admin',
  },
  'operador-dev-id': {
    id: 'operador-dev-id',
    email: 'operador@local.test',
    nome: 'Operador Setor',
    role: 'operador',
  },
}

export const DEFAULT_MOCK_USER_ID = 'admin-dev-id'

export function getMockUserById(userId: string): AuthUser | null {
  return MOCK_USERS[userId] ?? null
}

export function listMockUsers(): AuthUser[] {
  return Object.values(MOCK_USERS)
}

/** Perfis de acesso MVP — ver docs/BUSINESS_RULES.md §1 */
export type UsuarioRole = 'operador' | 'supervisor' | 'admin'

export const USUARIO_ROLES: UsuarioRole[] = ['operador', 'supervisor', 'admin']

export function isUsuarioRole(valor: string): valor is UsuarioRole {
  return USUARIO_ROLES.includes(valor as UsuarioRole)
}

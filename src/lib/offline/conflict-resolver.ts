import type { RegistroComUpdatedAt } from './types'

/** Regra LWW: updated_at mais recente vence */
export function resolverConflito(
  local: RegistroComUpdatedAt,
  servidor: RegistroComUpdatedAt
): 'local' | 'servidor' {
  return new Date(servidor.updated_at) > new Date(local.updated_at)
    ? 'servidor'
    : 'local'
}

'use client'

import { LoginGate } from '@/components/features/auth/login-gate'
import { AppShellClient } from '@/components/layout/app-shell-client'
import { OfflineSyncProvider } from '@/components/providers/offline-sync-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import type { UsuarioRole } from '@/lib/types/usuario-role'

type Props = {
  children: React.ReactNode
  role: UsuarioRole | null
}

export function AppProviders({ children, role }: Props) {
  return (
    <LoginGate>
      <QueryProvider>
        <OfflineSyncProvider>
          <AppShellClient role={role}>{children}</AppShellClient>
        </OfflineSyncProvider>
      </QueryProvider>
    </LoginGate>
  )
}

'use client'

import { LoginGate } from '@/components/features/auth/login-gate'
import { AppHeader } from '@/components/layout/app-header'
import { OfflineSyncProvider } from '@/components/providers/offline-sync-provider'
import { QueryProvider } from '@/components/providers/query-provider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LoginGate>
      <QueryProvider>
        <OfflineSyncProvider>
          <AppHeader />
          <div className="flex flex-1 flex-col min-h-0">{children}</div>
        </OfflineSyncProvider>
      </QueryProvider>
    </LoginGate>
  )
}

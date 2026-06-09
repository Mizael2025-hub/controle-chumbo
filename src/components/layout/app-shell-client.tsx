'use client'

import { useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { agentLog } from '@/lib/debug/agent-log'
import { podeUsarNavegacao } from '@/lib/navigation/nav-config'
import type { UsuarioRole } from '@/lib/types/usuario-role'

type Props = {
  role: UsuarioRole | null
  children: React.ReactNode
}

export function AppShellClient({ role, children }: Props) {
  const exibirNav = podeUsarNavegacao(role)

  useEffect(() => {
    // #region agent log
    agentLog({
      location: 'app-shell-client.tsx:mount',
      message: 'AppShellClient montado',
      hypothesisId: 'H1',
      runId: 'post-fix',
      data: { role, exibirNav, innerWidth: window.innerWidth },
    })
    // #endregion
  }, [role, exibirNav])

  if (!exibirNav) {
    return (
      <div className="app-viewport-shell">
        <AppHeader />
        <main className="app-main-scroll">{children}</main>
      </div>
    )
  }

  return (
    <div className="app-viewport-shell lg:flex-row">
      <AppSidebar role={role} />
      <div className="app-viewport-shell lg:pl-[240px]">
        <AppHeader />
        <main className="app-main-scroll" data-testid="app-main-scroll">
          {children}
        </main>
      </div>
    </div>
  )
}

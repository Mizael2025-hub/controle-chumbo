'use client'

import { useEffect } from 'react'
import { agentLog } from '@/lib/debug/agent-log'

/** Sonda de runtime mobile — montada no shell quando navegação está ativa */
export function MobileDebugProbe() {
  useEffect(() => {
    const registrar = () => {
    const dockRoot = document.getElementById('app-dock-root')
    const dockNav = document.querySelector('[data-testid="app-tab-bar"]')
    const dockRect = dockNav?.getBoundingClientRect()
    const rootStyles = dockRoot ? getComputedStyle(dockRoot) : null
    const navStyles = dockNav ? getComputedStyle(dockNav) : null
    const mqDesktop = window.matchMedia('(min-width: 1024px)').matches

    // #region agent log
    agentLog({
      location: 'mobile-debug-probe.tsx:mount',
      message: 'Sonda mobile pós-mount',
      hypothesisId: 'H2-H3-H5',
      runId: 'post-fix',
      data: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        mqDesktop,
        dockRootExists: Boolean(dockRoot),
        dockRootDisplay: rootStyles?.display ?? null,
        dockNavExists: Boolean(dockNav),
        dockRect: dockRect
          ? { top: dockRect.top, left: dockRect.left, width: dockRect.width, height: dockRect.height }
          : null,
        navDisplay: navStyles?.display ?? null,
        navVisibility: navStyles?.visibility ?? null,
        navOpacity: navStyles?.opacity ?? null,
        navZIndex: navStyles?.zIndex ?? null,
        userAgent: navigator.userAgent.slice(0, 80),
        standalone: Boolean(
          (navigator as Navigator & { standalone?: boolean }).standalone
        ),
      },
    })
    // #endregion
    }

    requestAnimationFrame(() => requestAnimationFrame(registrar))

    const onError = (event: ErrorEvent) => {
      // #region agent log
      agentLog({
        location: 'mobile-debug-probe.tsx:onerror',
        message: 'Erro global no client',
        hypothesisId: 'H4-H10',
        runId: 'post-fix-4',
        data: { message: event.message, filename: event.filename, lineno: event.lineno },
      })
      // #endregion
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      const motivo = event.reason
      const msg = motivo instanceof Error ? motivo.message : String(motivo)
      // #region agent log
      agentLog({
        location: 'mobile-debug-probe.tsx:unhandledrejection',
        message: 'Promise rejeitada no client',
        hypothesisId: 'H10',
        runId: 'post-fix-4',
        data: { message: msg },
      })
      // #endregion
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}

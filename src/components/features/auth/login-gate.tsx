'use client'

import { useSyncExternalStore } from 'react'
import { WifiOff } from 'lucide-react'

function subscribeOnlineStatus(onStoreChange: () => void) {
  window.addEventListener('online', onStoreChange)
  window.addEventListener('offline', onStoreChange)
  return () => {
    window.removeEventListener('online', onStoreChange)
    window.removeEventListener('offline', onStoreChange)
  }
}

function getOnlineSnapshot() {
  return navigator.onLine
}

/** SSR e hidratação assumem online; após mount reflete navigator.onLine */
function getOnlineServerSnapshot() {
  return true
}

/**
 * Gate de abertura — internet obrigatória no login.
 * useSyncExternalStore evita hydration mismatch entre SSR e client.
 */
export function LoginGate({ children }: { children: React.ReactNode }) {
  const online = useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  )

  if (!online) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4 p-6"
        data-testid="login-gate-offline"
      >
        <WifiOff className="w-12 h-12 text-amber-500" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold">Sem conexão com a internet</h1>
        <p className="text-zinc-500 text-center max-w-md">
          Conecte-se à internet para abrir ou entrar no sistema.
          Após o login, o sistema continua funcionando se a conexão cair.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

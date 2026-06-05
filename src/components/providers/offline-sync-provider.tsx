'use client'

import { useCallback, useEffect } from 'react'
import { isSupabaseDataSourceClient } from '@/lib/data-source/client'
import { executarSync } from '@/lib/offline/outbox-executor'
import { countPending } from '@/lib/offline/outbox'
import { useSyncStatusStore, type SyncStatus } from '@/stores/sync-status-store'

function getNetworkStatus(): SyncStatus {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline'
  return 'online'
}

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const { setStatus, setPendentes } = useSyncStatusStore()

  const sync = useCallback(async () => {
    const pendentesCount = await countPending()
    setPendentes(pendentesCount)

    if (!navigator.onLine) {
      setStatus('offline')
      return
    }

    if (!isSupabaseDataSourceClient()) {
      setStatus('online')
      return
    }

    if (pendentesCount === 0) {
      setStatus('online')
      return
    }

    setStatus('sincronizando')

    try {
      await executarSync()
      const restantes = await countPending()
      setPendentes(restantes)
      setStatus(restantes > 0 ? 'erro' : 'online')
    } catch (error) {
      console.error('[OfflineSyncProvider.sync]', error)
      setStatus('erro')
    }
  }, [setPendentes, setStatus])

  useEffect(() => {
    setStatus(getNetworkStatus())

    const handleOnline = () => {
      setStatus('online')
      sync()
    }
    const handleOffline = () => setStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    sync()

    const interval = setInterval(() => {
      if (navigator.onLine) sync()
    }, 30_000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [sync, setStatus])

  return <>{children}</>
}

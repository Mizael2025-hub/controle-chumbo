'use client'

import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useSyncStatusStore } from '@/stores/sync-status-store'
import { cn } from '@/lib/utils/cn'

const STATUS_CONFIG = {
  online: {
    icon: Wifi,
    label: 'Online',
    className: 'text-apple-green',
  },
  sincronizando: {
    icon: RefreshCw,
    label: 'Sincronizando...',
    className: 'text-apple-blue',
    spin: true,
  },
  offline: {
    icon: WifiOff,
    label: 'Offline',
    className: 'text-amber-500',
  },
  erro: {
    icon: AlertCircle,
    label: 'Erro de sincronização',
    className: 'text-apple-red',
  },
} as const

export function HeaderSyncStatus() {
  const { status, pendentes } = useSyncStatusStore()
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  const label =
    status === 'offline' && pendentes > 0
      ? `Offline · ${pendentes} pendente(s)`
      : status === 'sincronizando' && pendentes > 0
        ? `Sincronizando... (${pendentes})`
        : config.label

  return (
    <div
      className={cn('flex items-center gap-1.5 text-sm font-medium', config.className)}
      data-testid="sync-status"
    >
      <Icon
        className={cn('w-5 h-5', 'spin' in config && config.spin && 'animate-spin')}
        strokeWidth={1.5}
      />
      <span className="hidden sm:inline">{label}</span>
    </div>
  )
}

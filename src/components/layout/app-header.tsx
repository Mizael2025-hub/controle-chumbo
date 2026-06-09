'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { HeaderSyncStatus } from '@/components/layout/header-sync-status'

export function AppHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="lg:hidden sticky top-0 h-14 w-full apple-blur border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between px-4 z-50 shrink-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {!isHome ? (
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-apple-blue min-h-[44px] shrink-0"
            data-testid="link-inicio-header"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Início
          </Link>
        ) : (
          <h1 className="font-semibold text-lg truncate">Controle de Chumbo</h1>
        )}
      </div>
      <HeaderSyncStatus />
    </header>
  )
}

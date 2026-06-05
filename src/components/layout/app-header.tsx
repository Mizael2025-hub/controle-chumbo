import { HeaderSyncStatus } from '@/components/layout/header-sync-status'

export function AppHeader() {
  return (
    <header className="sticky top-0 h-14 w-full apple-blur border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between px-4 z-50 shrink-0">
      <h1 className="font-semibold text-lg">Controle de Chumbo</h1>
      <HeaderSyncStatus />
    </header>
  )
}

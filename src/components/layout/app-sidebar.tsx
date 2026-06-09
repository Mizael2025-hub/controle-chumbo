'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { HeaderSyncStatus } from '@/components/layout/header-sync-status'
import { NavAddMenu } from '@/components/layout/nav-add-menu'
import { NAV_ITENS_PRINCIPAIS } from '@/lib/navigation/nav-config'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { cn } from '@/lib/utils/cn'

type Props = {
  role: UsuarioRole | null
}

function classeItemNav(ativo: boolean) {
  return cn(
    'apple-pressable flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium transition-colors',
    ativo ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
  )
}

export function AppSidebar({ role }: Props) {
  const pathname = usePathname()
  const [menuAberto, setMenuAberto] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const itensAntesAdicionar = NAV_ITENS_PRINCIPAIS.slice(0, 2)
  const itensDepoisAdicionar = NAV_ITENS_PRINCIPAIS.slice(2)

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[240px] flex-col bg-nav-sidebar text-white"
      data-testid="app-sidebar"
    >
      <div className="shrink-0 px-5 py-6 border-b border-white/10">
        <p className="text-lg font-semibold tracking-tight">Controle de Chumbo</p>
      </div>

      <nav
        className="flex flex-col gap-1 px-3 py-4 overflow-y-auto"
        aria-label="Navegação principal"
      >
        {itensAntesAdicionar.map((item) => {
          const ativo = item.match(pathname)
          const Icone = item.icone
          return (
            <Link
              key={item.id}
              href={item.href}
              className={classeItemNav(ativo)}
              data-testid={`nav-${item.id}`}
            >
              <Icone className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span>{item.rotuloWeb}</span>
            </Link>
          )
        })}

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          className="apple-pressable flex w-full items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium text-white hover:bg-white/10"
          aria-expanded={menuAberto}
          aria-haspopup="menu"
          data-testid="nav-add-btn"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-nav-sidebar shadow-sm">
            {menuAberto ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Plus className="h-5 w-5" strokeWidth={2} />
            )}
          </span>
          <span>Adicionar novo</span>
        </button>

        {itensDepoisAdicionar.map((item) => {
          const ativo = item.match(pathname)
          const Icone = item.icone
          return (
            <Link
              key={item.id}
              href={item.href}
              className={classeItemNav(ativo)}
              data-testid={`nav-${item.id}`}
            >
              <Icone className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span>{item.rotuloWeb}</span>
            </Link>
          )
        })}
      </nav>

      <NavAddMenu
        role={role}
        aberto={menuAberto}
        onAbertoChange={setMenuAberto}
        variante="web"
        triggerRef={triggerRef}
      />

      <div className="shrink-0 border-t border-white/10 px-4 py-4 text-white/90">
        <HeaderSyncStatus />
      </div>
    </aside>
  )
}

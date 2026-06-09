'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { agentLog } from '@/lib/debug/agent-log'
import { NavAddMenu } from '@/components/layout/nav-add-menu'
import { NAV_ITENS_PRINCIPAIS } from '@/lib/navigation/nav-config'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { cn } from '@/lib/utils/cn'

type Props = {
  role: UsuarioRole | null
}

const DEBOUNCE_TOQUE_MS = 350

export function AppTabBar({ role }: Props) {
  const pathname = usePathname()
  const [menuAberto, setMenuAberto] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const ultimoToqueRef = useRef(0)

  const itensAntes = NAV_ITENS_PRINCIPAIS.slice(0, 2)
  const itensDepois = NAV_ITENS_PRINCIPAIS.slice(2)

  const alternarMenu = useCallback(() => {
    const agora = Date.now()
    if (agora - ultimoToqueRef.current < DEBOUNCE_TOQUE_MS) return
    ultimoToqueRef.current = agora

    setMenuAberto((v) => {
      const proximo = !v
      // #region agent log
      agentLog({
        location: 'app-tab-bar.tsx:alternarMenu',
        message: 'Botão + acionado',
        hypothesisId: 'H8-H9',
        runId: 'post-fix-3',
        data: { proximo, role },
      })
      // #endregion
      return proximo
    })
  }, [role])

  useEffect(() => {
    const btn = triggerRef.current
    if (!btn) return

    const registrarToque = (tipo: string) => {
      // #region agent log
      agentLog({
        location: 'app-tab-bar.tsx:touch-raw',
        message: `Evento ${tipo} no botão +`,
        hypothesisId: 'H8',
        runId: 'post-fix-3',
        data: { tipo, menuAberto },
      })
      // #endregion
    }

    const onTouchStart = () => registrarToque('touchstart')
    const onPointerDown = () => registrarToque('pointerdown')

    btn.addEventListener('touchstart', onTouchStart, { passive: true })
    btn.addEventListener('pointerdown', onPointerDown)

    return () => {
      btn.removeEventListener('touchstart', onTouchStart)
      btn.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuAberto, pathname])

  useEffect(() => {
    const medir = () => {
      const el = navRef.current
      const btn = triggerRef.current
      const rect = el?.getBoundingClientRect()
      const btnRect = btn?.getBoundingClientRect()
      const centroX = btnRect ? btnRect.left + btnRect.width / 2 : 0
      const centroY = btnRect ? btnRect.top + btnRect.height / 2 : 0
      const alvo = typeof document !== 'undefined' ? document.elementFromPoint(centroX, centroY) : null

      // #region agent log
      agentLog({
        location: 'app-tab-bar.tsx:hit-test',
        message: 'Elemento no centro do botão +',
        hypothesisId: 'H8',
        runId: 'post-fix-3',
        data: {
          navExists: Boolean(el),
          btnExists: Boolean(btn),
          alvoTag: alvo?.tagName ?? null,
          alvoTestId: alvo?.getAttribute('data-testid') ?? null,
          alvoEhBotao: alvo === btn || btn?.contains(alvo ?? null),
          rect: rect
            ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
            : null,
        },
      })
      // #endregion
    }
    requestAnimationFrame(() => requestAnimationFrame(medir))
  }, [role, pathname, menuAberto])

  return (
    <>
      <nav
        ref={navRef}
        className="app-dock-mobile"
        aria-label="Navegação inferior"
        data-testid="app-tab-bar"
      >
        <div className="flex w-full items-center justify-around px-2 py-2 pb-safe min-h-[56px]">
          {itensAntes.map((item) => {
            const ativo = item.match(pathname)
            const Icone = item.icone
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'apple-pressable flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-0 px-1 py-1 text-[11px] font-medium touch-manipulation',
                  ativo ? 'app-dock-item-ativo' : 'app-dock-item-inativo'
                )}
                data-testid={`nav-${item.id}`}
              >
                <Icone className="h-5 w-5 shrink-0" strokeWidth={ativo ? 2 : 1.5} />
                <span className="truncate w-full text-center leading-tight">
                  {item.rotuloMobile === 'Página Principal' ? 'Início' : item.rotuloMobile}
                </span>
              </Link>
            )
          })}

          <div className="flex flex-1 flex-col items-center justify-center">
            <button
              ref={triggerRef}
              type="button"
              onPointerUp={(e) => {
                if (e.pointerType === 'touch') {
                  e.preventDefault()
                  alternarMenu()
                }
              }}
              onClick={alternarMenu}
              className="apple-pressable flex h-12 w-12 items-center justify-center rounded-full bg-nav-sidebar text-white shadow-md touch-manipulation"
              aria-expanded={menuAberto}
              aria-haspopup="menu"
              aria-label="Adicionar novo"
              data-testid="nav-add-btn"
            >
              {menuAberto ? (
                <X className="h-5 w-5 pointer-events-none" strokeWidth={2} />
              ) : (
                <Plus className="h-5 w-5 pointer-events-none" strokeWidth={2} />
              )}
            </button>
          </div>

          {itensDepois.map((item) => {
            const ativo = item.match(pathname)
            const Icone = item.icone
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'apple-pressable flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-0 px-1 py-1 text-[11px] font-medium touch-manipulation',
                  ativo ? 'app-dock-item-ativo' : 'app-dock-item-inativo'
                )}
                data-testid={`nav-${item.id}`}
              >
                <Icone className="h-5 w-5 shrink-0" strokeWidth={ativo ? 2 : 1.5} />
                <span className="truncate w-full text-center leading-tight">{item.rotuloMobile}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <NavAddMenu
        role={role}
        aberto={menuAberto}
        onAbertoChange={setMenuAberto}
        variante="mobile"
        triggerRef={triggerRef}
      />
    </>
  )
}

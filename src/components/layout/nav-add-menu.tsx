'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { agentLog } from '@/lib/debug/agent-log'
import { filtrarItensAdicionar } from '@/lib/navigation/nav-config'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { cn } from '@/lib/utils/cn'

type Props = {
  role: UsuarioRole | null
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  variante: 'web' | 'mobile'
  triggerRef: RefObject<HTMLButtonElement | null>
}

type PosicaoWeb = {
  top: number
  left: number
}

function ListaItensMenu({
  itens,
  onFechar,
}: {
  itens: ReturnType<typeof filtrarItensAdicionar>
  onFechar: () => void
}) {
  return (
    <>
      {itens.map((item) => {
        const Icone = item.icone
        return (
          <li key={item.id} role="none">
            <Link
              href={item.href}
              role="menuitem"
              onClick={onFechar}
              className="apple-pressable flex items-center gap-3 px-4 py-3 min-h-[44px] hover:bg-zinc-50 dark:hover:bg-zinc-800"
              data-testid={`nav-add-${item.id}`}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white',
                  item.corIcone
                )}
              >
                <Icone className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="text-sm font-medium">{item.rotulo}</span>
            </Link>
          </li>
        )
      })}
    </>
  )
}

function MenuMobile({
  itens,
  onFechar,
  menuRef,
}: {
  itens: ReturnType<typeof filtrarItensAdicionar>
  onFechar: () => void
  menuRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        className="fixed inset-0 z-mobile-modal modal-overlay-backdrop touch-manipulation"
        onClick={onFechar}
        data-testid="nav-add-overlay"
      />
      <div
        ref={menuRef}
        className="fixed left-1/2 z-mobile-modal-nested w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 touch-manipulation"
        style={{ bottom: 'var(--dock-reserva)' }}
        data-testid="nav-add-menu-mobile"
      >
        <ul
          role="menu"
          className="rounded-2xl shadow-xl py-2 mobile-nav-add-menu"
        >
          <ListaItensMenu itens={itens} onFechar={onFechar} />
        </ul>
        <div
          className="mx-auto h-0 w-0 border-x-8 border-x-transparent border-t-8 mobile-nav-add-arrow"
          aria-hidden
        />
      </div>
    </>
  )
}

export function NavAddMenu({ role, aberto, onAbertoChange, variante, triggerRef }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [posicaoWeb, setPosicaoWeb] = useState<PosicaoWeb | null>(null)
  const itens = filtrarItensAdicionar(role)

  useEffect(() => {
    if (!aberto) return
    const medir = () => {
      const overlay = document.querySelector('[data-testid="nav-add-overlay"]')
      const painel = menuRef.current
      const overlayRect = overlay?.getBoundingClientRect()
      const painelRect = painel?.getBoundingClientRect()
      // #region agent log
      agentLog({
        location: 'nav-add-menu.tsx:aberto',
        message: 'Menu + aberto',
        hypothesisId: 'H15',
        runId: 'post-fix-4',
        data: {
          variante,
          qtdItens: itens.length,
          innerWidth: window.innerWidth,
          overlayExists: Boolean(overlay),
          painelExists: Boolean(painel),
          overlayRect: overlayRect
            ? { top: overlayRect.top, height: overlayRect.height, width: overlayRect.width }
            : null,
          painelRect: painelRect
            ? { top: painelRect.top, bottom: painelRect.bottom, height: painelRect.height }
            : null,
          portalNoBody: overlay?.parentElement === document.body,
        },
      })
      // #endregion
    }
    requestAnimationFrame(() => requestAnimationFrame(medir))
  }, [aberto, variante, itens.length])

  useEffect(() => {
    if (!aberto || variante !== 'web' || !triggerRef.current) {
      setPosicaoWeb(null)
      return
    }

    const atualizarPosicao = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosicaoWeb({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      })
    }

    atualizarPosicao()
    window.addEventListener('resize', atualizarPosicao)
    window.addEventListener('scroll', atualizarPosicao, true)
    return () => {
      window.removeEventListener('resize', atualizarPosicao)
      window.removeEventListener('scroll', atualizarPosicao, true)
    }
  }, [aberto, variante, triggerRef])

  useEffect(() => {
    if (!aberto || variante !== 'web') return

    const fechar = (e: PointerEvent) => {
      const alvo = e.target as Node
      if (menuRef.current?.contains(alvo)) return
      if (triggerRef.current?.contains(alvo)) return
      onAbertoChange(false)
    }

    const timer = window.setTimeout(() => {
      document.addEventListener('pointerdown', fechar, true)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', fechar, true)
    }
  }, [aberto, onAbertoChange, triggerRef, variante])

  if (!aberto) return null

  const fechar = () => onAbertoChange(false)

  if (variante === 'mobile') {
    if (typeof document === 'undefined') return null
    return createPortal(
      <MenuMobile itens={itens} onFechar={fechar} menuRef={menuRef} />,
      document.body
    )
  }

  if (!posicaoWeb || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[70] -translate-y-1/2"
      style={{ top: posicaoWeb.top, left: posicaoWeb.left }}
      data-testid="nav-add-menu-web"
    >
      <ul
        role="menu"
        className="min-w-[220px] rounded-ios-card border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-2"
      >
        <ListaItensMenu itens={itens} onFechar={fechar} />
      </ul>
    </div>,
    document.body
  )
}

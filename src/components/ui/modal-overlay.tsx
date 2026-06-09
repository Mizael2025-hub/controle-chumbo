'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'

type Props = {
  aberto: boolean
  children: ReactNode
  /** base = z-200; nested = z-210 (cascata sobre outro modal) */
  nivel?: 'base' | 'nested'
  /** sheet = bottom sheet no mobile; dialog = centralizado */
  variante?: 'sheet' | 'dialog'
}

let overlaysAbertos = 0

function travarScrollBody(): void {
  overlaysAbertos += 1
  if (overlaysAbertos === 1) {
    document.body.style.overflow = 'hidden'
  }
}

function destravarScrollBody(): void {
  overlaysAbertos = Math.max(0, overlaysAbertos - 1)
  if (overlaysAbertos === 0) {
    document.body.style.overflow = ''
  }
}

type ConteudoProps = {
  children: ReactNode
  nivel: 'base' | 'nested'
  variante: 'sheet' | 'dialog'
}

function ModalOverlayConteudo({ children, nivel, variante }: ConteudoProps) {
  useEffect(() => {
    travarScrollBody()
    return () => destravarScrollBody()
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-0 flex justify-center touch-manipulation overflow-y-auto modal-overlay-mobile p-4',
        nivel === 'nested' ? 'z-mobile-modal-nested modal-overlay-backdrop-nested' : 'z-mobile-modal modal-overlay-backdrop',
        variante === 'sheet' && 'modal-overlay-sheet'
      )}
      role="presentation"
    >
      {children}
    </div>
  )
}

/**
 * Modal em portal no body — evita que overflow do main quebre position:fixed no iOS.
 * Reserva espaço da dock no mobile (pb = --dock-reserva).
 */
export function ModalOverlay({
  aberto,
  children,
  nivel = 'base',
  variante = 'dialog',
}: Props) {
  if (!aberto || typeof document === 'undefined') return null

  return createPortal(
    <ModalOverlayConteudo nivel={nivel} variante={variante}>
      {children}
    </ModalOverlayConteudo>,
    document.body
  )
}

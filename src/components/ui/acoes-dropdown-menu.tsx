'use client'

import { ChevronUp, MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type ItemMenuAcao = {
  id: string
  rotulo: string
  icone?: ReactNode
  onClick: () => void
  desabilitado?: boolean
}

type PosicaoMenu = {
  bottom: number
  right: number
  minWidth: number
}

type Props = {
  itens: ItemMenuAcao[]
  rotuloBotao?: string
}

const ESTILO_PAINEL: CSSProperties = {
  backgroundColor: '#3f3f46',
  color: '#ffffff',
  border: '1px solid #52525b',
}

const ESTILO_ITEM: CSSProperties = {
  color: '#ffffff',
  backgroundColor: 'transparent',
  WebkitAppearance: 'none',
  appearance: 'none',
}

export function AcoesDropdownMenu({ itens, rotuloBotao = 'Ações' }: Props) {
  const [aberto, setAberto] = useState(false)
  const [posicao, setPosicao] = useState<PosicaoMenu | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return

    const atualizarPosicao = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setPosicao({
        bottom: window.innerHeight - rect.top + 8,
        right: Math.max(8, window.innerWidth - rect.right),
        minWidth: Math.min(280, Math.max(220, rect.width)),
      })
    }

    atualizarPosicao()
    window.addEventListener('resize', atualizarPosicao)
    window.addEventListener('scroll', atualizarPosicao, true)

    return () => {
      window.removeEventListener('resize', atualizarPosicao)
      window.removeEventListener('scroll', atualizarPosicao, true)
    }
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    const fechar = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return
      const painel = document.querySelector('[data-testid="acoes-dropdown-menu"]')
      if (painel?.contains(e.target as Node)) return
      setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [aberto])

  const menuPortal =
    aberto && posicao && typeof document !== 'undefined'
      ? createPortal(
          <ul
            role="menu"
            className="acoes-dropdown-menu rounded-ios-card shadow-xl py-1"
            style={{
              ...ESTILO_PAINEL,
              position: 'fixed',
              bottom: posicao.bottom,
              right: posicao.right,
              minWidth: posicao.minWidth,
              maxWidth: 'min(280px, calc(100vw - 2rem))',
              zIndex: 120,
            }}
            data-testid="acoes-dropdown-menu"
          >
            {itens.map((item) => (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.desabilitado}
                  onClick={() => {
                    setAberto(false)
                    item.onClick()
                  }}
                  className="acoes-dropdown-item apple-pressable w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium min-h-[44px] disabled:opacity-40"
                  style={ESTILO_ITEM}
                  data-testid={`menu-acao-${item.id}`}
                >
                  <span className="flex shrink-0 items-center text-white [&_svg]:text-white">
                    {item.icone}
                  </span>
                  <span className="text-white">{item.rotulo}</span>
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="apple-pressable inline-flex items-center gap-1.5 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px] text-sm"
        aria-expanded={aberto}
        aria-haspopup="menu"
        data-testid="btn-acoes-dropdown"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        {rotuloBotao}
        <ChevronUp
          className={`h-4 w-4 transition-transform ${aberto ? '' : 'rotate-180'}`}
          strokeWidth={1.5}
        />
      </button>
      {menuPortal}
    </div>
  )
}

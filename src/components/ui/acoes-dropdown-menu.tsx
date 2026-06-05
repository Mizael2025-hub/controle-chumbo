'use client'

import { ChevronUp, MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type ItemMenuAcao = {
  id: string
  rotulo: string
  icone?: ReactNode
  onClick: () => void
  desabilitado?: boolean
}

type Props = {
  itens: ItemMenuAcao[]
  rotuloBotao?: string
}

export function AcoesDropdownMenu({ itens, rotuloBotao = 'Ações' }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const fechar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [aberto])

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

      {aberto && (
        <ul
          role="menu"
          className="absolute bottom-full right-0 mb-2 min-w-[220px] max-w-[min(280px,calc(100vw-2rem))] rounded-ios-card border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-1 z-50"
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
                className="apple-pressable w-full flex items-center gap-2 px-4 py-3 text-left text-sm min-h-[44px] hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                data-testid={`menu-acao-${item.id}`}
              >
                {item.icone}
                <span>{item.rotulo}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

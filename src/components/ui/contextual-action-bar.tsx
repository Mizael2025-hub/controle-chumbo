'use client'

import type { ReactNode } from 'react'

type Props = {
  visible: boolean
  selectedCount: number
  onClear: () => void
  children?: ReactNode
}

function rotuloSelecao(count: number): string {
  if (count === 1) return '1 selecionado'
  return `${count} selecionados`
}

export function ContextualActionBar({ visible, selectedCount, onClear, children }: Props) {
  return (
    <div
      role="toolbar"
      aria-hidden={!visible}
      aria-label="Ações da seleção"
      data-testid="contextual-action-bar"
      className={`fixed contextual-bar-mobile lg:bottom-4 left-1/2 lg:z-[60] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl shadow-lg transition-all duration-200 ease-out mobile-contextual-bar ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2 pb-safe">
        <button
          type="button"
          onClick={onClear}
          disabled={!visible}
          className="contextual-bar-clear-btn apple-pressable shrink-0 px-3 text-sm font-medium min-h-[44px] rounded-ios-btn hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-0"
          data-testid="contextual-action-clear"
        >
          Limpar seleção
        </button>

        <p className="contextual-bar-count flex-1 min-w-0 text-xs font-medium text-center tabular-nums">
          {rotuloSelecao(selectedCount)}
        </p>

        <div className="relative shrink-0 flex items-center">{children}</div>
      </div>
    </div>
  )
}

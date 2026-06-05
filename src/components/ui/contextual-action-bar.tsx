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
      className={`fixed bottom-4 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 apple-blur bg-white/85 dark:bg-zinc-900/80 shadow-lg transition-all duration-200 ease-out ${
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
          className="apple-pressable shrink-0 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 min-h-[44px] rounded-ios-btn hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-0"
          data-testid="contextual-action-clear"
        >
          Limpar seleção
        </button>

        <p className="flex-1 min-w-0 text-xs font-medium text-center text-zinc-500 tabular-nums">
          {rotuloSelecao(selectedCount)}
        </p>

        <div className="relative shrink-0 flex items-center">{children}</div>
      </div>
    </div>
  )
}

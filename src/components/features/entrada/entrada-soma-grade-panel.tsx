'use client'

import type { SomaGradeEntrada } from '@/lib/entrada/validar-grade-entrada'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'

type Props = {
  somaOperacional: SomaGradeEntrada
  celulasPreenchidas: number
}

export function EntradaSomaGradePanel({ somaOperacional, celulasPreenchidas }: Props) {
  return (
    <div
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card"
      data-testid="entrada-soma-grade-panel"
    >
      <h2 className="text-sm font-semibold">Totais da grade</h2>
      <p className="text-xs text-zinc-500 mt-0.5 mb-3">
        A soma atualiza ao preencher cada pilha. Confira com a nota fiscal fora do sistema e ajuste
        depois se precisar.
      </p>
      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
        <span className="text-xs text-zinc-500 block">Soma das pilhas</span>
        <p className="text-xl font-semibold tabular-nums mt-1" data-testid="soma-operacional-kg">
          {formatarKg(somaOperacional.peso_kg)}
        </p>
        <p
          className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400 mt-0.5"
          data-testid="soma-operacional-barras"
        >
          {formatarNumeroPtBr(somaOperacional.barras)} barras · {celulasPreenchidas} pilha(s)
        </p>
      </div>
      {celulasPreenchidas === 0 && (
        <p className="text-xs text-zinc-500 mt-3">Preencha ao menos uma célula na grade.</p>
      )}
    </div>
  )
}

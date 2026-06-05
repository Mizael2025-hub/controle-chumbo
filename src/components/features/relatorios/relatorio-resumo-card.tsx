'use client'

import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'

type Props = {
  totalPesoKg: number
  totalBarras: number
}

export function RelatorioResumoCard({ totalPesoKg, totalBarras }: Props) {
  return (
    <div
      className="mb-4 grid grid-cols-2 gap-3"
      data-testid="relatorio-resumo-card"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-ios-card p-4">
        <p className="text-xs text-zinc-500 mb-1">Peso total</p>
        <p className="text-lg font-semibold tabular-nums">{formatarKg(totalPesoKg)}</p>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-ios-card p-4">
        <p className="text-xs text-zinc-500 mb-1">Barras total</p>
        <p className="text-lg font-semibold tabular-nums">
          {formatarNumeroPtBr(totalBarras)} barras
        </p>
      </div>
    </div>
  )
}

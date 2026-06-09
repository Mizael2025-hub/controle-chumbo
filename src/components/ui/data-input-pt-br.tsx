'use client'

import { Calendar } from 'lucide-react'
import {
  dataHojeInputIso,
  dataInputIsoParaPtBr,
  dataPtBrParaInputIso,
} from '@/lib/utils/date-time'

type Props = {
  id?: string
  value: string
  onChange: (valorPtBr: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
  /** yyyy-MM-dd — padrão: hoje (impede datas futuras em entrada/consumo/contagem). */
  max?: string
  min?: string
  impedeDataFutura?: boolean
  'data-testid'?: string
  'aria-invalid'?: boolean
}

const CLASSE_BASE =
  'form-field px-3 py-2 pr-10 border border-zinc-300 dark:border-zinc-700 rounded-ios-btn focus:outline-none focus:ring-2 focus:ring-apple-blue/50 text-[16px] min-h-[44px] tabular-nums bg-white dark:bg-zinc-900'

export function DataInputPtBr({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  className = '',
  max,
  min,
  impedeDataFutura = true,
  'data-testid': testId,
  'aria-invalid': ariaInvalid,
}: Props) {
  const isoValue = dataPtBrParaInputIso(value)
  const maxDate = impedeDataFutura ? (max ?? dataHojeInputIso()) : max

  return (
    <div className="relative w-full">
      <input
        id={id}
        type="date"
        lang="pt-BR"
        value={isoValue}
        min={min}
        max={maxDate}
        disabled={disabled}
        onBlur={onBlur}
        onChange={(e) => {
          const ptBr = dataInputIsoParaPtBr(e.target.value)
          onChange(ptBr)
        }}
        className={`${CLASSE_BASE} ${className}`.trim()}
        data-testid={testId}
        aria-invalid={ariaInvalid}
      />
      <Calendar
        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
        strokeWidth={1.5}
        aria-hidden
      />
      {value && (
        <p className="text-xs text-zinc-500 mt-1 tabular-nums" aria-live="polite">
          {value}
        </p>
      )}
    </div>
  )
}

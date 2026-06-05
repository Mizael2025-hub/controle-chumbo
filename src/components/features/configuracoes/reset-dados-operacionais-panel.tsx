'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { autorizarResetOperacionalAction } from '@/actions/reset-dados-operacionais-actions'
import { resetDadosOperacionaisLocal } from '@/lib/offline/reset-dados-operacionais'

const CONFIRMACAO = 'RESET'

export function ResetDadosOperacionaisPanel() {
  const [texto, setTexto] = useState('')

  const reset = useMutation({
    mutationFn: async () => {
      const auth = await autorizarResetOperacionalAction()
      if (!auth.success) throw new Error(auth.message)
      if (auth.data?.data_source !== 'local') {
        throw new Error(
          'Com DATA_SOURCE=supabase, execute o script SQL em supabase/scripts/reset_operacional_testes.sql.'
        )
      }
      await resetDadosOperacionaisLocal()
    },
    onSuccess: () => {
      toast.success('Dados operacionais removidos. Cadastros base preservados.')
      setTexto('')
      window.location.href = '/estoque'
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const podeConfirmar = texto.trim().toUpperCase() === CONFIRMACAO

  return (
    <section
      className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 p-4 rounded-ios-card"
      data-testid="reset-operacional-panel"
    >
      <h2 className="font-semibold text-lg text-amber-800 dark:text-amber-200">
        Reset operacional (testes)
      </h2>
      <p className="text-sm text-zinc-500 mt-1">
        Remove lotes, montes, consumo, histórico de saída e fila offline. Mantém ligas, setores,
        destinos, operadores, turnos e modelos de grade. Rascunhos de contagem física não são
        apagados.
      </p>
      <label className="block text-sm font-medium mt-4" htmlFor="confirm-reset">
        Digite {CONFIRMACAO} para confirmar
      </label>
      <input
        id="confirm-reset"
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="mt-1 w-full max-w-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-ios-btn text-[16px] min-h-[44px]"
        autoComplete="off"
        data-testid="input-confirm-reset"
      />
      <button
        type="button"
        disabled={!podeConfirmar || reset.isPending}
        onClick={() => reset.mutate()}
        className="apple-pressable mt-3 bg-amber-600 text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px] disabled:opacity-50"
        data-testid="btn-reset-operacional"
      >
        {reset.isPending ? 'Limpando…' : 'Limpar dados operacionais'}
      </button>
    </section>
  )
}

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { CelulaEntradaInput } from '@/validations/entrada/entrada-schema'

type FormValues = {
  peso_atual_kg: string
  barras_atuais: string
}

type Props = {
  posicaoX: number
  posicaoY: number
  valorInicial: CelulaEntradaInput | null
  onSalvar: (celula: CelulaEntradaInput) => void
  onLimpar: () => void
  onFechar: () => void
}

export function EntradaCelulaModal({
  posicaoX,
  posicaoY,
  valorInicial,
  onSalvar,
  onLimpar,
  onFechar,
}: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      peso_atual_kg: valorInicial ? String(valorInicial.peso_atual_kg) : '',
      barras_atuais: valorInicial ? String(valorInicial.barras_atuais) : '',
    },
  })

  useEffect(() => {
    form.reset({
      peso_atual_kg: valorInicial ? String(valorInicial.peso_atual_kg) : '',
      barras_atuais: valorInicial ? String(valorInicial.barras_atuais) : '',
    })
  }, [valorInicial, form])

  const handleSubmit = form.handleSubmit((values) => {
    const kg = Number(values.peso_atual_kg.replace(',', '.'))
    const barras = Number(values.barras_atuais)
    if (Number.isNaN(kg) || kg < 0) {
      form.setError('peso_atual_kg', { message: 'Peso inválido' })
      return
    }
    if (Number.isNaN(barras) || !Number.isInteger(barras) || barras < 0) {
      form.setError('barras_atuais', { message: 'Barras inválidas' })
      return
    }
    if (kg === 0 && barras === 0) {
      onLimpar()
      onFechar()
      return
    }
    onSalvar({
      posicao_x: posicaoX,
      posicao_y: posicaoY,
      peso_atual_kg: kg,
      barras_atuais: barras,
    })
    onFechar()
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 w-full sm:w-96 rounded-t-ios-modal sm:rounded-ios-card p-6 pb-safe">
        <h2 className="text-xl font-semibold mb-1">
          Célula {posicaoX + 1},{posicaoY + 1}
        </h2>
        <p className="text-sm text-zinc-500 mb-4">Informe peso (kg) e barras desta pilha.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Peso (kg)</label>
            <input
              {...form.register('peso_atual_kg')}
              inputMode="decimal"
              className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]"
              data-testid="input-celula-kg"
            />
            {form.formState.errors.peso_atual_kg && (
              <span className="text-[12px] text-apple-red">
                {form.formState.errors.peso_atual_kg.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Barras</label>
            <input
              {...form.register('barras_atuais')}
              inputMode="numeric"
              className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]"
              data-testid="input-celula-barras"
            />
            {form.formState.errors.barras_atuais && (
              <span className="text-[12px] text-apple-red">
                {form.formState.errors.barras_atuais.message}
              </span>
            )}
          </div>
          <div className="flex gap-2 modal-actions">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 bg-zinc-100 font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
            >
              Cancelar
            </button>
            {valorInicial && (
              <button
                type="button"
                onClick={() => {
                  onLimpar()
                  onFechar()
                }}
                className="flex-1 bg-zinc-200 font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
              >
                Limpar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
              data-testid="btn-salvar-celula"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

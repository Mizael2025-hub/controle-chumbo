'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ModalOverlay } from '@/components/ui/modal-overlay'
import {
  modalBtnCancelClass,
  modalBtnPrimaryClass,
  modalCardCompactClass,
  modalInputClass,
  modalLabelClass,
  modalSubtitleClass,
  modalTitleClass,
} from '@/components/ui/modal-ui-classes'
import { agentLog } from '@/lib/debug/agent-log'
import type { CelulaEntradaInput } from '@/validations/entrada/entrada-schema'

type FormValues = {
  peso_atual_kg: string
  barras_atuais: string
}

type Props = {
  aberto: boolean
  posicaoX: number
  posicaoY: number
  valorInicial: CelulaEntradaInput | null
  onSalvar: (celula: CelulaEntradaInput) => void
  onLimpar: () => void
  onFechar: () => void
}

export function EntradaCelulaModal({
  aberto,
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

  // Reseta o formulário sempre que o modal abre (aberto=true) ou o valorInicial muda.
  // Impede que valores de uma célula anterior persistam ao abrir uma célula vazia.
  useEffect(() => {
    if (!aberto) return
    form.reset({
      peso_atual_kg: valorInicial ? String(valorInicial.peso_atual_kg) : '',
      barras_atuais: valorInicial ? String(valorInicial.barras_atuais) : '',
    })
    // #region agent log
    requestAnimationFrame(() => {
      const card = document.querySelector('[data-testid="entrada-celula-modal-card"]')
      const btn = document.querySelector('[data-testid="btn-cancelar-celula"]')
      const input = document.querySelector('[data-testid="input-celula-kg"]')
      const titulo = document.querySelector('[data-testid="entrada-celula-titulo"]')
      const cardStyles = card ? getComputedStyle(card) : null
      const tituloStyles = titulo ? getComputedStyle(titulo) : null
      const btnStyles = btn ? getComputedStyle(btn) : null
      const inputStyles = input ? getComputedStyle(input) : null
      agentLog({
        location: 'entrada-celula-modal.tsx:aberto',
        message: 'Modal célula aberto — estilos computados',
        hypothesisId: 'H1-H2',
        runId: 'post-fix-v5',
        data: {
          posicaoX,
          posicaoY,
          temValorInicial: Boolean(valorInicial),
          prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
          cardClass: card?.className ?? null,
          cardBg: cardStyles?.backgroundColor ?? null,
          cardColor: cardStyles?.color ?? null,
          tituloColor: tituloStyles?.color ?? null,
          tituloVisivel: tituloStyles
            ? tituloStyles.color !== cardStyles?.color
            : null,
          btnBg: btnStyles?.backgroundColor ?? null,
          btnColor: btnStyles?.color ?? null,
          btnAppearance: btnStyles?.appearance ?? null,
          inputBg: inputStyles?.backgroundColor ?? null,
          inputBorder: inputStyles?.borderColor ?? null,
        },
      })
    })
    // #endregion
  }, [aberto, valorInicial, form, posicaoX, posicaoY])

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
    form.reset({ peso_atual_kg: '', barras_atuais: '' })
    onFechar()
  })

  return (
    <ModalOverlay aberto={aberto}>
      <div className={modalCardCompactClass} data-testid="entrada-celula-modal-card">
        <h2 className={modalTitleClass} data-testid="entrada-celula-titulo">
          Célula {posicaoX + 1},{posicaoY + 1}
        </h2>
        <p className={modalSubtitleClass}>Informe peso (kg) e barras desta pilha.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={modalLabelClass} htmlFor="input-celula-kg">
                Peso (kg)
              </label>
              <input
                id="input-celula-kg"
                {...form.register('peso_atual_kg')}
                inputMode="decimal"
                className={modalInputClass}
                data-testid="input-celula-kg"
              />
              {form.formState.errors.peso_atual_kg && (
                <span className="text-[12px] text-apple-red">
                  {form.formState.errors.peso_atual_kg.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className={modalLabelClass} htmlFor="input-celula-barras">
                Barras
              </label>
              <input
                id="input-celula-barras"
                {...form.register('barras_atuais')}
                inputMode="numeric"
                className={modalInputClass}
                data-testid="input-celula-barras"
              />
              {form.formState.errors.barras_atuais && (
                <span className="text-[12px] text-apple-red">
                  {form.formState.errors.barras_atuais.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 modal-actions">
            <button
              type="button"
              onClick={onFechar}
              className={modalBtnCancelClass}
              data-testid="btn-cancelar-celula"
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
                className={modalBtnCancelClass}
              >
                Limpar
              </button>
            )}
            <button
              type="submit"
              className={modalBtnPrimaryClass}
              data-testid="btn-salvar-celula"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}

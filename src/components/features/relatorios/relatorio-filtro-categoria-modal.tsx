'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { ROTULOS_DIMENSAO, type DimensaoFiltroRelatorio } from '@/lib/relatorio/filtros-relatorio'

type Props = {
  dimensao: DimensaoFiltroRelatorio
  opcoes: string[]
  selecionados: string[]
  onConfirmar: (valores: string[]) => void
  onFechar: () => void
}

export function RelatorioFiltroCategoriaModal({
  dimensao,
  opcoes,
  selecionados,
  onConfirmar,
  onFechar,
}: Props) {
  const [rascunho, setRascunho] = useState<string[]>(() => [...selecionados])

  const alternar = (valor: string) => {
    setRascunho((atual) =>
      atual.includes(valor) ? atual.filter((item) => item !== valor) : [...atual, valor]
    )
  }

  const opcoesVisiveis = [...new Set([...opcoes, ...rascunho])].sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  )

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      data-testid={`relatorio-filtro-categoria-${dimensao}`}
    >
      <button type="button" className="absolute inset-0" aria-label="Fechar" onClick={onFechar} />
      <div className="relative bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-ios-modal sm:rounded-ios-card p-6 pb-safe shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold">{ROTULOS_DIMENSAO[dimensao]}</h3>
            <p className="text-sm text-zinc-500 mt-1">Selecione um ou mais itens</p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {opcoesVisiveis.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4">Nenhuma opção disponível no período.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {opcoesVisiveis.map((opcao) => {
              const marcado = rascunho.includes(opcao)
              return (
                <li key={opcao}>
                  <button
                    type="button"
                    onClick={() => alternar(opcao)}
                    className={`apple-pressable w-full flex items-center justify-between gap-3 min-h-[44px] px-4 rounded-ios-btn border text-left text-sm ${
                      marcado
                        ? 'border-apple-blue bg-apple-blue/5'
                        : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                    data-testid={`relatorio-filtro-opcao-${dimensao}-${opcao}`}
                  >
                    <span className="font-medium">{opcao}</span>
                    {marcado && <Check className="h-4 w-4 text-apple-blue shrink-0" strokeWidth={2} />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-6 modal-actions">
          <button
            type="button"
            onClick={() => setRascunho([])}
            className="apple-pressable flex-1 min-h-[44px] rounded-ios-btn border border-zinc-200 dark:border-zinc-700 font-medium text-sm"
            data-testid={`btn-limpar-selecao-${dimensao}`}
          >
            Limpar seleção
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmar(rascunho)
              onFechar()
            }}
            className="apple-pressable flex-1 min-h-[44px] rounded-ios-btn bg-apple-blue text-white font-medium text-sm"
            data-testid={`btn-confirmar-${dimensao}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

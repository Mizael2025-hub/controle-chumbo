'use client'

import { useMemo, useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { RelatorioFiltroCategoriaModal } from '@/components/features/relatorios/relatorio-filtro-categoria-modal'
import { ModalOverlay } from '@/components/ui/modal-overlay'
import {
  DIMENSOES_POR_ABA,
  ROTULOS_DIMENSAO,
  calcularOpcoesCascata,
  normalizarLinhasParaFiltro,
  serializarValoresFiltroUrl,
  type DimensaoFiltroRelatorio,
  type RelatorioFiltrosAvancados,
} from '@/lib/relatorio/filtros-relatorio'
import {
  dataInputIsoParaPtBr,
  dataPtBrParaInputIso,
} from '@/lib/utils/date-time'
import type { RelatorioResultado } from '@/services/relatorio-service'
import type { AbaRelatorio } from '@/validations/relatorio/relatorio-schema'

export type RelatorioFiltrosAplicados = {
  de: string
  ate: string
  categorias: RelatorioFiltrosAvancados
}

type Props = {
  aba: AbaRelatorio
  de: string
  ate: string
  resultado: RelatorioResultado | undefined
  filtrosAtivos: RelatorioFiltrosAvancados
  onAplicar: (filtros: RelatorioFiltrosAplicados) => void
  onLimpar: () => void
  onFechar: () => void
}

export function RelatorioFiltrosSheet({
  aba,
  de,
  ate,
  resultado,
  filtrosAtivos,
  onAplicar,
  onLimpar,
  onFechar,
}: Props) {
  const [rascunhoDe, setRascunhoDe] = useState(de)
  const [rascunhoAte, setRascunhoAte] = useState(ate)
  const [rascunhoCategorias, setRascunhoCategorias] = useState<RelatorioFiltrosAvancados>(
    () => ({ ...filtrosAtivos })
  )
  const [categoriaAberta, setCategoriaAberta] = useState<DimensaoFiltroRelatorio | null>(null)

  const dimensoes = DIMENSOES_POR_ABA[aba]

  const itensNormalizados = useMemo(() => {
    if (!resultado) return []
    return normalizarLinhasParaFiltro(resultado.aba, resultado.linhas)
  }, [resultado])

  const opcoesCategoriaAberta = useMemo(() => {
    if (!categoriaAberta) return []
    return calcularOpcoesCascata(itensNormalizados, rascunhoCategorias, categoriaAberta)
  }, [categoriaAberta, itensNormalizados, rascunhoCategorias])

  const atualizarCategoria = (dim: DimensaoFiltroRelatorio, valores: string[]) => {
    setRascunhoCategorias((atual) => {
      const proximo = { ...atual }
      if (valores.length === 0) {
        delete proximo[dim]
      } else {
        proximo[dim] = valores
      }
      return proximo
    })
  }

  return (
    <>
      <ModalOverlay aberto variante="sheet">
        <button type="button" className="absolute inset-0" aria-label="Fechar" onClick={onFechar} />
        <div
          className="modal-card mobile-sheet-card"
          role="dialog"
          aria-modal="true"
          data-testid="relatorio-filtros-sheet"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Filtros</h3>
              <p className="text-sm text-zinc-500 mt-1">Período e critérios do relatório</p>
            </div>
            <button
              type="button"
              onClick={onFechar}
              className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Fechar painel"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="mb-5 p-4 border border-zinc-200 dark:border-zinc-800 rounded-ios-card">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 mb-3">
              <Calendar className="h-4 w-4" strokeWidth={1.5} />
              Período
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex flex-col gap-1 flex-1 text-sm">
                <span className="text-zinc-500">De</span>
                <input
                  type="date"
                  value={dataPtBrParaInputIso(rascunhoDe)}
                  onChange={(e) => setRascunhoDe(dataInputIsoParaPtBr(e.target.value))}
                  className="min-h-[44px] px-3 rounded-ios-btn border border-zinc-200 dark:border-zinc-700 bg-transparent"
                  data-testid="relatorio-filtro-de"
                />
              </label>
              <label className="flex flex-col gap-1 flex-1 text-sm">
                <span className="text-zinc-500">Até</span>
                <input
                  type="date"
                  value={dataPtBrParaInputIso(rascunhoAte)}
                  onChange={(e) => setRascunhoAte(dataInputIsoParaPtBr(e.target.value))}
                  className="min-h-[44px] px-3 rounded-ios-btn border border-zinc-200 dark:border-zinc-700 bg-transparent"
                  data-testid="relatorio-filtro-ate"
                />
              </label>
            </div>
          </div>

          {dimensoes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-3">Categorias</p>
              <div className="grid grid-cols-2 gap-2">
                {dimensoes.map((dim) => {
                  const qtd = rascunhoCategorias[dim]?.length ?? 0
                  return (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => setCategoriaAberta(dim)}
                      className="apple-pressable relative min-h-[44px] px-3 rounded-ios-btn border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-left"
                      data-testid={`btn-categoria-filtro-${dim}`}
                    >
                      {ROTULOS_DIMENSAO[dim]}
                      {qtd > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-apple-blue text-white text-[11px] font-semibold flex items-center justify-center">
                          {qtd}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mt-6 modal-actions">
            <button
              type="button"
              onClick={() => {
                onLimpar()
                onFechar()
              }}
              className="btn-modal-secondary text-sm"
              data-testid="btn-limpar-filtros-relatorio"
            >
              Limpar filtros
            </button>
            <button
              type="button"
              onClick={() => {
                onAplicar({
                  de: rascunhoDe,
                  ate: rascunhoAte,
                  categorias: rascunhoCategorias,
                })
                onFechar()
              }}
              className="apple-pressable flex-1 min-h-[44px] rounded-ios-btn bg-apple-blue text-white font-medium text-sm"
              data-testid="btn-aplicar-filtros-relatorio"
            >
              Aplicar
            </button>
          </div>
        </div>
      </ModalOverlay>

      {categoriaAberta && (
        <RelatorioFiltroCategoriaModal
          dimensao={categoriaAberta}
          opcoes={opcoesCategoriaAberta}
          selecionados={rascunhoCategorias[categoriaAberta] ?? []}
          onConfirmar={(valores) => atualizarCategoria(categoriaAberta, valores)}
          onFechar={() => setCategoriaAberta(null)}
        />
      )}
    </>
  )
}

export function categoriasParaConsultaUrl(
  categorias: RelatorioFiltrosAvancados
): Record<DimensaoFiltroRelatorio, string> {
  return {
    setor: serializarValoresFiltroUrl(categorias.setor),
    destino: serializarValoresFiltroUrl(categorias.destino),
    maquina: serializarValoresFiltroUrl(categorias.maquina),
    operador: serializarValoresFiltroUrl(categorias.operador),
    liga: serializarValoresFiltroUrl(categorias.liga),
    turno: serializarValoresFiltroUrl(categorias.turno),
  }
}

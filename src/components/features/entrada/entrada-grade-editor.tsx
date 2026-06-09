'use client'

import { useMemo, useState } from 'react'
import { GradeScrollContainer } from '@/components/features/estoque/grade-scroll-container'
import { EntradaCelulaModal } from '@/components/features/entrada/entrada-celula-modal'
import {
  CHAVE_COR_CLASSES,
  isChaveCorLiga,
  type ChaveCorLiga,
} from '@/lib/types/chave-cor-liga'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'
import type { CelulaEntradaInput } from '@/validations/entrada/entrada-schema'

type Props = {
  colunas: number
  linhas: number
  chaveCorLiga: string
  celulas: Map<string, CelulaEntradaInput>
  onCelulasChange: (celulas: Map<string, CelulaEntradaInput>) => void
}

export function EntradaGradeEditor({
  colunas,
  linhas,
  chaveCorLiga,
  celulas,
  onCelulasChange,
}: Props) {
  const [celulaEditando, setCelulaEditando] = useState<{
    x: number
    y: number
  } | null>(null)

  const corFundo = isChaveCorLiga(chaveCorLiga)
    ? CHAVE_COR_CLASSES[chaveCorLiga as ChaveCorLiga]
    : 'bg-zinc-300'
  const textoEscuro =
    chaveCorLiga === 'branco' || chaveCorLiga === 'amarelo' || chaveCorLiga === 'sem_cor'

  const linhasArr = useMemo(() => Array.from({ length: linhas }, (_, y) => y), [linhas])
  const colunasArr = useMemo(() => Array.from({ length: colunas }, (_, x) => x), [colunas])

  const atualizarCelula = (celula: CelulaEntradaInput) => {
    const next = new Map(celulas)
    next.set(`${celula.posicao_x}-${celula.posicao_y}`, celula)
    onCelulasChange(next)
  }

  const limparCelula = (x: number, y: number) => {
    const next = new Map(celulas)
    next.delete(`${x}-${y}`)
    onCelulasChange(next)
  }

  return (
    <>
      <p className="text-xs text-zinc-500">
        Grade {colunas}×{linhas} (fixa) — toque em uma célula para informar kg e barras da pilha
      </p>
      <GradeScrollContainer colunas={colunas} testId="entrada-grade-scroll">
        {linhasArr.map((y) =>
          colunasArr.map((x) => {
              const celula = celulas.get(`${x}-${y}`)
              const preenchida = celula && (celula.peso_atual_kg > 0 || celula.barras_atuais > 0)

              if (!preenchida) {
                return (
                  <button
                    key={`${x}-${y}`}
                    type="button"
                    onClick={() => setCelulaEditando({ x, y })}
                    className="apple-pressable min-h-[72px] w-full rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center gap-0.5 box-border"
                    data-testid={`entrada-celula-vazia-${x}-${y}`}
                    aria-label={`Célula vazia ${x + 1},${y + 1}`}
                  >
                    <span className="text-[10px] text-zinc-400 tabular-nums">
                      {x + 1},{y + 1}
                    </span>
                    <span className="text-[10px] text-apple-blue font-medium">+</span>
                  </button>
                )
              }

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  onClick={() => setCelulaEditando({ x, y })}
                  className={`apple-pressable min-h-[72px] w-full rounded-lg p-2 text-left flex flex-col justify-between box-border border-2 border-black/10 dark:border-white/10 ${corFundo} ${
                    textoEscuro ? 'text-zinc-900 shadow-sm' : 'text-white shadow-sm'
                  }`}
                  data-testid={`entrada-celula-${x}-${y}`}
                >
                  <span className="text-[10px] font-medium opacity-90 tabular-nums">
                    {x + 1},{y + 1}
                  </span>
                  <span className="text-xs font-semibold tabular-nums leading-tight">
                    {formatarKg(celula.peso_atual_kg)}
                  </span>
                  <span className="text-[10px] opacity-90 tabular-nums">
                    {formatarNumeroPtBr(celula.barras_atuais)} barras
                  </span>
                </button>
              )
            })
        )}
      </GradeScrollContainer>

      <EntradaCelulaModal
        aberto={celulaEditando !== null}
        posicaoX={celulaEditando?.x ?? 0}
        posicaoY={celulaEditando?.y ?? 0}
        valorInicial={
          celulaEditando
            ? (celulas.get(`${celulaEditando.x}-${celulaEditando.y}`) ?? null)
            : null
        }
        onSalvar={atualizarCelula}
        onLimpar={() => {
          if (celulaEditando) limparCelula(celulaEditando.x, celulaEditando.y)
        }}
        onFechar={() => setCelulaEditando(null)}
      />
    </>
  )
}

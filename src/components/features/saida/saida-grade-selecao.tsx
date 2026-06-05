'use client'

import { EstoqueCelulaMonte } from '@/components/features/estoque/estoque-celula-monte'
import { GradeScrollContainer } from '@/components/features/estoque/grade-scroll-container'
import { monteVisivelNaGrade } from '@/lib/estoque/monte-visivel-grade'
import { monteElegivelSelecao } from '@/lib/saida/monte-elegivel-operacao'
import type { Monte } from '@/repositories/estoque-repository'
import type { LoteEstoque } from '@/services/estoque-service'

type Props = {
  lote: LoteEstoque
  chaveCorLiga: string
  selecionados: Set<string>
  onToggleMonte: (monte: Monte) => void
}

export function SaidaGradeSelecao({ lote, chaveCorLiga, selecionados, onToggleMonte }: Props) {
  const mapa = new Map<string, Monte>()
  for (const monte of lote.montes) {
    if (!monteVisivelNaGrade(monte)) continue
    mapa.set(`${monte.posicao_x}-${monte.posicao_y}`, monte)
  }

  const linhas = Array.from({ length: lote.linhas_grade }, (_, y) => y)
  const colunas = Array.from({ length: lote.colunas_grade }, (_, x) => x)

  return (
    <div className="flex flex-col gap-2" data-testid="saida-grade-selecao">
      <p className="text-xs text-zinc-500">
        Grade {lote.colunas_grade}×{lote.linhas_grade} — toque nos montes para selecionar
      </p>
      <GradeScrollContainer colunas={lote.colunas_grade} testId="saida-grade-scroll">
        {linhas.map((y) =>
          colunas.map((x) => {
            const monte = mapa.get(`${x}-${y}`) ?? null
            const elegivel = monte ? monteElegivelSelecao(monte) : false
            return (
              <EstoqueCelulaMonte
                key={`${x}-${y}`}
                monte={monte}
                chaveCorLiga={chaveCorLiga}
                posicaoX={x}
                posicaoY={y}
                selecionavel={Boolean(monte && elegivel)}
                selecionado={monte ? selecionados.has(monte.id) : false}
                onToggleSelecao={elegivel ? onToggleMonte : undefined}
              />
            )
          })
        )}
      </GradeScrollContainer>
    </div>
  )
}

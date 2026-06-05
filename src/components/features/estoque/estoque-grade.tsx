'use client'

import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { EstoqueCelulaMonte } from '@/components/features/estoque/estoque-celula-monte'
import { GradeScrollContainer } from '@/components/features/estoque/grade-scroll-container'
import { monteVisivelNaGrade } from '@/lib/estoque/monte-visivel-grade'
import { monteElegivelSelecao } from '@/lib/saida/monte-elegivel-operacao'
import { monteClient } from '@/lib/monte/monte-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { Monte } from '@/repositories/estoque-repository'
import type { LoteEstoque } from '@/services/estoque-service'

type Props = {
  lote: LoteEstoque
  chaveCorLiga: string
  role: UsuarioRole
  userId: string
  modoAcao?: boolean
  selecionados?: Set<string>
  onToggleMonte?: (monte: Monte) => void
  onConsultarMonte?: (monte: Monte) => void
  onSelecionarMonte?: (monte: Monte) => void
  onGradeAtualizada: () => void
}

export function EstoqueGrade({
  lote,
  chaveCorLiga,
  role,
  userId,
  modoAcao = false,
  selecionados,
  onToggleMonte,
  onConsultarMonte,
  onSelecionarMonte,
  onGradeAtualizada,
}: Props) {
  const ctx = { userId, role }
  const podeArrastar = role === 'admin' && !modoAcao
  const temSelecao = (selecionados?.size ?? 0) > 0

  const mapa = new Map<string, Monte>()
  for (const monte of lote.montes) {
    if (!monteVisivelNaGrade(monte)) continue
    mapa.set(`${monte.posicao_x}-${monte.posicao_y}`, monte)
  }

  const trocarPosicao = useMutation({
    mutationFn: async ({
      monteId,
      destinoX,
      destinoY,
    }: {
      monteId: string
      destinoX: number
      destinoY: number
    }) => {
      const origem = lote.montes.find((m) => m.id === monteId)
      if (!origem) throw new Error('Monte não encontrado')
      return monteClient.trocarPosicao(ctx, {
        monte_id: monteId,
        posicao_x: destinoX,
        posicao_y: destinoY,
        updated_at: origem.updated_at,
      })
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        onGradeAtualizada()
      } else {
        toast.error(res.message)
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSoltar = useCallback(
    (monteId: string, destinoX: number, destinoY: number) => {
      if (!podeArrastar || temSelecao || trocarPosicao.isPending) return
      trocarPosicao.mutate({ monteId, destinoX, destinoY })
    },
    [podeArrastar, temSelecao, trocarPosicao]
  )

  const linhas = Array.from({ length: lote.linhas_grade }, (_, y) => y)
  const colunas = Array.from({ length: lote.colunas_grade }, (_, x) => x)

  const hint = modoAcao
    ? ' — toque para selecionar (almoxarifado); toque nos blocos opacos para ver resumo e histórico'
    : podeArrastar
      ? ' — arraste um monte para trocar de posição'
      : ' — toque em um monte para detalhes'

  return (
    <div className="flex flex-col gap-2" data-testid="estoque-grade">
      <p className="text-xs text-zinc-500">
        Grade {lote.colunas_grade}×{lote.linhas_grade}
        {hint}
      </p>
      <GradeScrollContainer colunas={lote.colunas_grade} testId="estoque-grade-scroll">
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
                podeArrastar={podeArrastar && !temSelecao}
                selecionavel={modoAcao && Boolean(monte && elegivel)}
                selecionado={monte ? selecionados?.has(monte.id) : false}
                onToggleSelecao={modoAcao && elegivel ? onToggleMonte : undefined}
                onConsultarMonte={modoAcao ? onConsultarMonte : undefined}
                onSelecionar={!modoAcao ? onSelecionarMonte : undefined}
                onSoltarMonte={handleSoltar}
              />
            )
          })
        )}
      </GradeScrollContainer>
    </div>
  )
}

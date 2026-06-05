'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, History, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { MonteHistoricoModal } from '@/components/features/saida/monte-historico-modal'
import {
  montarResumoMonte,
  transacoesAtivasHistorico,
  ultimaLinhaHistorico,
} from '@/lib/estoque/resumo-monte-movimentacao'
import { saidaClient } from '@/lib/saida/saida-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarDataHora } from '@/lib/utils/date-time'
import { monteClient } from '@/lib/monte/monte-client'
import type { Monte } from '@/repositories/estoque-repository'

type Props = {
  monte: Monte
  numeroLote: string
  setoresPorId: Record<string, string>
  ctx: { userId: string; role: UsuarioRole }
  onAtualizado: () => void
}

const DESTAQUE_CLASSES = {
  setor: 'bg-amber-500/10 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100',
  consumido: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600',
  parcial: 'bg-violet-500/10 border-violet-300 dark:border-violet-800',
  info: 'bg-apple-blue/10 border-apple-blue/30',
}

export function MonteMovimentacaoResumo({
  monte,
  numeroLote,
  setoresPorId,
  ctx,
  onAtualizado,
}: Props) {
  const queryClient = useQueryClient()
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const resumo = montarResumoMonte(monte, setoresPorId)

  const { data: linhas = [], isLoading } = useQuery({
    queryKey: ['monte', 'historico', monte.id],
    enabled: ctx.role === 'admin',
    queryFn: async () => {
      const res = await monteClient.listarHistorico(ctx, { monte_id: monte.id })
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const ultima = ultimaLinhaHistorico(linhas)
  const transacoesAtivas = transacoesAtivasHistorico(linhas)

  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: ['monte', 'historico', monte.id] })
    void queryClient.invalidateQueries({ queryKey: ['estoque', 'visao'] })
    void queryClient.invalidateQueries({ queryKey: ['saida', 'liberacoes'] })
    onAtualizado()
  }

  const estornar = useMutation({
    mutationFn: (linha: (typeof transacoesAtivas)[number]) =>
      saidaClient.estornarLiberacao(ctx, {
        grupo_liberacao_id: linha.grupo_liberacao_id ?? null,
        transacao_id: linha.grupo_liberacao_id ? null : linha.id,
      }),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message)
      else {
        toast.success(res.message)
        invalidar()
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (ctx.role !== 'admin') {
    return (
      <p className="text-xs text-zinc-500 mt-4">
        Para histórico e estorno, solicite ao PCP (admin).
      </p>
    )
  }

  return (
    <section className="mt-4 flex flex-col gap-3" data-testid="monte-movimentacao-resumo">
      <div
        className={`rounded-ios-card border p-3 text-sm ${DESTAQUE_CLASSES[resumo.destaque]}`}
      >
        <h3 className="font-semibold">{resumo.titulo}</h3>
        <p className="mt-1 text-zinc-600 dark:text-zinc-300">{resumo.descricao}</p>
        {ultima && !isLoading && (
          <p className="mt-2 text-xs text-zinc-500">
            Último registro: <span className="font-medium text-zinc-700 dark:text-zinc-200">{ultima.rotulo}</span>
            {' — '}
            {ultima.detalhe} · {formatarDataHora(ultima.data)}
          </p>
        )}
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Carregando histórico…</p>}

      {!isLoading && linhas.length > 0 && (
        <ul className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
          {linhas.slice(0, 4).map((linha) => (
            <li
              key={`${linha.tipo}-${linha.id}`}
              className="text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium">{linha.rotulo}</span>
                <span className="text-xs text-zinc-500 tabular-nums shrink-0">
                  {formatarDataHora(linha.data)}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5">{linha.detalhe}</p>
              {linha.estornada && (
                <span className="text-xs text-zinc-500 mt-1 inline-block">Estornada</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {!isLoading && linhas.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhuma movimentação registrada ainda.</p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setHistoricoAberto(true)}
          className="apple-pressable inline-flex items-center justify-center gap-2 w-full border border-zinc-200 dark:border-zinc-700 font-medium px-4 py-3 rounded-ios-btn min-h-[44px] text-sm"
          data-testid="btn-historico-monte-sheet"
        >
          <History className="h-4 w-4" strokeWidth={1.5} />
          Histórico completo deste monte
        </button>

        <Link
          href="/relatorios?aba=saidas"
          className="apple-pressable inline-flex items-center justify-center gap-2 w-full bg-zinc-100 dark:bg-zinc-800 font-medium px-4 py-3 rounded-ios-btn min-h-[44px] text-sm"
          data-testid="btn-relatorio-liberacoes"
        >
          <FileText className="h-4 w-4" strokeWidth={1.5} />
          Relatório de liberações (fábrica)
        </Link>

        {transacoesAtivas.map((linha) => (
          <button
            key={linha.id}
            type="button"
            disabled={estornar.isPending}
            onClick={() => {
              if (
                confirm(
                  'Estornar esta liberação? O saldo do monte será restaurado conforme as regras de estorno.'
                )
              ) {
                estornar.mutate(linha)
              }
            }}
            className="apple-pressable inline-flex items-center justify-center gap-2 w-full text-apple-red border border-apple-red/30 font-medium px-4 py-3 rounded-ios-btn min-h-[44px] text-sm disabled:opacity-50"
            data-testid={`btn-estornar-monte-${linha.id}`}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            Estornar: {linha.detalhe}
          </button>
        ))}
      </div>

      {historicoAberto && (
        <MonteHistoricoModal
          ctx={ctx}
          monte={monte}
          loteNumero={numeroLote}
          onFechar={() => setHistoricoAberto(false)}
        />
      )}
    </section>
  )
}

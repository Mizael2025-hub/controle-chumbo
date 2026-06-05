'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EstoqueSaldosBar } from '@/components/features/estoque/estoque-saldos-bar'
import {
  SaidaAcoesPainel,
  type LinhaSelecionadaSaida,
} from '@/components/features/saida/saida-acoes-painel'
import { SaidaGradeSelecao } from '@/components/features/saida/saida-grade-selecao'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import { estoqueClient } from '@/lib/estoque/estoque-client'
import { monteElegivelSelecao, mensagemInelegivel } from '@/lib/saida/monte-elegivel-operacao'
import {
  CHAVE_COR_CLASSES,
  type ChaveCorLiga,
  isChaveCorLiga,
} from '@/lib/types/chave-cor-liga'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarData } from '@/lib/utils/date-time'
import type { Monte } from '@/repositories/estoque-repository'

type Props = {
  ctx: { userId: string; role: UsuarioRole }
}

export function SaidaNovaLiberacao({ ctx }: Props) {
  const queryClient = useQueryClient()
  const [ligaId, setLigaId] = useState<string | null>(null)
  const [loteExpandidoId, setLoteExpandidoId] = useState<string | null>(null)
  const [selecionados, setSelecionados] = useState<Record<string, LinhaSelecionadaSaida>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['estoque', 'visao'],
    queryFn: async () => {
      const res = await estoqueClient.listarVisaoEstoque(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
  })

  const { data: setoresCadastro = [] } = useQuery({
    queryKey: ['cadastros', 'setores'],
    queryFn: async () => {
      const res = await cadastroClient.listarSetores(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const { data: destinosCadastro = [] } = useQuery({
    queryKey: ['cadastros', 'destinos'],
    queryFn: async () => {
      const res = await cadastroClient.listarDestinos(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const ligas = useMemo(() => data?.ligas ?? [], [data])

  const ligaAtiva = useMemo(() => {
    if (ligas.length === 0) return null
    const idValido = ligaId && ligas.some((l) => l.id === ligaId) ? ligaId : ligas[0].id
    return ligas.find((l) => l.id === idValido) ?? ligas[0]
  }, [ligas, ligaId])

  const setores = useMemo(
    () =>
      setoresCadastro
        .filter((s) => s.is_active)
        .map((s) => ({ id: s.id, nome: s.nome, tipo: s.tipo })),
    [setoresCadastro]
  )

  const destinos = useMemo(
    () =>
      destinosCadastro
        .filter((d) => d.is_active)
        .map((d) => ({ id: d.id, nome: d.nome, slug: d.slug })),
    [destinosCadastro]
  )

  const linhasSelecionadas = useMemo(() => Object.values(selecionados), [selecionados])

  const atualizarDados = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['estoque', 'visao'] })
    void queryClient.invalidateQueries({ queryKey: ['saida'] })
  }, [queryClient])

  const toggleLote = useCallback((id: string) => {
    setLoteExpandidoId((atual) => (atual === id ? null : id))
  }, [])

  const toggleMonte = useCallback((monte: Monte, loteNumero: string) => {
    if (!monteElegivelSelecao(monte)) {
      toast.error(mensagemInelegivel(monte))
      return
    }
    setSelecionados((prev) => {
      if (prev[monte.id]) {
        const next = { ...prev }
        delete next[monte.id]
        return next
      }
      return {
        ...prev,
        [monte.id]: {
          monte,
          loteNumero,
          barras: String(monte.barras_atuais),
        },
      }
    })
  }, [])

  const atualizarBarras = useCallback((monteId: string, barras: string) => {
    setSelecionados((prev) => {
      const linha = prev[monteId]
      if (!linha) return prev
      return { ...prev, [monteId]: { ...linha, barras } }
    })
  }, [])

  const limparSelecao = useCallback(() => setSelecionados({}), [])

  const handleSucesso = useCallback(() => {
    atualizarDados()
  }, [atualizarDados])

  const idsSelecionados = useMemo(() => new Set(Object.keys(selecionados)), [selecionados])

  if (isLoading) {
    return <p className="text-zinc-500 text-center py-8">Carregando estoque...</p>
  }

  if (ligas.length === 0) {
    return (
      <p className="text-zinc-500 text-center py-8">
        Nenhuma liga com material cadastrado. Registre entrada primeiro.
      </p>
    )
  }

  const temSelecao = linhasSelecionadas.length > 0

  return (
    <div className={`flex flex-col gap-4 ${temSelecao ? 'pb-24' : 'pb-4'}`}>
      <p className="text-sm text-zinc-500">
        Escolha a liga, expanda o lote e selecione montes na grade para reservar, mover ou liberar.
      </p>

      <div
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
        role="tablist"
        aria-label="Ligas"
      >
        {ligas.map((liga) => {
          const ativa = liga.id === ligaAtiva?.id
          const cor = isChaveCorLiga(liga.chave_cor)
            ? CHAVE_COR_CLASSES[liga.chave_cor as ChaveCorLiga]
            : 'bg-zinc-300'
          return (
            <button
              key={liga.id}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => {
                setLigaId(liga.id)
                setLoteExpandidoId(null)
              }}
              className={`apple-pressable shrink-0 flex items-center gap-2 px-4 py-2 rounded-ios-btn min-h-[44px] border ${
                ativa
                  ? 'border-apple-blue bg-apple-blue/10 font-semibold'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
              }`}
              data-testid={`tab-liga-saida-${liga.id}`}
            >
              <span className={`h-4 w-4 rounded-full shrink-0 ${cor}`} />
              {liga.nome}
            </button>
          )
        })}
      </div>

      {ligaAtiva && (
        <>
          <EstoqueSaldosBar saldos={ligaAtiva.saldos} />

          {ligaAtiva.lotes.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">Nenhum lote nesta liga.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {ligaAtiva.lotes.map((lote) => {
                const expandido = loteExpandidoId === lote.id
                return (
                  <li
                    key={lote.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-ios-card shadow-sm overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleLote(lote.id)}
                      className="apple-pressable w-full flex items-center gap-3 p-4 text-left min-h-[44px]"
                      data-testid={`lote-toggle-saida-${lote.id}`}
                      aria-expanded={expandido}
                    >
                      {expandido ? (
                        <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.5} />
                      ) : (
                        <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.5} />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold block truncate">Lote {lote.numero_lote}</span>
                        <span className="text-xs text-zinc-500">
                          Chegada {formatarData(lote.data_chegada)} · {lote.montes.length} monte(s)
                        </span>
                      </div>
                    </button>

                    {expandido && (
                      <div className="px-4 pb-4 flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                        <EstoqueSaldosBar saldos={lote.saldos} compacto />
                        <SaidaGradeSelecao
                          lote={lote}
                          chaveCorLiga={ligaAtiva.chave_cor}
                          selecionados={idsSelecionados}
                          onToggleMonte={(monte) => toggleMonte(monte, lote.numero_lote)}
                        />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      <SaidaAcoesPainel
        ctx={ctx}
        linhas={linhasSelecionadas}
        destinos={destinos}
        setores={setores}
        onAtualizarBarras={atualizarBarras}
        onSucesso={handleSucesso}
        onLimparSelecao={limparSelecao}
      />
    </div>
  )
}

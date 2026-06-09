'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Package } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EstoqueGrade } from '@/components/features/estoque/estoque-grade'
import { EstoqueSaldosBar } from '@/components/features/estoque/estoque-saldos-bar'
import { MonteDetalheSheet } from '@/components/features/estoque/monte-detalhe-sheet'
import {
  SaidaAcoesPainel,
  type LinhaSelecionadaSaida,
} from '@/components/features/saida/saida-acoes-painel'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import { estoqueClient } from '@/lib/estoque/estoque-client'
import { monteDeveAbrirDetalhe } from '@/lib/estoque/monte-deve-abrir-detalhe'
import { monteElegivelSelecao, mensagemInelegivel } from '@/lib/saida/monte-elegivel-operacao'
import {
  CHAVE_COR_CLASSES,
  type ChaveCorLiga,
  isChaveCorLiga,
} from '@/lib/types/chave-cor-liga'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarData } from '@/lib/utils/date-time'
import { formatarKg } from '@/lib/utils/format-number'
import type { Monte } from '@/repositories/estoque-repository'
import type { LoteEstoque } from '@/services/estoque-service'

type Props = {
  userId: string
  role: UsuarioRole
}

export function EstoqueView({ userId, role }: Props) {
  const ctx = { userId, role }
  const isAdmin = role === 'admin'
  const queryClient = useQueryClient()
  const [ligaId, setLigaId] = useState<string | null>(null)
  const [loteExpandidoId, setLoteExpandidoId] = useState<string | null>(null)
  const [monteSelecionado, setMonteSelecionado] = useState<{
    monte: Monte
    lote: LoteEstoque
    nomeLiga: string
  } | null>(null)
  const [selecionados, setSelecionados] = useState<Record<string, LinhaSelecionadaSaida>>({})

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['estoque', 'visao'],
    queryFn: async () => {
      const res = await estoqueClient.listarVisaoEstoque(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
  })

  const ligas = useMemo(() => data?.ligas ?? [], [data])

  const { data: setoresCadastro = [] } = useQuery({
    queryKey: ['cadastros', 'setores'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await cadastroClient.listarSetores(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const setoresLista = useMemo(
    () =>
      setoresCadastro
        .filter((s) => s.is_active)
        .map((s) => ({ id: s.id, nome: s.nome })),
    [setoresCadastro]
  )

  const setoresAcao = useMemo(
    () =>
      setoresCadastro
        .filter((s) => s.is_active)
        .map((s) => ({ id: s.id, nome: s.nome, tipo: s.tipo })),
    [setoresCadastro]
  )

  const { data: destinosCadastro = [] } = useQuery({
    queryKey: ['cadastros', 'destinos'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await cadastroClient.listarDestinos(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const destinosLista = useMemo(
    () =>
      destinosCadastro
        .filter((d) => d.is_active)
        .map((d) => ({ id: d.id, nome: d.nome })),
    [destinosCadastro]
  )

  const destinosAcao = useMemo(
    () =>
      destinosCadastro
        .filter((d) => d.is_active)
        .map((d) => ({ id: d.id, nome: d.nome, slug: d.slug })),
    [destinosCadastro]
  )

  const linhasSelecionadas = useMemo(() => Object.values(selecionados), [selecionados])
  const idsSelecionados = useMemo(() => new Set(Object.keys(selecionados)), [selecionados])
  const temSelecao = linhasSelecionadas.length > 0

  const atualizarEstoque = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['estoque', 'visao'] })
    setMonteSelecionado(null)
  }, [queryClient])

  const limparSelecao = useCallback(() => setSelecionados({}), [])

  const abrirDetalheMonte = useCallback(
    (monte: Monte, lote: LoteEstoque, nomeLiga: string) => {
      setMonteSelecionado({ monte, lote, nomeLiga })
    },
    []
  )

  const toggleMonteAcao = useCallback((monte: Monte, loteNumero: string) => {
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

  const ligaAtiva = useMemo(() => {
    if (ligas.length === 0) return null
    const idValido = ligaId && ligas.some((l) => l.id === ligaId) ? ligaId : ligas[0].id
    return ligas.find((l) => l.id === idValido) ?? ligas[0]
  }, [ligas, ligaId])

  const toggleLote = useCallback((id: string) => {
    setLoteExpandidoId((atual) => (atual === id ? null : id))
  }, [])

  useEffect(() => {
    if (isError) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar estoque')
    }
  }, [isError, error])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-zinc-500">
        Carregando estoque…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 gap-3 text-center">
        <p className="text-apple-red">Não foi possível carregar o estoque.</p>
        <Link href="/" className="text-apple-blue text-sm min-h-[44px] inline-flex items-center">
          Voltar ao início
        </Link>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-1 flex-col p-4 max-w-5xl mx-auto w-full ${temSelecao ? 'max-lg:pb-contextual-bar lg:pb-28' : ''}`}
    >
      <div className="flex flex-col gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Package className="h-6 w-6 text-apple-blue" strokeWidth={1.5} />
            Estoque
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isAdmin
              ? 'Selecione montes na grade para reservar, mover ou liberar. Arraste para reorganizar quando não houver seleção.'
              : 'Navegue por liga e lote. Toque em um monte para ver detalhes.'}
          </p>
        </div>
      </div>

      {ligas.length === 0 ? (
        <div className="mobile-page-card p-6 rounded-ios-card text-center text-zinc-500">
          <p>Nenhuma liga ativa cadastrada.</p>
          {isAdmin && (
            <Link href="/configuracoes/cadastros/ligas" className="text-apple-blue text-sm mt-2 inline-block">
              Cadastrar ligas
            </Link>
          )}
        </div>
      ) : (
        <>
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
                  data-testid={`tab-liga-${liga.id}`}
                >
                  <span className={`h-4 w-4 rounded-full shrink-0 ${cor}`} />
                  {liga.nome}
                </button>
              )
            })}
          </div>

          {ligaAtiva && (
            <div className="flex flex-col gap-4 mt-2">
              <EstoqueSaldosBar saldos={ligaAtiva.saldos} />

              {ligaAtiva.lotes.length === 0 ? (
                <div className="text-center py-8 flex flex-col gap-3 items-center">
                  <p className="text-zinc-500 text-sm">
                    Nenhum lote nesta liga. Cadastre material pela Entrada.
                  </p>
                  {isAdmin && (
                    <Link
                      href="/entrada"
                      className="apple-pressable inline-flex items-center justify-center bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px] text-sm"
                      data-testid="btn-entrada-estoque"
                    >
                      Nova entrada
                    </Link>
                  )}
                </div>
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
                          data-testid={`lote-toggle-${lote.id}`}
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
                              Chegada {formatarData(lote.data_chegada)} · {formatarKg(lote.peso_inicial_kg)} ·{' '}
                              {lote.montes.length} monte(s)
                            </span>
                          </div>
                        </button>

                        {expandido && (
                          <div className="px-4 pb-4 flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                            <EstoqueSaldosBar saldos={lote.saldos} compacto />
                            <EstoqueGrade
                              lote={lote}
                              chaveCorLiga={ligaAtiva.chave_cor}
                              role={role}
                              userId={userId}
                              modoAcao={isAdmin}
                              selecionados={isAdmin ? idsSelecionados : undefined}
                              onToggleMonte={
                                isAdmin
                                  ? (monte) => toggleMonteAcao(monte, lote.numero_lote)
                                  : undefined
                              }
                              onConsultarMonte={
                                isAdmin
                                  ? (monte) => {
                                      if (monteDeveAbrirDetalhe(monte)) {
                                        abrirDetalheMonte(monte, lote, ligaAtiva.nome)
                                      }
                                    }
                                  : undefined
                              }
                              onSelecionarMonte={
                                !isAdmin
                                  ? (monte) => abrirDetalheMonte(monte, lote, ligaAtiva.nome)
                                  : undefined
                              }
                              onGradeAtualizada={atualizarEstoque}
                            />
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <SaidaAcoesPainel
          ctx={ctx}
          linhas={linhasSelecionadas}
          destinos={destinosAcao}
          setores={setoresAcao}
          onAtualizarBarras={atualizarBarras}
          onSucesso={() => {
            atualizarEstoque()
            limparSelecao()
          }}
          onLimparSelecao={limparSelecao}
        />
      )}

      {monteSelecionado && (
        <MonteDetalheSheet
          monte={monteSelecionado.monte}
          numeroLote={monteSelecionado.lote.numero_lote}
          nomeLiga={monteSelecionado.nomeLiga}
          role={role}
          userId={userId}
          setores={setoresLista}
          destinos={destinosLista}
          onFechar={() => setMonteSelecionado(null)}
          onAtualizado={atualizarEstoque}
        />
      )}
    </div>
  )
}

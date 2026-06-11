'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bookmark,
  BookmarkX,
  History,
  LogOut,
  PackageMinus,
  Truck,
  Warehouse,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MonteHistoricoModal } from '@/components/features/saida/monte-historico-modal'
import { AcoesDropdownMenu } from '@/components/ui/acoes-dropdown-menu'
import { ContextualActionBar } from '@/components/ui/contextual-action-bar'
import { ModalOverlay } from '@/components/ui/modal-overlay'
import {
  modalBtnCancelClass,
  modalBtnPrimaryClass,
  modalCardWideClass,
  modalInputClass,
  modalLabelClass,
  modalSubtitleClass,
  modalTitleClass,
} from '@/components/ui/modal-ui-classes'
import { agentLog } from '@/lib/debug/agent-log'
import { aplicarAtualizacaoOtimistaEstoque } from '@/lib/saida/atualizar-cache-estoque'
import { calcularPesoBaixado } from '@/lib/monte/calcular-baixa'
import { monteClient } from '@/lib/monte/monte-client'
import { saidaClient } from '@/lib/saida/saida-client'
import type { TipoOperacaoSaida } from '@/lib/saida/monte-elegivel-operacao'
import { monteElegivelOperacao } from '@/lib/saida/monte-elegivel-operacao'
import { SETOR_TIPOS } from '@/lib/types/setor-tipo'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'
import type { Monte } from '@/repositories/estoque-repository'

export type LinhaSelecionadaSaida = {
  monte: Monte
  loteNumero: string
  barras: string
}

type DestinoOpcao = { id: string; nome: string; slug: string }
type SetorOpcao = { id: string; nome: string; tipo: string }

type Props = {
  ctx: { userId: string; role: UsuarioRole }
  linhas: LinhaSelecionadaSaida[]
  destinos: DestinoOpcao[]
  setores: SetorOpcao[]
  onAtualizarBarras: (monteId: string, barras: string) => void
  onSucesso: () => void
  onLimparSelecao: () => void
}

type ModalAcao = TipoOperacaoSaida | null

const LABELS_ACAO: Record<TipoOperacaoSaida, string> = {
  reserva: 'Reserva',
  cancelar_reserva: 'Cancelar reserva',
  mover_setor: 'Mover para setor',
  liberar_setor: 'Liberar para setor',
  liberar_baixar: 'Liberar / Baixar',
  venda_direta: 'Venda direta',
}

const ICONES_ACAO: Record<TipoOperacaoSaida, typeof Bookmark> = {
  reserva: Bookmark,
  cancelar_reserva: BookmarkX,
  mover_setor: Truck,
  liberar_setor: Warehouse,
  liberar_baixar: LogOut,
  venda_direta: PackageMinus,
}

export function SaidaAcoesPainel({
  ctx,
  linhas,
  destinos,
  setores,
  onAtualizarBarras,
  onSucesso,
  onLimparSelecao,
}: Props) {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<ModalAcao>(null)
  const [historicoLinha, setHistoricoLinha] = useState<LinhaSelecionadaSaida | null>(null)
  const [observacao, setObservacao] = useState('')
  const [setorId, setSetorId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [barrasMover, setBarrasMover] = useState('')

  const setoresProducao = useMemo(
    () => setores.filter((s) => s.tipo === SETOR_TIPOS[0]),
    [setores]
  )

  const destinoVenda = useMemo(() => destinos.find((d) => d.slug === 'venda'), [destinos])
  const destinoVrla = useMemo(() => destinos.find((d) => d.slug === 'vrla'), [destinos])
  const destinosBaixa = useMemo(
    () => destinos.filter((d) => !['venda', 'vrla'].includes(d.slug)),
    [destinos]
  )

  const linhasElegiveis = useMemo(() => {
    if (!modal) return []
    return linhas.filter((l) => monteElegivelOperacao(l.monte, modal))
  }, [linhas, modal])

  const totais = useMemo(() => {
    let barras = 0
    let peso = 0
    for (const linha of linhasElegiveis) {
      const b = Number.parseInt(linha.barras, 10)
      if (b <= 0) continue
      barras += b
      peso += calcularPesoBaixado(linha.monte.peso_atual_kg, linha.monte.barras_atuais, b)
    }
    return { barras, peso: Math.round(peso * 100) / 100 }
  }, [linhasElegiveis])

  const fecharModal = () => {
    setModal(null)
    setObservacao('')
  }

  const executar = useMutation({
    mutationFn: async (acao: TipoOperacaoSaida) => {
      const obs = observacao.trim()
      const elegiveis = linhas.filter((l) => monteElegivelOperacao(l.monte, acao))
      if (elegiveis.length === 0) {
        throw new Error('Nenhum monte elegível para esta operação.')
      }

      if (acao === 'reserva') {
        if (!setorId) throw new Error('Selecione o setor.')
        for (const { monte } of elegiveis) {
          const res = await monteClient.reservar(ctx, {
            monte_id: monte.id,
            setor_reserva_id: setorId,
            reservado_para: obs || undefined,
            updated_at: monte.updated_at,
          })
          if (!res.success) throw new Error(res.message)
        }
        return
      }

      if (acao === 'cancelar_reserva') {
        for (const { monte } of elegiveis) {
          const res = await monteClient.cancelarReserva(ctx, {
            monte_id: monte.id,
            updated_at: monte.updated_at,
          })
          if (!res.success) throw new Error(res.message)
        }
        return
      }

      if (acao === 'mover_setor') {
        if (!setorId) throw new Error('Selecione o setor.')
        const atualizacoesOtimistas: { monte_id: string; barras_baixadas: number }[] = []
        for (const { monte, barras } of elegiveis) {
          const linhaBarras =
            elegiveis.length === 1 && barrasMover
              ? Number.parseInt(barrasMover, 10)
              : Number.parseInt(barras, 10)
          if (linhaBarras <= 0 || linhaBarras > monte.barras_atuais) {
            throw new Error('Informe barras válidas para mover.')
          }
          const res = await monteClient.moverSetor(ctx, {
            monte_id: monte.id,
            setor_id: setorId,
            barras_movidas: linhaBarras,
            observacao: obs || undefined,
            updated_at: monte.updated_at,
          })
          if (!res.success) throw new Error(res.message)
          if (linhaBarras < monte.barras_atuais) {
            atualizacoesOtimistas.push({ monte_id: monte.id, barras_baixadas: linhaBarras })
          }
        }
        aplicarAtualizacaoOtimistaEstoque(queryClient, atualizacoesOtimistas)
        return
      }

      if (acao === 'venda_direta') {
        if (!destinoVenda) throw new Error('Destino Venda não cadastrado.')
        const res = await saidaClient.baixaAgrupada(ctx, {
          destino_saida_id: destinoVenda.id,
          observacao: obs || undefined,
          linhas: elegiveis.map(({ monte }) => ({
            monte_id: monte.id,
            barras_baixadas: monte.barras_atuais,
            updated_at: monte.updated_at,
          })),
        })
        if (!res.success) throw new Error(res.message)
        return
      }

      if (acao === 'liberar_setor') {
        if (!destinoVrla) throw new Error('Destino VRLA não cadastrado.')
        if (!setorId) throw new Error('Selecione o setor de produção.')
        const res = await saidaClient.baixaAgrupada(ctx, {
          destino_saida_id: destinoVrla.id,
          setor_id: setorId,
          observacao: obs || undefined,
          linhas: elegiveis.map(({ monte, barras }) => ({
            monte_id: monte.id,
            barras_baixadas: Number.parseInt(barras, 10),
            updated_at: monte.updated_at,
          })),
        })
        if (!res.success) throw new Error(res.message)
        return
      }

      if (acao === 'liberar_baixar') {
        if (!destinoId) throw new Error('Selecione o destino.')
        const res = await saidaClient.baixaAgrupada(ctx, {
          destino_saida_id: destinoId,
          observacao: obs || undefined,
          linhas: elegiveis.map(({ monte, barras }) => ({
            monte_id: monte.id,
            barras_baixadas: Number.parseInt(barras, 10),
            updated_at: monte.updated_at,
          })),
        })
        if (!res.success) throw new Error(res.message)
        return
      }
    },
    onSuccess: (_data, acao) => {
      if (acao === 'liberar_baixar' || acao === 'liberar_setor' || acao === 'venda_direta') {
        const elegiveis = linhas.filter((l) => monteElegivelOperacao(l.monte, acao))
        aplicarAtualizacaoOtimistaEstoque(
          queryClient,
          elegiveis.map(({ monte, barras }) => ({
            monte_id: monte.id,
            barras_baixadas:
              acao === 'venda_direta' ? monte.barras_atuais : Number.parseInt(barras, 10),
          }))
        )
      }
      toast.success('Operação registrada com sucesso!')
      fecharModal()
      onLimparSelecao()
      onSucesso()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const abrirModal = (acao: TipoOperacaoSaida) => {
    setSetorId(setoresProducao[0]?.id ?? setores[0]?.id ?? '')
    setDestinoId(destinosBaixa[0]?.id ?? '')
    setObservacao('')
    if (acao === 'mover_setor' && linhas.length === 1) {
      setBarrasMover(linhas[0].barras)
    } else {
      setBarrasMover('')
    }
    setModal(acao)
  }

  useEffect(() => {
    if (!modal) return
    // #region agent log
    requestAnimationFrame(() => {
      const barra = document.querySelector('[data-testid="contextual-action-bar"]')
      const overlay = document.querySelector('.modal-overlay-backdrop')
      const card = document.querySelector('[data-testid="estoque-acao-modal-card"]')
      const barraStyles = barra ? getComputedStyle(barra) : null
      const cardStyles = card instanceof HTMLElement ? getComputedStyle(card) : null
      agentLog({
        location: 'saida-acoes-painel.tsx:modal',
        message: 'Modal ação estoque — z-index e visibilidade da barra',
        hypothesisId: 'H3',
        runId: 'post-fix-v5',
        data: {
          acao: modal,
          linhas: linhas.length,
          barraExiste: Boolean(barra),
          barraOpacity: barraStyles?.opacity ?? null,
          cardBg: cardStyles?.backgroundColor ?? null,
          overlayZIndex: overlay ? getComputedStyle(overlay).zIndex : null,
        },
      })
    })
    // #endregion
  }, [modal, linhas.length])

  const acoes = useMemo(() => {
    const lista: TipoOperacaoSaida[] = []
    if (linhas.some((l) => monteElegivelOperacao(l.monte, 'cancelar_reserva'))) {
      lista.push('cancelar_reserva')
    }
    if (linhas.some((l) => monteElegivelOperacao(l.monte, 'reserva'))) {
      lista.push('reserva')
    }
    lista.push('mover_setor', 'liberar_setor', 'liberar_baixar', 'venda_direta')
    return lista
  }, [linhas])

  return (
    <>
      {linhas.length > 0 && modal === null && (
        <ContextualActionBar visible selectedCount={linhas.length} onClear={onLimparSelecao}>
          <AcoesDropdownMenu
            itens={[
              ...(linhas.length === 1
                ? [
                    {
                      id: 'historico',
                      rotulo: 'Histórico do monte',
                      icone: <History className="h-4 w-4 shrink-0" strokeWidth={1.5} />,
                      onClick: () => setHistoricoLinha(linhas[0]),
                    },
                  ]
                : []),
              ...acoes.map((acao) => {
                const Icone = ICONES_ACAO[acao]
                return {
                  id: acao,
                  rotulo: LABELS_ACAO[acao],
                  icone: <Icone className="h-4 w-4 shrink-0" strokeWidth={1.5} />,
                  onClick: () => abrirModal(acao),
                }
              }),
            ]}
          />
        </ContextualActionBar>
      )}

      {historicoLinha && (
        <MonteHistoricoModal
          ctx={ctx}
          monte={historicoLinha.monte}
          loteNumero={historicoLinha.loteNumero}
          onFechar={() => setHistoricoLinha(null)}
        />
      )}

      <ModalOverlay aberto={modal !== null}>
        {modal && (
          <>
            <button
              type="button"
              className="absolute inset-0"
              aria-label="Fechar"
              onClick={fecharModal}
            />
            <div className={modalCardWideClass} data-testid="estoque-acao-modal-card">
            <h3 className={modalTitleClass}>{LABELS_ACAO[modal]}</h3>
            <p className={modalSubtitleClass}>
              {linhasElegiveis.length} monte(s) elegível(is)
            </p>

            {(modal === 'reserva' || modal === 'mover_setor' || modal === 'liberar_setor') && (
              <div className="flex flex-col gap-1 mb-3">
                <label className={modalLabelClass}>Setor</label>
                <select
                  value={setorId}
                  onChange={(e) => setSetorId(e.target.value)}
                  className={`${modalInputClass} min-h-[44px]`}
                  data-testid="select-setor-acao"
                >
                  {(modal === 'liberar_setor' || modal === 'mover_setor' ? setoresProducao : setores).map(
                    (s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            {modal === 'liberar_baixar' && (
              <div className="flex flex-col gap-1 mb-3">
                <label className={modalLabelClass}>Destino</label>
                <select
                  value={destinoId}
                  onChange={(e) => setDestinoId(e.target.value)}
                  className={`${modalInputClass} min-h-[44px]`}
                  data-testid="select-destino-baixa"
                >
                  {destinosBaixa.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1 mb-3">
              <label className={modalLabelClass}>Observação (opcional)</label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Informações adicionais para esta operação"
                className={`${modalInputClass} resize-none`}
                data-testid="input-observacao-saida"
              />
            </div>

            {modal === 'mover_setor' && linhasElegiveis.length === 1 && (
              <div className="flex flex-col gap-1 mb-3">
                <label className={modalLabelClass}>Barras a mover</label>
                <input
                  type="number"
                  min={1}
                  max={linhasElegiveis[0].monte.barras_atuais}
                  value={barrasMover}
                  onChange={(e) => setBarrasMover(e.target.value)}
                  className={`${modalInputClass} max-w-[140px] tabular-nums`}
                  data-testid="input-barras-mover-setor"
                />
              </div>
            )}

            {modal === 'mover_setor' && linhasElegiveis.length > 1 && (
              <ul className="flex flex-col gap-2 mb-3 max-h-[180px] overflow-y-auto">
                {linhasElegiveis.map(({ monte, loteNumero, barras }) => (
                  <li
                    key={monte.id}
                    className="text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  >
                    <span className="font-medium block">
                      Lote {loteNumero} · ({monte.posicao_x + 1},{monte.posicao_y + 1})
                    </span>
                    <label className="text-xs text-zinc-500 mt-1 block">Barras</label>
                    <input
                      type="number"
                      min={1}
                      max={monte.barras_atuais}
                      value={barras}
                      onChange={(e) => onAtualizarBarras(monte.id, e.target.value)}
                      className="w-full max-w-[120px] px-2 py-1 border border-zinc-300 rounded-ios-btn text-[16px] tabular-nums"
                    />
                  </li>
                ))}
              </ul>
            )}

            {(modal === 'liberar_baixar' || modal === 'liberar_setor') && (
              <ul className="flex flex-col gap-2 mb-3 max-h-[180px] overflow-y-auto">
                {linhasElegiveis.map(({ monte, loteNumero, barras }) => (
                  <li
                    key={monte.id}
                    className="text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  >
                    <span className="font-medium block">
                      Lote {loteNumero} · ({monte.posicao_x + 1},{monte.posicao_y + 1})
                    </span>
                    <label className="text-xs text-zinc-500 mt-1 block">Barras</label>
                    <input
                      type="number"
                      min={1}
                      max={monte.barras_atuais}
                      value={barras}
                      onChange={(e) => onAtualizarBarras(monte.id, e.target.value)}
                      className="w-full max-w-[120px] px-2 py-1 border border-zinc-300 rounded-ios-btn text-[16px] tabular-nums"
                    />
                  </li>
                ))}
              </ul>
            )}

            {modal === 'venda_direta' && (
              <p className="text-sm text-zinc-500 mb-3">
                Baixa total instantânea de {linhasElegiveis.length} monte(s).
              </p>
            )}

            {modal === 'cancelar_reserva' && (
              <p className="text-sm text-zinc-500 mb-3">
                Os montes voltarão ao estoque disponível. {linhasElegiveis.length} monte(s)
                elegível(is).
              </p>
            )}

            {modal === 'mover_setor' && linhasElegiveis.length === 1 && barrasMover && (
              <p className="text-sm mb-3">
                Total: {formatarNumeroPtBr(Number.parseInt(barrasMover, 10) || 0)} barras ·{' '}
                {formatarKg(
                  calcularPesoBaixado(
                    linhasElegiveis[0].monte.peso_atual_kg,
                    linhasElegiveis[0].monte.barras_atuais,
                    Number.parseInt(barrasMover, 10) || 0
                  )
                )}
              </p>
            )}

            {totais.barras > 0 &&
              modal !== 'venda_direta' &&
              modal !== 'reserva' &&
              modal !== 'cancelar_reserva' &&
              modal !== 'mover_setor' && (
              <p className="text-sm mb-3">
                Total: {formatarNumeroPtBr(totais.barras)} barras · {formatarKg(totais.peso)}
              </p>
            )}

            <div className="flex gap-2 modal-actions">
              <button
                type="button"
                onClick={fecharModal}
                className={modalBtnCancelClass}
                data-testid="btn-cancelar-acao-saida"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={executar.isPending || linhasElegiveis.length === 0}
                onClick={() => executar.mutate(modal)}
                className={modalBtnPrimaryClass}
                data-testid="btn-confirmar-acao-saida"
              >
                {executar.isPending ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
            </div>
          </>
        )}
      </ModalOverlay>
    </>
  )
}

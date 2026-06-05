'use client'

import { X } from 'lucide-react'
import { MonteAcoesModais } from '@/components/features/estoque/monte-acoes-modais'
import { MonteMovimentacaoResumo } from '@/components/features/estoque/monte-movimentacao-resumo'
import { monteDeveAbrirDetalhe } from '@/lib/estoque/monte-deve-abrir-detalhe'
import { STATUS_MONTE_LABELS, type StatusMonte } from '@/lib/types/status-monte'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarDataHora } from '@/lib/utils/date-time'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'
import type { Monte } from '@/repositories/estoque-repository'

type Props = {
  monte: Monte
  numeroLote: string
  nomeLiga: string
  setoresPorId: Record<string, string>
  role: UsuarioRole
  userId: string
  setores: { id: string; nome: string }[]
  destinos: { id: string; nome: string }[]
  onFechar: () => void
  onAtualizado: () => void
}

function rotuloSetor(id: string | null | undefined, mapa: Record<string, string>): string {
  if (!id) return '—'
  return mapa[id] ?? id
}

export function MonteDetalheSheet({
  monte,
  numeroLote,
  nomeLiga,
  setoresPorId,
  role,
  userId,
  setores,
  destinos,
  onFechar,
  onAtualizado,
}: Props) {
  const status = monte.status as StatusMonte
  const ctx = { userId, role }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      data-testid="monte-detalhe-sheet"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Fechar"
        onClick={onFechar}
      />
      <div className="relative bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-ios-modal sm:rounded-ios-card p-6 pb-safe shadow-xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Monte</h2>
            <p className="text-sm text-zinc-500">
              {nomeLiga} · Lote {numeroLote} · ({monte.posicao_x + 1},{monte.posicao_y + 1})
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="apple-pressable p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fechar painel"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">Status</dt>
            <dd className="font-medium">{STATUS_MONTE_LABELS[status] ?? monte.status}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Localização</dt>
            <dd className="font-medium capitalize">{monte.localizacao.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Peso atual</dt>
            <dd className="font-medium tabular-nums">{formatarKg(monte.peso_atual_kg)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Barras atuais</dt>
            <dd className="font-medium tabular-nums">{formatarNumeroPtBr(monte.barras_atuais)}</dd>
          </div>
          {monte.reservado_para && (
            <div className="col-span-2">
              <dt className="text-zinc-500">Reservado para</dt>
              <dd className="font-medium">{monte.reservado_para}</dd>
            </div>
          )}
          {monte.setor_reserva_id && (
            <div className="col-span-2">
              <dt className="text-zinc-500">Setor da reserva</dt>
              <dd className="font-medium">{rotuloSetor(monte.setor_reserva_id, setoresPorId)}</dd>
            </div>
          )}
          {monte.setor_id && (
            <div className="col-span-2">
              <dt className="text-zinc-500">Setor atual</dt>
              <dd className="font-medium">{rotuloSetor(monte.setor_id, setoresPorId)}</dd>
            </div>
          )}
          {monte.reservado_em && (
            <div className="col-span-2">
              <dt className="text-zinc-500">Reservado em</dt>
              <dd className="font-medium tabular-nums">{formatarDataHora(monte.reservado_em)}</dd>
            </div>
          )}
          {monte.movido_setor_em && (
            <div className="col-span-2">
              <dt className="text-zinc-500">Movido para setor em</dt>
              <dd className="font-medium tabular-nums">{formatarDataHora(monte.movido_setor_em)}</dd>
            </div>
          )}
        </dl>

        {monteDeveAbrirDetalhe(monte) && (
          <MonteMovimentacaoResumo
            monte={monte}
            numeroLote={numeroLote}
            setoresPorId={setoresPorId}
            ctx={ctx}
            onAtualizado={onAtualizado}
          />
        )}

        {role === 'admin' && setores.length > 0 && (
          <MonteAcoesModais
            monte={monte}
            ctx={ctx}
            setores={setores}
            destinos={destinos}
            onSucesso={onAtualizado}
          />
        )}

        {role === 'operador' && (
          <p className="text-xs text-zinc-500 mt-4">
            Operações de estoque são realizadas pelo PCP (admin).
          </p>
        )}
      </div>
    </div>
  )
}

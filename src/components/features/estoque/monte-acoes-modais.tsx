'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { ModalOverlay } from '@/components/ui/modal-overlay'
import { monteClient } from '@/lib/monte/monte-client'
import { monteTemReservaAtiva } from '@/lib/estoque/calcular-saldos'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarNumeroPtBr } from '@/lib/utils/format-number'
import type { Monte } from '@/repositories/estoque-repository'

type SetorOpcao = { id: string; nome: string }
type DestinoOpcao = { id: string; nome: string }

type Props = {
  monte: Monte
  ctx: { userId: string; role: UsuarioRole }
  setores: SetorOpcao[]
  destinos: DestinoOpcao[]
  onSucesso: () => void
}

type ModalTipo = 'reserva' | 'baixa' | 'mover' | null

export function MonteAcoesModais({
  monte,
  ctx,
  setores,
  destinos,
  onSucesso,
}: Props) {
  const [modal, setModal] = useState<ModalTipo>(null)
  const [setorReservaId, setSetorReservaId] = useState(setores[0]?.id ?? '')
  const [destinoId, setDestinoId] = useState(destinos[0]?.id ?? '')
  const [setorMoverId, setSetorMoverId] = useState(setores[0]?.id ?? '')
  const [barrasBaixa, setBarrasBaixa] = useState('')

  const invalidar = () => {
    onSucesso()
    setModal(null)
  }

  const mutationOpts = {
    onSuccess: (res: { success: boolean; message?: string }) => {
      if (res.success) {
        toast.success(res.message)
        invalidar()
      } else {
        toast.error(res.message)
      }
    },
    onError: (err: Error) => toast.error(err.message),
  }

  const reservar = useMutation({
    mutationFn: () =>
      monteClient.reservar(ctx, {
        monte_id: monte.id,
        setor_reserva_id: setorReservaId,
        updated_at: monte.updated_at,
      }),
    ...mutationOpts,
  })

  const cancelarReserva = useMutation({
    mutationFn: () =>
      monteClient.cancelarReserva(ctx, {
        monte_id: monte.id,
        updated_at: monte.updated_at,
      }),
    ...mutationOpts,
  })

  const baixa = useMutation({
    mutationFn: () => {
      const barras = Number.parseInt(barrasBaixa, 10)
      return monteClient.baixa(ctx, {
        monte_id: monte.id,
        destino_saida_id: destinoId,
        barras_baixadas: barras,
        updated_at: monte.updated_at,
      })
    },
    ...mutationOpts,
  })

  const moverSetor = useMutation({
    mutationFn: () =>
      monteClient.moverSetor(ctx, {
        monte_id: monte.id,
        setor_id: setorMoverId,
        updated_at: monte.updated_at,
      }),
    ...mutationOpts,
  })

  const devolver = useMutation({
    mutationFn: () =>
      monteClient.devolverAlmoxarifado(ctx, {
        monte_id: monte.id,
        updated_at: monte.updated_at,
      }),
    ...mutationOpts,
  })

  const consumido = monte.status === STATUS_MONTE.CONSUMIDO
  const reservado = monteTemReservaAtiva(monte)
  const noAlmoxarifado = monte.localizacao === 'almoxarifado'
  const noSetor = monte.localizacao === 'setor'

  if (noSetor) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {!consumido && (
          <button
            type="button"
            className="apple-pressable bg-zinc-200 dark:bg-zinc-800 font-medium px-4 py-3 rounded-ios-btn min-h-[44px]"
            onClick={() => devolver.mutate()}
            disabled={devolver.isPending}
            data-testid="btn-devolver-almoxarifado"
          >
            Devolver ao almoxarifado
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2 mt-4">
        {!consumido && !reservado && (
          <button
            type="button"
            className="apple-pressable bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium px-4 py-3 rounded-ios-btn min-h-[44px]"
            onClick={() => setModal('reserva')}
            data-testid="btn-reservar-monte"
          >
            Reservar
          </button>
        )}
        {reservado && (
          <button
            type="button"
            className="btn-modal-secondary w-full"
            onClick={() => cancelarReserva.mutate()}
            disabled={cancelarReserva.isPending}
            data-testid="btn-cancelar-reserva"
          >
            Cancelar reserva
          </button>
        )}
        {!consumido && monte.barras_atuais > 0 && (
          <button
            type="button"
            className="apple-pressable bg-apple-blue text-white font-medium px-4 py-3 rounded-ios-btn min-h-[44px]"
            onClick={() => {
              setBarrasBaixa(String(monte.barras_atuais))
              setModal('baixa')
            }}
            data-testid="btn-baixa-monte"
          >
            Liberar / Baixar
          </button>
        )}
        {!consumido && noAlmoxarifado && (
          <button
            type="button"
            className="btn-modal-secondary w-full"
            onClick={() => setModal('mover')}
            data-testid="btn-mover-setor"
          >
            Mover para setor
          </button>
        )}
      </div>

      {modal === 'reserva' && (
        <ModalShell titulo="Reservar monte" onFechar={() => setModal(null)}>
          <label className="text-sm font-medium">Setor</label>
          <select
            className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
            value={setorReservaId}
            onChange={(e) => setSetorReservaId(e.target.value)}
            data-testid="select-setor-reserva"
          >
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          <div className="modal-actions mt-4">
            <button
              type="button"
              className="apple-pressable w-full bg-apple-blue text-white font-medium px-4 py-3 rounded-ios-btn min-h-[44px]"
              onClick={() => reservar.mutate()}
              disabled={reservar.isPending || !setorReservaId}
            >
              Confirmar reserva
            </button>
          </div>
        </ModalShell>
      )}

      {modal === 'baixa' && (
        <ModalShell titulo="Liberar / Baixar" onFechar={() => setModal(null)}>
          <p className="text-sm text-zinc-500">
            Saldo: {formatarNumeroPtBr(monte.barras_atuais)} barras
          </p>
          <label className="text-sm font-medium mt-2">Barras a baixar</label>
          <input
            type="number"
            min={1}
            max={monte.barras_atuais}
            className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] tabular-nums min-h-[44px]"
            value={barrasBaixa}
            onChange={(e) => setBarrasBaixa(e.target.value)}
            data-testid="input-barras-baixa"
          />
          <label className="text-sm font-medium mt-2">Destino</label>
          <select
            className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
            value={destinoId}
            onChange={(e) => setDestinoId(e.target.value)}
            data-testid="select-destino-baixa"
          >
            {destinos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
          <div className="modal-actions mt-4">
            <button
              type="button"
              className="apple-pressable w-full bg-apple-blue text-white font-medium px-4 py-3 rounded-ios-btn min-h-[44px]"
              onClick={() => baixa.mutate()}
              disabled={baixa.isPending || !destinoId}
            >
              Confirmar baixa
            </button>
          </div>
        </ModalShell>
      )}

      {modal === 'mover' && (
        <ModalShell titulo="Mover para setor" onFechar={() => setModal(null)}>
          <label className="text-sm font-medium">Setor destino</label>
          <select
            className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
            value={setorMoverId}
            onChange={(e) => setSetorMoverId(e.target.value)}
            data-testid="select-setor-mover"
          >
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          <div className="modal-actions mt-4">
            <button
              type="button"
              className="apple-pressable w-full bg-apple-blue text-white font-medium px-4 py-3 rounded-ios-btn min-h-[44px]"
              onClick={() => moverSetor.mutate()}
              disabled={moverSetor.isPending || !setorMoverId}
            >
              Confirmar movimentação
            </button>
          </div>
        </ModalShell>
      )}
    </>
  )
}

function ModalShell({
  titulo,
  children,
  onFechar,
}: {
  titulo: string
  children: React.ReactNode
  onFechar: () => void
}) {
  return (
    <ModalOverlay aberto variante="sheet" nivel="nested">
      <button type="button" className="absolute inset-0" aria-label="Fechar" onClick={onFechar} />
      <div className="modal-card mobile-sheet-card max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </ModalOverlay>
  )
}

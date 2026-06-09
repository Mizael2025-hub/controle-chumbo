'use client'

import { useQuery } from '@tanstack/react-query'
import { ModalOverlay } from '@/components/ui/modal-overlay'
import { monteClient } from '@/lib/monte/monte-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarDataHora } from '@/lib/utils/date-time'
import type { Monte } from '@/repositories/estoque-repository'

type Props = {
  ctx: { userId: string; role: UsuarioRole }
  monte: Monte
  loteNumero: string
  onFechar: () => void
}

export function MonteHistoricoModal({ ctx, monte, loteNumero, onFechar }: Props) {
  const { data: linhas = [], isLoading, isError } = useQuery({
    queryKey: ['monte', 'historico', monte.id],
    queryFn: async () => {
      const res = await monteClient.listarHistorico(ctx, { monte_id: monte.id })
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  return (
    <ModalOverlay aberto variante="sheet">
      <button type="button" className="absolute inset-0" aria-label="Fechar" onClick={onFechar} />
      <div
        className="modal-card mobile-sheet-card"
        role="dialog"
        aria-modal="true"
        data-testid="monte-historico-modal"
      >
        <h3 className="text-lg font-semibold mb-1">Histórico do monte</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Lote {loteNumero} · ({monte.posicao_x + 1},{monte.posicao_y + 1})
        </p>

        {isLoading && <p className="text-sm text-zinc-500">Carregando...</p>}
        {isError && <p className="text-sm text-apple-red">Não foi possível carregar o histórico.</p>}

        {!isLoading && !isError && linhas.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhum evento registrado para este monte.</p>
        )}

        <ul className="flex flex-col gap-2">
          {linhas.map((linha) => (
            <li
              key={linha.id}
              className="text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-3"
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium">{linha.rotulo}</span>
                <span className="text-xs text-zinc-500 tabular-nums shrink-0">
                  {formatarDataHora(linha.data)}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">{linha.detalhe}</p>
              {linha.estornada && (
                <span className="text-xs text-zinc-500 mt-1 inline-block">Estornada</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </ModalOverlay>
  )
}

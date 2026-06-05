'use client'

import { useMutation } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { saidaClient } from '@/lib/saida/saida-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarDataHora } from '@/lib/utils/date-time'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'
import type { LiberacaoGrupoView } from '@/services/saida-service'

type Props = {
  grupo: LiberacaoGrupoView
  ctx: { userId: string; role: UsuarioRole }
  podeEstornar: boolean
  onEstornado: () => void
}

export function RelatorioSaidaGrupo({ grupo, ctx, podeEstornar, onEstornado }: Props) {
  const [expandido, setExpandido] = useState(false)

  const estornar = useMutation({
    mutationFn: () =>
      saidaClient.estornarLiberacao(ctx, {
        grupo_liberacao_id: grupo.grupo_liberacao_id,
        transacao_id: grupo.grupo_liberacao_id ? null : grupo.linhas[0]?.transacao_id,
      }),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message)
      else {
        toast.success(res.message)
        onEstornado()
      }
    },
  })

  const exibirEstornar =
    podeEstornar && !grupo.estornada && grupo.linhas.some((l) => !l.estornada)

  return (
    <li className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-ios-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="apple-pressable w-full flex items-center justify-between gap-3 p-4 text-left min-h-[44px]"
        data-testid={`relatorio-saida-grupo-${grupo.chave}`}
      >
        <div className="min-w-0">
          <span className="font-medium block truncate">{grupo.destino_nome}</span>
          {grupo.observacao && (
            <span className="text-xs text-zinc-500 block mt-0.5 line-clamp-2">{grupo.observacao}</span>
          )}
          <span className="text-xs text-zinc-500 block">
            {formatarDataHora(grupo.data_transacao)} · {formatarNumeroPtBr(grupo.total_barras)}{' '}
            barras · {formatarKg(grupo.total_peso_kg)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {grupo.estornada ? (
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
              Estornada
            </span>
          ) : (
            <span className="text-xs font-medium text-apple-green bg-apple-green/10 px-2 py-1 rounded-full">
              Ativa
            </span>
          )}
          {expandido ? (
            <ChevronUp className="h-5 w-5 text-zinc-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-400" />
          )}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 pb-4 pt-2 space-y-3">
          <ul className="text-sm space-y-2">
            {grupo.linhas.map((linha) => (
              <li key={linha.transacao_id} className="flex justify-between gap-2">
                <span>
                  Lote {linha.lote_numero} {linha.posicao_label}
                  {linha.estornada ? ' (estornada)' : ''}
                </span>
                <span className="text-zinc-500 tabular-nums shrink-0">
                  {formatarNumeroPtBr(linha.barras_baixadas)} br · {formatarKg(linha.peso_baixado_kg)}
                </span>
              </li>
            ))}
          </ul>
          {exibirEstornar && (
            <button
              type="button"
              disabled={estornar.isPending}
              onClick={() => {
                if (
                  confirm('Estornar esta liberação? O saldo dos montes será restaurado.')
                ) {
                  estornar.mutate()
                }
              }}
              className="apple-pressable inline-flex items-center gap-2 text-apple-red font-medium text-sm min-h-[44px] px-2"
              data-testid={`btn-estornar-relatorio-${grupo.chave}`}
            >
              <RotateCcw className="h-4 w-4" />
              Estornar liberação
            </button>
          )}
        </div>
      )}
    </li>
  )
}

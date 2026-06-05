import type { QueryClient } from '@tanstack/react-query'
import { calcularPesoBaixado } from '@/lib/monte/calcular-baixa'
import type { VisaoEstoque } from '@/services/estoque-service'

type AtualizacaoMonte = {
  monte_id: string
  barras_baixadas?: number
}

/** Atualização otimista dos saldos na grade após operações na saída. */
export function aplicarAtualizacaoOtimistaEstoque(
  queryClient: QueryClient,
  atualizacoes: AtualizacaoMonte[]
): void {
  if (atualizacoes.length === 0) return

  const porId = new Map(atualizacoes.map((a) => [a.monte_id, a]))

  queryClient.setQueryData<VisaoEstoque | undefined>(['estoque', 'visao'], (antigo) => {
    if (!antigo) return antigo

    return {
      ...antigo,
      ligas: antigo.ligas.map((liga) => ({
        ...liga,
        lotes: liga.lotes.map((lote) => ({
          ...lote,
          montes: lote.montes.map((monte) => {
            const patch = porId.get(monte.id)
            if (!patch || patch.barras_baixadas === undefined) return monte

            const barras = Math.max(0, monte.barras_atuais - patch.barras_baixadas)
            const peso =
              barras === 0
                ? 0
                : Math.round(
                    (monte.peso_atual_kg -
                      calcularPesoBaixado(
                        monte.peso_atual_kg,
                        monte.barras_atuais,
                        patch.barras_baixadas
                      )) *
                      100
                  ) / 100

            return {
              ...monte,
              barras_atuais: barras,
              peso_atual_kg: peso,
              status: barras === 0 ? 'CONSUMIDO' : monte.status === 'CONSUMIDO' ? 'CONSUMIDO' : 'PARCIAL',
            }
          }),
        })),
      })),
    }
  })
}

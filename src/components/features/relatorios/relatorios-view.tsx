'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, FileBarChart, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { RelatorioDetalheSheet } from '@/components/features/relatorios/relatorio-detalhe-sheet'
import {
  RelatorioFiltrosSheet,
  categoriasParaConsultaUrl,
  type RelatorioFiltrosAplicados,
} from '@/components/features/relatorios/relatorio-filtros-sheet'
import { RelatorioResumoCard } from '@/components/features/relatorios/relatorio-resumo-card'
import { RelatorioSaidaGrupo } from '@/components/features/relatorios/relatorio-saida-grupo'
import { useRelatorioFiltros } from '@/hooks/use-relatorio-filtros'
import {
  calcularTotaisRelatorio,
  contarFiltrosAtivos,
  filtrarResultadoRelatorio,
} from '@/lib/relatorio/filtros-relatorio'
import { relatorioClient } from '@/lib/relatorio/relatorio-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarData, formatarDataHora } from '@/lib/utils/date-time'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'
import type {
  ConsumoRelatorioLinha,
  EntradaRelatorioLinha,
  EventoRelatorioLinha,
  RelatorioResultado,
} from '@/services/relatorio-service'
import type { LiberacaoGrupoView } from '@/services/saida-service'
import {
  ABAS_RELATORIO,
  type AbaRelatorio,
} from '@/validations/relatorio/relatorio-schema'

const ROTULOS_ABA: Record<AbaRelatorio, string> = {
  entradas: 'Entradas',
  saidas: 'Saídas',
  reservas: 'Reservas',
  consumo: 'Consumo',
}

const ABAS_COM_RESUMO: AbaRelatorio[] = ['entradas', 'saidas', 'consumo']

type Props = {
  ctx: { userId: string; role: UsuarioRole }
}

export function RelatoriosView({ ctx }: Props) {
  const {
    aba,
    de,
    ate,
    consulta,
    filtrosAvancados,
    aplicarFiltros,
    limparTodosFiltros,
  } = useRelatorioFiltros()
  const queryClient = useQueryClient()
  const [detalheEntradaId, setDetalheEntradaId] = useState<string | null>(null)
  const [detalheConsumoId, setDetalheConsumoId] = useState<string | null>(null)
  const [detalheEvento, setDetalheEvento] = useState<EventoRelatorioLinha | null>(null)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  const { data: resultadoBruto, isLoading, isError } = useQuery({
    queryKey: ['relatorio', { aba, de, ate }],
    queryFn: async () => {
      const res = await relatorioClient.consultar(ctx, { aba, de, ate, setor: '', destino: '', maquina: '', operador: '', liga: '', turno: '' })
      if (!res.success) throw new Error(res.message)
      return res.data
    },
  })

  const resultadoFiltrado = useMemo<RelatorioResultado | undefined>(() => {
    if (!resultadoBruto) return undefined
    return filtrarResultadoRelatorio(resultadoBruto, filtrosAvancados)
  }, [resultadoBruto, filtrosAvancados])

  const totais = useMemo(() => {
    if (!resultadoFiltrado || !ABAS_COM_RESUMO.includes(resultadoFiltrado.aba)) {
      return { totalPesoKg: 0, totalBarras: 0 }
    }
    return calcularTotaisRelatorio(resultadoFiltrado.aba, resultadoFiltrado.linhas)
  }, [resultadoFiltrado])

  const filtrosAtivosCount = contarFiltrosAtivos(aba, filtrosAvancados)
  const exibirResumo =
    resultadoFiltrado &&
    ABAS_COM_RESUMO.includes(resultadoFiltrado.aba) &&
    resultadoFiltrado.linhas.length > 0

  const exportarCsv = useMutation({
    mutationFn: () => relatorioClient.exportarCsv(ctx, consulta),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message)
        return
      }
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio-${aba}-${de.replace(/\//g, '-')}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exportado.')
    },
  })

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['relatorio'] })
    queryClient.invalidateQueries({ queryKey: ['saida'] })
  }

  const aplicarFiltrosCompletos = (filtros: RelatorioFiltrosAplicados) => {
    const urlCategorias = categoriasParaConsultaUrl(filtros.categorias)
    aplicarFiltros({
      de: filtros.de,
      ate: filtros.ate,
      ...urlCategorias,
    })
  }

  const podeExportar = ctx.role === 'admin'

  return (
    <div className="flex flex-1 flex-col p-4 max-w-5xl mx-auto w-full pb-8">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <FileBarChart className="h-6 w-6 text-apple-blue" strokeWidth={1.5} />
              Relatórios
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Filtros por período e exportação CSV</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFiltrosAbertos(true)}
            className="apple-pressable relative inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 font-medium px-4 py-2 rounded-ios-btn min-h-[44px] text-sm"
            data-testid="btn-filtros-relatorio"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            Filtros
            {filtrosAtivosCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-apple-blue text-white text-[11px] font-semibold flex items-center justify-center">
                {filtrosAtivosCount}
              </span>
            )}
          </button>
          {podeExportar && (
            <button
              type="button"
              disabled={exportarCsv.isPending || isLoading}
              onClick={() => exportarCsv.mutate()}
              className="apple-pressable inline-flex items-center gap-2 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px] text-sm"
              data-testid="btn-exportar-csv"
            >
              <Download className="h-4 w-4" strokeWidth={1.5} />
              CSV
            </button>
          )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-ios-btn overflow-x-auto">
        {ABAS_RELATORIO.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => aplicarFiltros({ aba: item })}
            className={`flex-1 min-w-[88px] min-h-[44px] rounded-ios-btn text-sm font-medium whitespace-nowrap px-2 ${
              aba === item ? 'mobile-tab-ativa' : 'mobile-tab-inativa'
            }`}
            data-testid={`aba-relatorio-${item}`}
          >
            {ROTULOS_ABA[item]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading && <p className="text-zinc-500 text-center py-8">Carregando relatório...</p>}
        {isError && (
          <p className="text-apple-red text-center py-8">Não foi possível carregar o relatório.</p>
        )}

        {!isLoading && !isError && exibirResumo && (
          <RelatorioResumoCard
            totalPesoKg={totais.totalPesoKg}
            totalBarras={totais.totalBarras}
          />
        )}

        {!isLoading && !isError && resultadoFiltrado?.aba === 'entradas' && (
          <>
            {resultadoFiltrado.linhas.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhuma entrada no período.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {(resultadoFiltrado.linhas as EntradaRelatorioLinha[]).map((linha) => (
                  <li key={linha.id}>
                    <button
                      type="button"
                      onClick={() => setDetalheEntradaId(linha.id)}
                      className="apple-pressable w-full text-left mobile-page-card rounded-ios-card p-4 min-h-[44px]"
                      data-testid={`relatorio-entrada-${linha.id}`}
                    >
                      <span className="font-medium block">
                        Lote {linha.numero_lote} · {linha.liga_nome}
                      </span>
                      <span className="text-xs text-zinc-500 block mt-1">
                        {formatarData(linha.data_chegada)} · {formatarKg(linha.peso_inicial_kg)} ·{' '}
                        {formatarNumeroPtBr(linha.barras_iniciais)} barras ·{' '}
                        {formatarNumeroPtBr(linha.qtd_montes)} montes
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {!isLoading && !isError && resultadoFiltrado?.aba === 'saidas' && (
          <>
            {resultadoFiltrado.linhas.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhuma saída no período.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {(resultadoFiltrado.linhas as LiberacaoGrupoView[]).map((grupo) => (
                  <RelatorioSaidaGrupo
                    key={grupo.chave}
                    grupo={grupo}
                    ctx={ctx}
                    podeEstornar={ctx.role === 'admin'}
                    onEstornado={invalidar}
                  />
                ))}
              </ul>
            )}
          </>
        )}

        {!isLoading && !isError && resultadoFiltrado?.aba === 'reservas' && (
          <>
            {resultadoFiltrado.linhas.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhum evento no período.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {(resultadoFiltrado.linhas as EventoRelatorioLinha[]).map((linha) => (
                  <li key={linha.id}>
                    <button
                      type="button"
                      onClick={() => setDetalheEvento(linha)}
                      className="apple-pressable w-full text-left mobile-page-card rounded-ios-card p-4 min-h-[44px]"
                      data-testid={`relatorio-evento-${linha.id}`}
                    >
                      <span className="font-medium block">{linha.tipo_rotulo}</span>
                      <span className="text-xs text-zinc-500 block mt-1">
                        {formatarDataHora(linha.data_evento)} · Lote {linha.lote_numero}{' '}
                        {linha.posicao_label} · {linha.destinatario}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {!isLoading && !isError && resultadoFiltrado?.aba === 'consumo' && (
          <>
            {resultadoFiltrado.linhas.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhum consumo no período.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {(resultadoFiltrado.linhas as ConsumoRelatorioLinha[]).map((linha) => (
                  <li key={linha.id}>
                    <button
                      type="button"
                      onClick={() => setDetalheConsumoId(linha.id)}
                      className="apple-pressable w-full text-left mobile-page-card rounded-ios-card p-4 min-h-[44px]"
                      data-testid={`relatorio-consumo-${linha.id}`}
                    >
                      <span className="font-medium block">
                        {formatarData(linha.data_consumo)} · {linha.nome_setor}
                      </span>
                      <span className="text-xs text-zinc-500 block mt-1">
                        {linha.nome_operador} · {linha.nome_maquina} · {linha.nome_turno} ·{' '}
                        {formatarNumeroPtBr(linha.barras)} barras · {formatarKg(linha.peso_kg)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {filtrosAbertos && (
        <RelatorioFiltrosSheet
          aba={aba}
          de={de}
          ate={ate}
          resultado={resultadoBruto}
          filtrosAtivos={filtrosAvancados}
          onAplicar={aplicarFiltrosCompletos}
          onLimpar={limparTodosFiltros}
          onFechar={() => setFiltrosAbertos(false)}
        />
      )}

      {detalheEntradaId && (
        <RelatorioDetalheSheet
          tipo="entrada"
          id={detalheEntradaId}
          ctx={ctx}
          onFechar={() => setDetalheEntradaId(null)}
        />
      )}

      {detalheConsumoId && (
        <RelatorioDetalheSheet
          tipo="consumo"
          id={detalheConsumoId}
          ctx={ctx}
          onFechar={() => setDetalheConsumoId(null)}
        />
      )}

      {detalheEvento && (
        <RelatorioDetalheSheet
          tipo="evento"
          titulo={detalheEvento.tipo_rotulo}
          subtitulo={`Lote ${detalheEvento.lote_numero} ${detalheEvento.posicao_label}`}
          linhas={[
            { rotulo: 'Data', valor: formatarDataHora(detalheEvento.data_evento) },
            { rotulo: 'Destinatário', valor: detalheEvento.destinatario },
            { rotulo: 'Monte', valor: detalheEvento.monte_id.slice(0, 8) + '…' },
          ]}
          onFechar={() => setDetalheEvento(null)}
        />
      )}
    </div>
  )
}

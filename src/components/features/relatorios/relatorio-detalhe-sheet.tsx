'use client'

import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { ModalOverlay } from '@/components/ui/modal-overlay'
import { relatorioClient } from '@/lib/relatorio/relatorio-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { formatarData, formatarDataHora } from '@/lib/utils/date-time'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'

type PropsEntrada = {
  tipo: 'entrada'
  id: string
  ctx: { userId: string; role: UsuarioRole }
  onFechar: () => void
}

type PropsConsumo = {
  tipo: 'consumo'
  id: string
  ctx: { userId: string; role: UsuarioRole }
  onFechar: () => void
}

type PropsEvento = {
  tipo: 'evento'
  titulo: string
  subtitulo: string
  linhas: { rotulo: string; valor: string }[]
  onFechar: () => void
}

type Props = PropsEntrada | PropsConsumo | PropsEvento

export function RelatorioDetalheSheet(props: Props) {
  if (props.tipo === 'evento') {
    return <SheetEvento {...props} />
  }
  if (props.tipo === 'entrada') {
    return <SheetEntrada {...props} />
  }
  return <SheetConsumo {...props} />
}

function SheetShell({
  titulo,
  subtitulo,
  onFechar,
  children,
}: {
  titulo: string
  subtitulo?: string
  onFechar: () => void
  children: ReactNode
}) {
  return (
    <ModalOverlay aberto variante="sheet">
      <button type="button" className="absolute inset-0" aria-label="Fechar" onClick={onFechar} />
      <div
        className="modal-card mobile-sheet-card"
        role="dialog"
        aria-modal="true"
        data-testid="relatorio-detalhe-sheet"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold">{titulo}</h3>
            {subtitulo && <p className="text-sm text-zinc-500 mt-1">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fechar painel"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </ModalOverlay>
  )
}

function LinhaDetalhe({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-zinc-500">{rotulo}</span>
      <span className="font-medium text-right">{valor}</span>
    </div>
  )
}

function SheetEvento({ titulo, subtitulo, linhas, onFechar }: PropsEvento) {
  return (
    <SheetShell titulo={titulo} subtitulo={subtitulo} onFechar={onFechar}>
      {linhas.map((l) => (
        <LinhaDetalhe key={l.rotulo} rotulo={l.rotulo} valor={l.valor} />
      ))}
    </SheetShell>
  )
}

function SheetEntrada({ id, ctx, onFechar }: PropsEntrada) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['relatorio', 'entrada', id],
    queryFn: async () => {
      const res = await relatorioClient.buscarEntradaDetalhe(ctx, id)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
  })

  return (
    <SheetShell
      titulo="Detalhe da entrada"
      subtitulo={data ? `Lote ${data.numero_lote}` : undefined}
      onFechar={onFechar}
    >
      {isLoading && <p className="text-sm text-zinc-500">Carregando...</p>}
      {isError && <p className="text-sm text-apple-red">Não foi possível carregar o detalhe.</p>}
      {data && (
        <>
          <LinhaDetalhe rotulo="Liga" valor={data.liga_nome} />
          <LinhaDetalhe rotulo="Data chegada" valor={formatarData(data.data_chegada)} />
          <LinhaDetalhe rotulo="Peso inicial" valor={formatarKg(data.peso_inicial_kg)} />
          <LinhaDetalhe
            rotulo="Barras iniciais"
            valor={formatarNumeroPtBr(data.barras_iniciais)}
          />
          <LinhaDetalhe rotulo="Montes na grade" valor={formatarNumeroPtBr(data.qtd_montes)} />
          <LinhaDetalhe rotulo="Registrado em" valor={formatarDataHora(data.created_at)} />
        </>
      )}
    </SheetShell>
  )
}

function SheetConsumo({ id, ctx, onFechar }: PropsConsumo) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['relatorio', 'consumo', id],
    queryFn: async () => {
      const res = await relatorioClient.buscarConsumoDetalhe(ctx, id)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
  })

  return (
    <SheetShell
      titulo="Detalhe do consumo"
      subtitulo={data ? formatarData(data.data_consumo) : undefined}
      onFechar={onFechar}
    >
      {isLoading && <p className="text-sm text-zinc-500">Carregando...</p>}
      {isError && <p className="text-sm text-apple-red">Não foi possível carregar o detalhe.</p>}
      {data && (
        <>
          <LinhaDetalhe rotulo="Setor" valor={data.nome_setor} />
          <LinhaDetalhe rotulo="Operador" valor={data.nome_operador} />
          <LinhaDetalhe rotulo="Turno" valor={data.nome_turno} />
          <LinhaDetalhe rotulo="Máquina" valor={data.nome_maquina} />
          <LinhaDetalhe rotulo="Modelo" valor={data.nome_modelo_produto} />
          <LinhaDetalhe rotulo="Lote" valor={data.numero_lote_snapshot} />
          <LinhaDetalhe rotulo="Barras" valor={formatarNumeroPtBr(data.barras)} />
          <LinhaDetalhe rotulo="Peso" valor={formatarKg(data.peso_kg)} />
          <LinhaDetalhe rotulo="Borra" valor={formatarKg(data.borra_kg)} />
          <LinhaDetalhe rotulo="Modo" valor={data.modo_selecao_montes} />
          {data.observacoes && (
            <LinhaDetalhe rotulo="Observações" valor={data.observacoes} />
          )}
          {data.alocacoes.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Alocações por monte</p>
              <ul className="text-sm space-y-2">
                {data.alocacoes.map((a) => (
                  <li
                    key={a.monte_id}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3"
                  >
                    Lote {a.lote_numero} {a.posicao_label} ·{' '}
                    {formatarNumeroPtBr(a.barras_baixadas)} br · {formatarKg(a.peso_baixado_kg)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </SheetShell>
  )
}

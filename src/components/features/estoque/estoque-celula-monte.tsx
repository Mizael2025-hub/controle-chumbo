import { Check } from 'lucide-react'
import {
  CHAVE_COR_CLASSES,
  type ChaveCorLiga,
  isChaveCorLiga,
} from '@/lib/types/chave-cor-liga'
import { monteTemReservaAtiva } from '@/lib/estoque/calcular-saldos'
import { STATUS_MONTE, STATUS_MONTE_LABELS, type StatusMonte } from '@/lib/types/status-monte'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'
import type { Monte } from '@/repositories/estoque-repository'

const BORDA_RESERVA =
  'border-4 border-blue-700 dark:border-blue-400 shadow-[0_0_0_1px_rgba(29,78,216,0.35)]'
const BORDA_MOVIDO = 'border-4 border-yellow-400 dark:border-yellow-500'
const BORDA_PADRAO = 'border-2 border-black/10 dark:border-white/10'

/** Destaque de seleção na grade (admin) — visível em qualquer cor de liga. */
const CLASSES_CELULA_SELECIONADA =
  'relative z-10 scale-[1.03] ring-4 ring-apple-blue ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 shadow-[0_4px_14px_rgba(0,122,255,0.45)]'

type Props = {
  monte: Monte | null
  chaveCorLiga: string
  posicaoX: number
  posicaoY: number
  podeArrastar?: boolean
  selecionado?: boolean
  selecionavel?: boolean
  onSelecionar?: (monte: Monte) => void
  onToggleSelecao?: (monte: Monte) => void
  onConsultarMonte?: (monte: Monte) => void
  onSoltarMonte?: (monteId: string, destinoX: number, destinoY: number) => void
}

function classesEstadoVisual(monte: Monte, status: StatusMonte): string {
  if (status === STATUS_MONTE.CONSUMIDO) {
    return 'bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600'
  }

  if (monte.localizacao === 'setor') {
    return `${BORDA_MOVIDO} opacity-55 saturate-75`
  }

  if (status === STATUS_MONTE.RESERVADO || monteTemReservaAtiva(monte)) {
    return BORDA_RESERVA
  }

  if (status === STATUS_MONTE.PARCIAL) {
    return 'border-2 border-zinc-500 dark:border-zinc-400'
  }

  return BORDA_PADRAO
}

export function EstoqueCelulaMonte({
  monte,
  chaveCorLiga,
  posicaoX,
  posicaoY,
  podeArrastar,
  selecionado = false,
  selecionavel = false,
  onSelecionar,
  onToggleSelecao,
  onConsultarMonte,
  onSoltarMonte,
}: Props) {
  const handleDragOver = (e: React.DragEvent) => {
    if (podeArrastar && onSoltarMonte) e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const monteId = e.dataTransfer.getData('monteId')
    if (monteId && onSoltarMonte) onSoltarMonte(monteId, posicaoX, posicaoY)
  }

  if (!monte) {
    return (
      <div
        className={`min-h-[72px] rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 ${
          podeArrastar ? 'ring-1 ring-transparent hover:ring-apple-blue/30' : ''
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-testid={`celula-vazia-${posicaoX}-${posicaoY}`}
        aria-hidden={!podeArrastar}
      />
    )
  }

  const status = monte.status as StatusMonte
  const consumido = status === STATUS_MONTE.CONSUMIDO
  const corFundo = consumido
    ? ''
    : isChaveCorLiga(chaveCorLiga)
      ? CHAVE_COR_CLASSES[chaveCorLiga as ChaveCorLiga]
      : 'bg-zinc-300'
  const textoEscuro =
    chaveCorLiga === 'branco' || chaveCorLiga === 'amarelo' || chaveCorLiga === 'sem_cor'
  const arrastavel =
    podeArrastar && !consumido && !selecionavel && monte.localizacao === 'almoxarifado'
  const clicavel = selecionavel || Boolean(onConsultarMonte) || Boolean(onSelecionar)

  const handleClick = () => {
    if (selecionavel && onToggleSelecao) {
      onToggleSelecao(monte)
      return
    }
    if (onConsultarMonte) {
      onConsultarMonte(monte)
      return
    }
    onSelecionar?.(monte)
  }

  return (
    <button
      type="button"
      draggable={arrastavel}
      disabled={selecionavel && consumido}
      onDragStart={(e) => {
        if (!arrastavel) return
        e.dataTransfer.setData('monteId', monte.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={clicavel ? handleClick : undefined}
      aria-pressed={selecionavel ? selecionado : undefined}
      data-selecionado={selecionado ? 'true' : 'false'}
      className={`apple-pressable min-h-[72px] w-full rounded-lg p-2 text-left flex flex-col justify-between box-border overflow-visible ${corFundo} ${classesEstadoVisual(monte, status)} ${
        selecionado ? CLASSES_CELULA_SELECIONADA : ''
      } ${
        consumido
          ? 'text-zinc-500 dark:text-zinc-400'
          : textoEscuro
            ? 'text-zinc-900 shadow-sm'
            : 'text-white shadow-sm'
      } ${arrastavel ? 'cursor-grab active:cursor-grabbing' : ''} ${
        selecionavel && consumido ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      data-testid={`celula-monte-${monte.posicao_x}-${monte.posicao_y}`}
      aria-label={`Monte posição ${monte.posicao_x + 1},${monte.posicao_y + 1}, ${STATUS_MONTE_LABELS[status] ?? status}${selecionado ? ', selecionado' : ''}`}
    >
      {selecionado && (
        <span
          className="absolute -top-1.5 -right-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-apple-blue text-white shadow-md border-2 border-white dark:border-zinc-900 pointer-events-none"
          aria-hidden
          data-testid="celula-monte-selecionado-badge"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      <span className="text-[10px] font-medium opacity-90 tabular-nums">
        {monte.posicao_x + 1},{monte.posicao_y + 1}
      </span>
      {!consumido ? (
        <>
          <span className="text-xs font-semibold tabular-nums leading-tight">
            {formatarKg(monte.peso_atual_kg)}
          </span>
          <span className="text-[10px] opacity-90 tabular-nums">
            {formatarNumeroPtBr(monte.barras_atuais)} barras
          </span>
        </>
      ) : (
        <span className="text-[10px] font-medium">Baixa total</span>
      )}
    </button>
  )
}

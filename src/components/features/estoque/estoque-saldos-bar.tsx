import type { SaldosEstoque } from '@/lib/estoque/calcular-saldos'
import { formatarKg, formatarNumeroPtBr } from '@/lib/utils/format-number'

type Props = {
  saldos: SaldosEstoque
  /** Grade 3 colunas em uma linha (cards de lote). */
  compacto?: boolean
}

function RotuloSaldo({ rotulo, rotuloLinhas }: { rotulo?: string; rotuloLinhas?: [string, string] }) {
  const classe =
    'text-[11px] uppercase tracking-wide text-zinc-500 leading-tight'

  if (rotuloLinhas) {
    return (
      <span className={`${classe} flex flex-col`}>
        <span>{rotuloLinhas[0]}</span>
        <span>{rotuloLinhas[1]}</span>
      </span>
    )
  }

  return <span className={`${classe} whitespace-nowrap`}>{rotulo}</span>
}

function ItemSaldo({
  rotulo,
  rotuloLinhas,
  pesoKg,
  barras,
  destaque,
}: {
  rotulo?: string
  rotuloLinhas?: [string, string]
  pesoKg: number
  barras: number
  destaque?: 'blue' | 'amber' | 'zinc'
}) {
  const cor =
    destaque === 'blue'
      ? 'text-apple-blue'
      : destaque === 'amber'
        ? 'text-amber-600'
        : 'text-zinc-600 dark:text-zinc-400'

  return (
    <div className="flex flex-col min-w-0 shrink-0">
      <RotuloSaldo rotulo={rotulo} rotuloLinhas={rotuloLinhas} />
      <span className={`font-semibold tabular-nums text-sm ${cor}`}>{formatarKg(pesoKg)}</span>
      <span className="text-xs text-zinc-500 tabular-nums">
        {formatarNumeroPtBr(barras)} barras
      </span>
    </div>
  )
}

export function EstoqueSaldosBar({ saldos, compacto = false }: Props) {
  return (
    <div
      className={`bg-zinc-50 dark:bg-zinc-800/50 rounded-ios-card p-3 border border-zinc-200/80 dark:border-zinc-700/80 ${
        compacto ? 'grid grid-cols-3 gap-2' : 'flex flex-row flex-wrap gap-x-5 gap-y-3'
      }`}
      data-testid="estoque-saldos-bar"
    >
      <ItemSaldo rotulo="No estoque" pesoKg={saldos.no_estoque.peso_kg} barras={saldos.no_estoque.barras} />
      <ItemSaldo
        rotuloLinhas={['Reservado', 'no estoque']}
        pesoKg={saldos.reservado.peso_kg}
        barras={saldos.reservado.barras}
        destaque="amber"
      />
      <ItemSaldo
        rotulo="No setor"
        pesoKg={saldos.no_setor.peso_kg}
        barras={saldos.no_setor.barras}
        destaque="blue"
      />
    </div>
  )
}

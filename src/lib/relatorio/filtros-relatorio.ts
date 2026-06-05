import type {
  ConsumoRelatorioLinha,
  EntradaRelatorioLinha,
  EventoRelatorioLinha,
  RelatorioResultado,
} from '@/services/relatorio-service'
import type { LiberacaoGrupoView } from '@/services/saida-service'
import type { AbaRelatorio } from '@/validations/relatorio/relatorio-schema'

export const DIMENSOES_FILTRO = [
  'setor',
  'destino',
  'maquina',
  'operador',
  'liga',
  'turno',
] as const

export type DimensaoFiltroRelatorio = (typeof DIMENSOES_FILTRO)[number]

export type RelatorioFiltrosAvancados = Partial<Record<DimensaoFiltroRelatorio, string[]>>

export const SEPARADOR_FILTRO_URL = '|'

export const ROTULOS_DIMENSAO: Record<DimensaoFiltroRelatorio, string> = {
  setor: 'Setor',
  destino: 'Destino de saída',
  maquina: 'Máquinas',
  operador: 'Operador',
  liga: 'Liga',
  turno: 'Turno',
}

export const DIMENSOES_POR_ABA: Record<AbaRelatorio, DimensaoFiltroRelatorio[]> = {
  entradas: ['liga'],
  saidas: ['destino', 'liga', 'setor'],
  consumo: ['setor', 'maquina', 'operador', 'liga', 'turno'],
  reservas: [],
}

export type RelatorioItemFiltravel = {
  original: unknown
  setor?: string
  setores?: string[]
  destino?: string
  maquina?: string
  operador?: string
  liga?: string
  ligas?: string[]
  turno?: string
}

export function parsearValoresFiltroUrl(valor: string | undefined): string[] {
  if (!valor?.trim()) return []
  return [...new Set(valor.split(SEPARADOR_FILTRO_URL).map((v) => v.trim()).filter(Boolean))]
}

export function serializarValoresFiltroUrl(valores: string[] | undefined): string {
  if (!valores?.length) return ''
  return [...new Set(valores.filter(Boolean))].join(SEPARADOR_FILTRO_URL)
}

export function filtrosAvancadosDeUrl(input: {
  setor?: string
  destino?: string
  maquina?: string
  operador?: string
  liga?: string
  turno?: string
}): RelatorioFiltrosAvancados {
  const filtros: RelatorioFiltrosAvancados = {}
  for (const dim of DIMENSOES_FILTRO) {
    const valores = parsearValoresFiltroUrl(input[dim])
    if (valores.length > 0) filtros[dim] = valores
  }
  return filtros
}

function valorDimensao(item: RelatorioItemFiltravel, dim: DimensaoFiltroRelatorio): string | undefined {
  switch (dim) {
    case 'setor':
      return item.setor
    case 'destino':
      return item.destino
    case 'maquina':
      return item.maquina
    case 'operador':
      return item.operador
    case 'liga':
      return item.liga
    case 'turno':
      return item.turno
    default:
      return undefined
  }
}

function itemAtendeValorDimensao(
  item: RelatorioItemFiltravel,
  dim: DimensaoFiltroRelatorio,
  valor: string
): boolean {
  if (dim === 'liga' && item.ligas?.length) {
    return item.ligas.includes(valor)
  }
  if (dim === 'setor' && item.setores?.length) {
    return item.setores.includes(valor)
  }
  return valorDimensao(item, dim) === valor
}

function itemAtendeDimensao(
  item: RelatorioItemFiltravel,
  dim: DimensaoFiltroRelatorio,
  valores: string[]
): boolean {
  if (valores.length === 0) return true
  return valores.some((valor) => itemAtendeValorDimensao(item, dim, valor))
}

export function normalizarLinhaParaFiltro(
  aba: AbaRelatorio,
  linha: unknown
): RelatorioItemFiltravel {
  switch (aba) {
    case 'entradas': {
      const item = linha as EntradaRelatorioLinha
      return { original: linha, liga: item.liga_nome }
    }
    case 'saidas': {
      const item = linha as LiberacaoGrupoView
      return {
        original: linha,
        destino: item.destino_nome,
        ligas: item.ligas,
        setores: item.setores,
      }
    }
    case 'consumo': {
      const item = linha as ConsumoRelatorioLinha
      return {
        original: linha,
        setor: item.nome_setor,
        maquina: item.nome_maquina,
        operador: item.nome_operador,
        liga: item.liga_nome,
        turno: item.nome_turno,
      }
    }
    case 'reservas': {
      return { original: linha }
    }
  }
}

export function normalizarLinhasParaFiltro(
  aba: AbaRelatorio,
  linhas: unknown[]
): RelatorioItemFiltravel[] {
  return linhas.map((linha) => normalizarLinhaParaFiltro(aba, linha))
}

export function aplicarFiltrosAvancados<T>(
  itens: RelatorioItemFiltravel[],
  filtros: RelatorioFiltrosAvancados
): T[] {
  const filtrosAtivos = DIMENSOES_FILTRO.filter((dim) => (filtros[dim]?.length ?? 0) > 0)

  if (filtrosAtivos.length === 0) {
    return itens.map((item) => item.original as T)
  }

  return itens
    .filter((item) =>
      filtrosAtivos.every((dim) => itemAtendeDimensao(item, dim, filtros[dim] ?? []))
    )
    .map((item) => item.original as T)
}

export function calcularOpcoesCascata(
  itens: RelatorioItemFiltravel[],
  filtros: RelatorioFiltrosAvancados,
  dimensaoAlvo: DimensaoFiltroRelatorio
): string[] {
  const filtrosParciais: RelatorioFiltrosAvancados = { ...filtros }
  delete filtrosParciais[dimensaoAlvo]

  const itensParciais = itens.filter((item) =>
    DIMENSOES_FILTRO.every((dim) => {
      if (dim === dimensaoAlvo) return true
      return itemAtendeDimensao(item, dim, filtrosParciais[dim] ?? [])
    })
  )

  const valores = new Set<string>()
  for (const item of itensParciais) {
    if (dimensaoAlvo === 'liga' && item.ligas?.length) {
      for (const liga of item.ligas) valores.add(liga)
      continue
    }
    if (dimensaoAlvo === 'setor' && item.setores?.length) {
      for (const setor of item.setores) valores.add(setor)
      continue
    }
    const valor = valorDimensao(item, dimensaoAlvo)
    if (valor) valores.add(valor)
  }

  return [...valores].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function filtrarResultadoRelatorio(
  resultado: RelatorioResultado,
  filtros: RelatorioFiltrosAvancados
): RelatorioResultado {
  const itens = normalizarLinhasParaFiltro(resultado.aba, resultado.linhas)

  switch (resultado.aba) {
    case 'entradas':
      return {
        aba: 'entradas',
        linhas: aplicarFiltrosAvancados<EntradaRelatorioLinha>(itens, filtros),
      }
    case 'saidas':
      return {
        aba: 'saidas',
        linhas: aplicarFiltrosAvancados<LiberacaoGrupoView>(itens, filtros),
      }
    case 'reservas':
      return {
        aba: 'reservas',
        linhas: aplicarFiltrosAvancados<EventoRelatorioLinha>(itens, filtros),
      }
    case 'consumo':
      return {
        aba: 'consumo',
        linhas: aplicarFiltrosAvancados<ConsumoRelatorioLinha>(itens, filtros),
      }
  }
}

export function calcularTotaisRelatorio(
  aba: AbaRelatorio,
  linhas: unknown[]
): { totalPesoKg: number; totalBarras: number } {
  if (linhas.length === 0) {
    return { totalPesoKg: 0, totalBarras: 0 }
  }

  let totalPesoKg = 0
  let totalBarras = 0

  switch (aba) {
    case 'entradas':
      for (const linha of linhas as EntradaRelatorioLinha[]) {
        totalPesoKg += linha.peso_inicial_kg
        totalBarras += linha.barras_iniciais
      }
      break
    case 'saidas':
      for (const linha of linhas as LiberacaoGrupoView[]) {
        totalPesoKg += linha.total_peso_kg
        totalBarras += linha.total_barras
      }
      break
    case 'consumo':
      for (const linha of linhas as ConsumoRelatorioLinha[]) {
        totalPesoKg += linha.peso_kg
        totalBarras += linha.barras
      }
      break
    default:
      break
  }

  return {
    totalPesoKg: Math.round(totalPesoKg * 100) / 100,
    totalBarras,
  }
}

export function contarFiltrosAtivos(
  aba: AbaRelatorio,
  filtros: RelatorioFiltrosAvancados
): number {
  return DIMENSOES_POR_ABA[aba].reduce(
    (total, dim) => total + (filtros[dim]?.length ?? 0),
    0
  )
}

export function filtrosAvancadosVazios(): RelatorioFiltrosAvancados {
  return {}
}

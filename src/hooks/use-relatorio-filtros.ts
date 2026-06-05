'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { useRelatorioFiltrosStore } from '@/stores/relatorio-filtros-store'
import { periodoUltimos7Dias } from '@/lib/utils/date-time'
import {
  DIMENSOES_FILTRO,
  filtrosAvancadosDeUrl,
  type RelatorioFiltrosAvancados,
} from '@/lib/relatorio/filtros-relatorio'
import {
  ABAS_RELATORIO,
  relatorioFiltrosSchema,
  type AbaRelatorio,
  type RelatorioConsultaInput,
} from '@/validations/relatorio/relatorio-schema'

function abaValida(valor: string | null): AbaRelatorio {
  if (valor && ABAS_RELATORIO.includes(valor as AbaRelatorio)) {
    return valor as AbaRelatorio
  }
  return 'consumo'
}

function montarQuery(input: RelatorioConsultaInput): string {
  const params = new URLSearchParams()
  params.set('aba', input.aba)
  params.set('de', input.de)
  params.set('ate', input.ate)

  for (const chave of DIMENSOES_FILTRO) {
    const valor = input[chave]?.trim()
    if (valor) params.set(chave, valor)
  }

  return params.toString()
}

export function useRelatorioFiltros() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const {
    aba,
    de,
    ate,
    setor,
    destino,
    maquina,
    operador,
    liga,
    turno,
    setFiltros,
    limparFiltrosAvancados,
    resetParaPeriodoPadrao,
  } = useRelatorioFiltrosStore()
  const sincronizandoUrl = useRef(false)

  useEffect(() => {
    const padrao = periodoUltimos7Dias()
    const parsed = relatorioFiltrosSchema.safeParse({
      aba: abaValida(searchParams.get('aba')),
      de: searchParams.get('de') ?? padrao.de,
      ate: searchParams.get('ate') ?? padrao.ate,
      setor: searchParams.get('setor') ?? '',
      destino: searchParams.get('destino') ?? '',
      maquina: searchParams.get('maquina') ?? '',
      operador: searchParams.get('operador') ?? '',
      liga: searchParams.get('liga') ?? '',
      turno: searchParams.get('turno') ?? '',
    })

    if (parsed.success) {
      sincronizandoUrl.current = true
      setFiltros(parsed.data)
      sincronizandoUrl.current = false
    }
  }, [searchParams, setFiltros])

  useEffect(() => {
    if (sincronizandoUrl.current) return

    const query = montarQuery({ aba, de, ate, setor, destino, maquina, operador, liga, turno })
    const atual = searchParams.toString()
    if (query === atual) return

    router.replace(`${pathname}?${query}`, { scroll: false })
  }, [aba, ate, de, destino, liga, maquina, operador, pathname, router, searchParams, setor, turno])

  const aplicarFiltros = useCallback(
    (
      filtros: Partial<{
        aba: AbaRelatorio
        de: string
        ate: string
        setor: string
        destino: string
        maquina: string
        operador: string
        liga: string
        turno: string
      }>
    ) => {
      setFiltros(filtros)
    },
    [setFiltros]
  )

  const filtrosAvancados: RelatorioFiltrosAvancados = filtrosAvancadosDeUrl({
    setor,
    destino,
    maquina,
    operador,
    liga,
    turno,
  })

  const consulta: RelatorioConsultaInput = {
    aba,
    de,
    ate,
    setor,
    destino,
    maquina,
    operador,
    liga,
    turno,
  }

  const limparTodosFiltros = useCallback(() => {
    limparFiltrosAvancados()
    resetParaPeriodoPadrao()
  }, [limparFiltrosAvancados, resetParaPeriodoPadrao])

  return {
    aba,
    de,
    ate,
    setor,
    destino,
    maquina,
    operador,
    liga,
    turno,
    filtrosAvancados,
    consulta,
    aplicarFiltros,
    limparFiltrosAvancados,
    limparTodosFiltros,
  }
}

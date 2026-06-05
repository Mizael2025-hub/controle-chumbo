import { create } from 'zustand'
import { periodoUltimos7Dias } from '@/lib/utils/date-time'
import type { AbaRelatorio } from '@/validations/relatorio/relatorio-schema'

type FiltrosAvancados = {
  setor: string
  destino: string
  maquina: string
  operador: string
  liga: string
  turno: string
}

type RelatorioFiltrosState = {
  aba: AbaRelatorio
  de: string
  ate: string
} & FiltrosAvancados & {
  setFiltros: (
    filtros: Partial<
      Pick<RelatorioFiltrosState, 'aba' | 'de' | 'ate' | keyof FiltrosAvancados>
    >
  ) => void
  limparFiltrosAvancados: () => void
  resetParaPeriodoPadrao: () => void
}

const padrao = periodoUltimos7Dias()

const filtrosAvancadosVazios = (): FiltrosAvancados => ({
  setor: '',
  destino: '',
  maquina: '',
  operador: '',
  liga: '',
  turno: '',
})

export const useRelatorioFiltrosStore = create<RelatorioFiltrosState>((set) => ({
  aba: 'consumo',
  de: padrao.de,
  ate: padrao.ate,
  ...filtrosAvancadosVazios(),
  setFiltros: (filtros) => set((state) => ({ ...state, ...filtros })),
  limparFiltrosAvancados: () => set(filtrosAvancadosVazios()),
  resetParaPeriodoPadrao: () => {
    const periodo = periodoUltimos7Dias()
    set({ de: periodo.de, ate: periodo.ate })
  },
}))

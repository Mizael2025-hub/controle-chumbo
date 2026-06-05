import { describe, expect, it } from 'vitest'
import {
  aplicarFiltrosAvancados,
  calcularOpcoesCascata,
  calcularTotaisRelatorio,
  normalizarLinhasParaFiltro,
  parsearValoresFiltroUrl,
  serializarValoresFiltroUrl,
} from '@/lib/relatorio/filtros-relatorio'
import type { ConsumoRelatorioLinha } from '@/services/relatorio-service'

const consumoMock: ConsumoRelatorioLinha[] = [
  {
    id: '1',
    data_consumo: '2026-06-01',
    nome_setor: 'Painel',
    nome_operador: 'Antonio',
    nome_turno: 'Manha',
    nome_maquina: 'M1',
    liga_nome: '5',
    numero_lote_snapshot: 'L001',
    barras: 10,
    peso_kg: 100,
    borra_kg: 0,
    modo_selecao_montes: 'manual',
  },
  {
    id: '2',
    data_consumo: '2026-06-02',
    nome_setor: 'Painel',
    nome_operador: 'Maria',
    nome_turno: 'Tarde',
    nome_maquina: 'M2',
    liga_nome: '0',
    numero_lote_snapshot: 'L002',
    barras: 5,
    peso_kg: 50,
    borra_kg: 0,
    modo_selecao_montes: 'manual',
  },
  {
    id: '3',
    data_consumo: '2026-06-03',
    nome_setor: 'Placa',
    nome_operador: 'Antonio',
    nome_turno: 'Manha',
    nome_maquina: 'M1',
    liga_nome: '5',
    numero_lote_snapshot: 'L003',
    barras: 8,
    peso_kg: 80,
    borra_kg: 0,
    modo_selecao_montes: 'manual',
  },
]

describe('filtros-relatorio', () => {
  it('serializa e parseia múltiplos valores na URL', () => {
    const serializado = serializarValoresFiltroUrl(['Painel', 'Placa'])
    expect(serializado).toBe('Painel|Placa')
    expect(parsearValoresFiltroUrl(serializado)).toEqual(['Painel', 'Placa'])
  })

  it('restringe operadores quando liga=5', () => {
    const itens = normalizarLinhasParaFiltro('consumo', consumoMock)
    const opcoes = calcularOpcoesCascata(itens, { liga: ['5'] }, 'operador')
    expect(opcoes).toEqual(['Antonio'])
  })

  it('aplica interseção de filtros com multiselect OR na dimensão', () => {
    const itens = normalizarLinhasParaFiltro('consumo', consumoMock)
    const filtrados = aplicarFiltrosAvancados<ConsumoRelatorioLinha>(itens, {
      liga: ['5'],
      operador: ['Antonio'],
    })
    expect(filtrados).toHaveLength(2)
    expect(filtrados.every((item) => item.liga_nome === '5' && item.nome_operador === 'Antonio')).toBe(
      true
    )
  })

  it('permite múltiplos setores na mesma dimensão', () => {
    const itens = normalizarLinhasParaFiltro('consumo', consumoMock)
    const filtrados = aplicarFiltrosAvancados<ConsumoRelatorioLinha>(itens, {
      setor: ['Painel', 'Placa'],
    })
    expect(filtrados).toHaveLength(3)
  })

  it('calcula totais do dataset filtrado', () => {
    const totais = calcularTotaisRelatorio('consumo', [consumoMock[0], consumoMock[2]])
    expect(totais.totalBarras).toBe(18)
    expect(totais.totalPesoKg).toBe(180)
  })
})

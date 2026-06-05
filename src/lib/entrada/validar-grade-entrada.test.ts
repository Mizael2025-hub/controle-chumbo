import { describe, expect, it } from 'vitest'
import {
  celulaForaDaGrade,
  conferenciaDiferenteDosIniciais,
  filtrarCelulasPreenchidas,
  somarCelulasEntrada,
  temPosicoesDuplicadas,
} from '@/lib/entrada/validar-grade-entrada'

describe('validar-grade-entrada', () => {
  it('soma peso e barras das células', () => {
    const soma = somarCelulasEntrada([
      { posicao_x: 0, posicao_y: 0, peso_atual_kg: 100, barras_atuais: 10 },
      { posicao_x: 1, posicao_y: 0, peso_atual_kg: 200.5, barras_atuais: 5 },
    ])
    expect(soma.peso_kg).toBe(300.5)
    expect(soma.barras).toBe(15)
  })

  it('detecta posições duplicadas', () => {
    const celulas = [
      { posicao_x: 0, posicao_y: 0, peso_atual_kg: 1, barras_atuais: 1 },
      { posicao_x: 0, posicao_y: 0, peso_atual_kg: 2, barras_atuais: 2 },
    ]
    expect(temPosicoesDuplicadas(celulas)).toBe(true)
  })

  it('valida limites da grade', () => {
    expect(
      celulaForaDaGrade(
        { posicao_x: 5, posicao_y: 0, peso_atual_kg: 1, barras_atuais: 1 },
        5,
        3
      )
    ).toBe(true)
    expect(
      celulaForaDaGrade(
        { posicao_x: 4, posicao_y: 2, peso_atual_kg: 1, barras_atuais: 1 },
        5,
        3
      )
    ).toBe(false)
  })

  it('filtra células vazias', () => {
    const filtradas = filtrarCelulasPreenchidas([
      { posicao_x: 0, posicao_y: 0, peso_atual_kg: 0, barras_atuais: 0 },
      { posicao_x: 1, posicao_y: 0, peso_atual_kg: 10, barras_atuais: 0 },
    ])
    expect(filtradas).toHaveLength(1)
    expect(filtradas[0].posicao_x).toBe(1)
  })

  it('identifica conferência diferente dos iniciais', () => {
    expect(
      conferenciaDiferenteDosIniciais({ peso_kg: 100, barras: 10 }, 100, 10)
    ).toBe(false)
    expect(
      conferenciaDiferenteDosIniciais({ peso_kg: 99, barras: 10 }, 100, 10)
    ).toBe(true)
  })
})

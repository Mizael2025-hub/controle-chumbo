import { describe, expect, it } from 'vitest'
import {
  agoraLocal,
  dataHojeInputIso,
  dataInputIsoParaPtBr,
  dataPtBrParaInputIso,
  formatarData,
  formatarDataHora,
  formatarHora,
  parseDataPtBr,
} from './date-time'

describe('formatarData', () => {
  it('formata em dd/MM/yyyy', () => {
    const result = formatarData('2026-05-31T15:00:00Z')
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})

describe('formatarHora', () => {
  it('formata em HH:mm', () => {
    const result = formatarHora('2026-05-31T15:00:00Z')
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })
})

describe('formatarDataHora', () => {
  it('combina data e hora', () => {
    const result = formatarDataHora('2026-05-31T15:00:00Z')
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
  })
})

describe('parseDataPtBr', () => {
  it('parseia dd/MM/yyyy corretamente', () => {
    const result = parseDataPtBr('31/05/2026')
    expect(result).not.toBeNull()
    expect(result!.getDate()).toBe(31)
    expect(result!.getMonth()).toBe(4)
  })

  it('rejeita data inválida', () => {
    expect(parseDataPtBr('32/13/2026')).toBeNull()
  })
})

describe('agoraLocal', () => {
  it('retorna Date válido', () => {
    expect(agoraLocal()).toBeInstanceOf(Date)
  })
})

describe('conversão input date', () => {
  it('converte dd/MM/yyyy para yyyy-MM-dd', () => {
    expect(dataPtBrParaInputIso('31/05/2026')).toBe('2026-05-31')
  })

  it('converte yyyy-MM-dd para dd/MM/yyyy', () => {
    expect(dataInputIsoParaPtBr('2026-05-31')).toBe('31/05/2026')
  })

  it('dataHojeInputIso retorna ISO válido', () => {
    expect(dataHojeInputIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

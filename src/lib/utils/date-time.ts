import { endOfDay, endOfMonth, format, isValid, parse, startOfDay, startOfMonth, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

const TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE ?? 'America/Sao_Paulo'

export function formatarData(valor: string | Date): string {
  const date = typeof valor === 'string' ? new Date(valor) : valor
  const local = toZonedTime(date, TIMEZONE)
  return format(local, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatarHora(valor: string | Date): string {
  const date = typeof valor === 'string' ? new Date(valor) : valor
  const local = toZonedTime(date, TIMEZONE)
  return format(local, 'HH:mm', { locale: ptBR })
}

export function formatarDataHora(valor: string | Date): string {
  const date = typeof valor === 'string' ? new Date(valor) : valor
  const local = toZonedTime(date, TIMEZONE)
  return format(local, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export function parseDataPtBr(valor: string): Date | null {
  const parsed = parse(valor, 'dd/MM/yyyy', new Date())
  return isValid(parsed) ? parsed : null
}

export function localParaUtc(dataLocal: Date): Date {
  return fromZonedTime(dataLocal, TIMEZONE)
}

export function agoraLocal(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

export function getAppTimezone(): string {
  return TIMEZONE
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Valor para `input type="date"` (yyyy-MM-dd) a partir de dd/MM/yyyy ou ISO. */
export function dataPtBrParaInputIso(valor: string): string {
  if (!valor?.trim()) return ''
  if (ISO_DATE_RE.test(valor.trim())) return valor.trim()
  const parsed = parseDataPtBr(valor.trim())
  if (!parsed) return ''
  return format(parsed, 'yyyy-MM-dd')
}

/** Converte yyyy-MM-dd (calendário nativo) para dd/MM/yyyy da UI. */
export function dataInputIsoParaPtBr(iso: string): string {
  if (!iso?.trim() || !ISO_DATE_RE.test(iso.trim())) return ''
  const [ano, mes, dia] = iso.split('-').map(Number)
  const date = new Date(ano, mes - 1, dia)
  return isValid(date) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : ''
}

/** Data de hoje (Brasília) no formato do input date. */
export function dataHojeInputIso(): string {
  return format(agoraLocal(), 'yyyy-MM-dd')
}

/** Período padrão dos relatórios: mês corrente em Brasília (dd/MM/yyyy). */
export function periodoMesCorrente(): { de: string; ate: string } {
  const agora = agoraLocal()
  return {
    de: format(startOfMonth(agora), 'dd/MM/yyyy', { locale: ptBR }),
    ate: format(endOfMonth(agora), 'dd/MM/yyyy', { locale: ptBR }),
  }
}

/** Período padrão dos relatórios: últimos 7 dias inclusive (Brasília). */
export function periodoUltimos7Dias(): { de: string; ate: string } {
  const agora = agoraLocal()
  return {
    de: format(subDays(agora, 6), 'dd/MM/yyyy', { locale: ptBR }),
    ate: format(agora, 'dd/MM/yyyy', { locale: ptBR }),
  }
}

/** Converte dd/MM/yyyy para yyyy-MM-dd (campos DATE no banco). */
export function dataPtBrParaIsoDate(valor: string): string | null {
  const parsed = parseDataPtBr(valor.trim())
  if (!parsed) return null
  return format(parsed, 'yyyy-MM-dd')
}

/** Limites inclusivos para filtro TIMESTAMPTZ (Brasília → UTC ISO). */
export function periodoParaLimitesTimestamptz(
  dePtBr: string,
  atePtBr: string
): { inicio: string; fim: string } | null {
  const de = parseDataPtBr(dePtBr.trim())
  const ate = parseDataPtBr(atePtBr.trim())
  if (!de || !ate || de > ate) return null
  return {
    inicio: localParaUtc(startOfDay(de)).toISOString(),
    fim: localParaUtc(endOfDay(ate)).toISOString(),
  }
}

/** Limites inclusivos para filtro DATE (yyyy-MM-dd). */
export function periodoParaLimitesDate(
  dePtBr: string,
  atePtBr: string
): { inicio: string; fim: string } | null {
  const inicio = dataPtBrParaIsoDate(dePtBr)
  const fim = dataPtBrParaIsoDate(atePtBr)
  if (!inicio || !fim || inicio > fim) return null
  return { inicio, fim }
}

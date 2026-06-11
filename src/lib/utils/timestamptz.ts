/** Normaliza TIMESTAMPTZ do Postgres/Supabase (espaço, offset curto +00). */
export function parseTimestamptz(valor: string): Date {
  const normalizado = valor.trim().replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')
  return new Date(normalizado)
}

export function isValidTimestamptz(valor: string): boolean {
  return !Number.isNaN(parseTimestamptz(valor).getTime())
}

export function timestamptzIguais(a: string, b: string): boolean {
  const dataA = parseTimestamptz(a)
  const dataB = parseTimestamptz(b)
  if (Number.isNaN(dataA.getTime()) || Number.isNaN(dataB.getTime())) {
    return a === b
  }
  return dataA.getTime() === dataB.getTime()
}

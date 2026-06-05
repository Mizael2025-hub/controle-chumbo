/** Cores de liga — ver docs/DATABASE.md */
export const CHAVES_COR_LIGA = [
  'azul',
  'amarelo',
  'vermelho',
  'preto',
  'cinza',
  'sem_cor',
  'verde',
  'branco',
] as const

export type ChaveCorLiga = (typeof CHAVES_COR_LIGA)[number]

export const CHAVE_COR_LABELS: Record<ChaveCorLiga, string> = {
  azul: 'Azul',
  amarelo: 'Amarelo',
  vermelho: 'Vermelho',
  preto: 'Preto',
  cinza: 'Cinza',
  sem_cor: 'Sem cor',
  verde: 'Verde',
  branco: 'Branco',
}

export const CHAVE_COR_CLASSES: Record<ChaveCorLiga, string> = {
  azul: 'bg-blue-500',
  amarelo: 'bg-yellow-400',
  vermelho: 'bg-red-500',
  preto: 'bg-zinc-900',
  cinza: 'bg-zinc-400',
  sem_cor: 'bg-zinc-200 border border-zinc-300',
  verde: 'bg-green-500',
  branco: 'bg-white border border-zinc-300',
}

export function isChaveCorLiga(valor: string): valor is ChaveCorLiga {
  return CHAVES_COR_LIGA.includes(valor as ChaveCorLiga)
}

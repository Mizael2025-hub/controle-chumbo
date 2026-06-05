export const SETOR_TIPOS = ['producao', 'saida_direta'] as const

export type SetorTipo = (typeof SETOR_TIPOS)[number]

export const SETOR_TIPO_LABELS: Record<SetorTipo, string> = {
  producao: 'Produção',
  saida_direta: 'Saída direta',
}

export function isSetorTipo(valor: string): valor is SetorTipo {
  return SETOR_TIPOS.includes(valor as SetorTipo)
}

/** Tipos de produto ao longo do processo — MVP cadastra apenas grade */
export const TIPOS_PRODUTO_MODELO = ['grade', 'painel', 'placa', 'bateria'] as const

export type TipoProdutoModelo = (typeof TIPOS_PRODUTO_MODELO)[number]

export const TIPO_PRODUTO_LABELS: Record<TipoProdutoModelo, string> = {
  grade: 'Grade (teleira)',
  painel: 'Painel (empastadeira)',
  placa: 'Placa (lixação)',
  bateria: 'Bateria',
}

/** Valor fixo no MVP de chumbo */
export const TIPO_PRODUTO_MVP = 'grade' as const satisfies TipoProdutoModelo

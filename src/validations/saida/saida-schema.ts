import { z } from 'zod'
import { updatedAtSchema } from '@/validations/shared/updated-at-schema'

export const linhaBaixaAgrupadaSchema = z.object({
  monte_id: z.string().uuid('Monte inválido'),
  barras_baixadas: z
    .number()
    .int('Barras deve ser um número inteiro')
    .positive('Informe ao menos 1 barra'),
  updated_at: updatedAtSchema,
})

export const baixaAgrupadaSchema = z.object({
  destino_saida_id: z.string().uuid('Destino de saída inválido'),
  setor_id: z.string().uuid('Setor inválido').optional().nullable(),
  observacao: z.string().trim().max(500).optional(),
  linhas: z.array(linhaBaixaAgrupadaSchema).min(1, 'Selecione ao menos um monte'),
})

export const estornarLiberacaoSchema = z
  .object({
    grupo_liberacao_id: z.string().uuid().optional().nullable(),
    transacao_id: z.string().uuid().optional().nullable(),
  })
  .refine((data) => data.grupo_liberacao_id || data.transacao_id, {
    message: 'Informe grupo_liberacao_id ou transacao_id.',
  })

export type LinhaBaixaAgrupadaInput = z.infer<typeof linhaBaixaAgrupadaSchema>
export type BaixaAgrupadaInput = z.infer<typeof baixaAgrupadaSchema>
export type EstornarLiberacaoInput = z.infer<typeof estornarLiberacaoSchema>

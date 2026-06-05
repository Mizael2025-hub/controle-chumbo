import { z } from 'zod'

const monteIdSchema = z.string().uuid('Identificador do monte inválido')
const updatedAtSchema = z.string().datetime('Timestamp de controle obrigatório')

export const reservarMonteSchema = z.object({
  monte_id: monteIdSchema,
  setor_reserva_id: z.string().uuid('Setor de reserva inválido'),
  reservado_para: z.string().trim().max(200).optional(),
  updated_at: updatedAtSchema,
})

export const cancelarReservaMonteSchema = z.object({
  monte_id: monteIdSchema,
  updated_at: updatedAtSchema,
})

export const baixaMonteSchema = z.object({
  monte_id: monteIdSchema,
  destino_saida_id: z.string().uuid('Destino de saída inválido'),
  barras_baixadas: z
    .number()
    .int('Barras deve ser um número inteiro')
    .positive('Informe ao menos 1 barra'),
  setor_id: z.string().uuid('Setor inválido').optional().nullable(),
  grupo_liberacao_id: z.string().uuid().optional().nullable(),
  updated_at: updatedAtSchema,
})

export const moverMonteSetorSchema = z.object({
  monte_id: monteIdSchema,
  setor_id: z.string().uuid('Setor inválido'),
  barras_movidas: z
    .number()
    .int('Barras deve ser um número inteiro')
    .positive('Informe ao menos 1 barra')
    .optional(),
  observacao: z.string().trim().max(500).optional(),
  updated_at: updatedAtSchema,
})

export const historicoMonteSchema = z.object({
  monte_id: monteIdSchema,
})

export const devolverMonteAlmoxarifadoSchema = z.object({
  monte_id: monteIdSchema,
  updated_at: updatedAtSchema,
})

export const trocarPosicaoMonteSchema = z.object({
  monte_id: monteIdSchema,
  posicao_x: z.number().int().min(0).max(9),
  posicao_y: z.number().int().min(0).max(4),
  updated_at: updatedAtSchema,
})

export type ReservarMonteInput = z.infer<typeof reservarMonteSchema>
export type CancelarReservaMonteInput = z.infer<typeof cancelarReservaMonteSchema>
export type BaixaMonteInput = z.infer<typeof baixaMonteSchema>
export type MoverMonteSetorInput = z.infer<typeof moverMonteSetorSchema>
export type DevolverMonteAlmoxarifadoInput = z.infer<typeof devolverMonteAlmoxarifadoSchema>
export type TrocarPosicaoMonteInput = z.infer<typeof trocarPosicaoMonteSchema>
export type HistoricoMonteInput = z.infer<typeof historicoMonteSchema>

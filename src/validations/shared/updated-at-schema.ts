import { z } from 'zod'
import { isValidTimestamptz } from '@/lib/utils/timestamptz'

/** Controle otimista — aceita ISO e formato Postgres (`yyyy-MM-dd HH:mm:ss+00`). */
export const updatedAtSchema = z
  .string()
  .min(1, 'Timestamp de controle obrigatório')
  .refine(isValidTimestamptz, { message: 'Timestamp de controle obrigatório' })

import { z } from 'zod'
import { agoraLocal, parseDataPtBr } from '@/lib/utils/date-time'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function parseDataConsumoInput(valor: string): Date | null {
  if (ISO_DATE_RE.test(valor)) {
    const [ano, mes, dia] = valor.split('-').map(Number)
    const d = new Date(ano, mes - 1, dia)
    return Number.isFinite(d.getTime()) ? d : null
  }
  return parseDataPtBr(valor)
}

const dataConsumoSchema = z
  .string()
  .trim()
  .min(8, 'Informe a data no formato dd/MM/aaaa')
  .refine((v) => parseDataConsumoInput(v) !== null, 'Data inválida. Use dd/MM/aaaa')
  .refine((v) => {
    const parsed = parseDataConsumoInput(v)
    if (!parsed) return false
    const hoje = agoraLocal()
    hoje.setHours(23, 59, 59, 999)
    return parsed <= hoje
  }, 'Data de consumo não pode ser futura')
  .transform((v) => {
    if (ISO_DATE_RE.test(v)) return v
    const parsed = parseDataPtBr(v)
    if (!parsed) return v
    const ano = parsed.getFullYear()
    const mes = String(parsed.getMonth() + 1).padStart(2, '0')
    const dia = String(parsed.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  })

export const criarConsumoSchema = z.object({
  data_consumo: dataConsumoSchema,
  setor_id: z.string().uuid('Setor inválido'),
  maquina_id: z.string().uuid('Máquina inválida'),
  operador_id: z.string().uuid('Operador inválido'),
  turno_id: z.string().uuid('Turno inválido'),
  liga_id: z.string().uuid('Liga inválida'),
  lote_id: z.string().uuid('Lote inválido'),
  barras: z.number().int().positive('Informe ao menos 1 barra consumida'),
  borra_kg: z.number().min(0, 'Borra deve ser maior ou igual a zero'),
  observacoes: z.string().trim().max(500).optional(),
  modo_selecao_montes: z.enum(['automatico', 'manual']).default('automatico'),
  montes_ids: z.array(z.string().uuid()).optional(),
})

export const listarLotesConsumoSchema = z.object({
  setor_id: z.string().uuid('Setor inválido'),
  liga_id: z.string().uuid('Liga inválida'),
})

export type CriarConsumoInput = z.infer<typeof criarConsumoSchema>
export type ListarLotesConsumoInput = z.infer<typeof listarLotesConsumoSchema>

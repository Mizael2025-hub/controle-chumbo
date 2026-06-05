import { format, isValid } from 'date-fns'
import { z } from 'zod'
import { agoraLocal, parseDataPtBr } from '@/lib/utils/date-time'

const celulaEntradaSchema = z.object({
  posicao_x: z.number().int().min(0).max(9),
  posicao_y: z.number().int().min(0).max(4),
  peso_atual_kg: z.number().min(0, 'Peso deve ser maior ou igual a zero'),
  barras_atuais: z
    .number()
    .int('Barras deve ser um número inteiro')
    .min(0, 'Barras deve ser maior ou igual a zero'),
})

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function parseDataChegadaInput(valor: string): Date | null {
  if (ISO_DATE_RE.test(valor)) {
    const [ano, mes, dia] = valor.split('-').map(Number)
    const d = new Date(ano, mes - 1, dia)
    return isValid(d) ? d : null
  }
  return parseDataPtBr(valor)
}

const dataChegadaSchema = z
  .string()
  .trim()
  .min(8, 'Informe a data no formato dd/MM/aaaa')
  .refine((v) => parseDataChegadaInput(v) !== null, 'Data inválida. Use dd/MM/aaaa')
  .refine((v) => {
    const parsed = parseDataChegadaInput(v)
    if (!parsed) return false
    const hoje = agoraLocal()
    hoje.setHours(23, 59, 59, 999)
    return parsed <= hoje
  }, 'Data de chegada não pode ser futura')
  .transform((v) => {
    if (ISO_DATE_RE.test(v)) return v
    const parsed = parseDataPtBr(v)
    if (!parsed) return v
    return format(parsed, 'yyyy-MM-dd')
  })

/** Dados mínimos para abrir a grade (data, liga, lote). */
export const metaEntradaPasso1Schema = z.object({
  liga_id: z.string().uuid('Liga inválida'),
  numero_lote: z
    .string()
    .trim()
    .min(1, 'Informe o número do lote')
    .max(50, 'Número do lote deve ter no máximo 50 caracteres'),
  data_chegada: dataChegadaSchema,
})

const dimensoesGradeSchema = {
  colunas_grade: z
    .number()
    .int()
    .min(1, 'Mínimo 1 coluna')
    .max(10, 'Máximo 10 colunas'),
  linhas_grade: z
    .number()
    .int()
    .min(1, 'Mínimo 1 linha')
    .max(5, 'Máximo 5 linhas'),
}

/** Metadados do lote + dimensão da grade (sem totais da NF — preenchidos no service). */
export const metaEntradaSchema = metaEntradaPasso1Schema.extend(dimensoesGradeSchema)

function refineCelulasGrade(
  data: { colunas_grade: number; linhas_grade: number; celulas: z.infer<typeof celulaEntradaSchema>[] },
  ctx: z.RefinementCtx
): void {
  const preenchidas = data.celulas.filter(
    (c) => c.peso_atual_kg > 0 || c.barras_atuais > 0
  )
  if (preenchidas.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Preencha ao menos uma célula com peso ou barras.',
      path: ['celulas'],
    })
  }

  const chaves = new Set<string>()
  for (const c of data.celulas) {
    if (c.posicao_x >= data.colunas_grade || c.posicao_y >= data.linhas_grade) {
      ctx.addIssue({
        code: 'custom',
        message: `Posição (${c.posicao_x + 1},${c.posicao_y + 1}) fora da grade ${data.colunas_grade}×${data.linhas_grade}.`,
        path: ['celulas'],
      })
    }
    const k = `${c.posicao_x}-${c.posicao_y}`
    if (chaves.has(k)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Posições duplicadas na grade.',
        path: ['celulas'],
      })
    }
    chaves.add(k)
  }
}

export const criarEntradaSchema = metaEntradaSchema
  .extend({
    celulas: z.array(celulaEntradaSchema).min(1, 'Informe ao menos uma célula na grade'),
  })
  .superRefine(refineCelulasGrade)

export type CriarEntradaInput = z.infer<typeof criarEntradaSchema>
export type MetaEntradaPasso1Input = z.infer<typeof metaEntradaPasso1Schema>
export type MetaEntradaInput = z.infer<typeof metaEntradaSchema>
export type CelulaEntradaInput = z.infer<typeof celulaEntradaSchema>

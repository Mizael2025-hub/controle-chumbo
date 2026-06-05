import { z } from 'zod'
import { parseDataPtBr, periodoUltimos7Dias } from '@/lib/utils/date-time'

export const ABAS_RELATORIO = ['entradas', 'saidas', 'reservas', 'consumo'] as const

export type AbaRelatorio = (typeof ABAS_RELATORIO)[number]

const padrao = periodoUltimos7Dias()

const dataFiltroSchema = z
  .string()
  .trim()
  .min(8, 'Informe a data no formato dd/MM/aaaa')
  .refine((v) => parseDataPtBr(v) !== null, 'Data inválida. Use dd/MM/aaaa')

const filtroAvancadoSchema = z.string().trim().optional().default('')

export const relatorioFiltrosSchema = z
  .object({
    aba: z.enum(ABAS_RELATORIO).default('consumo'),
    de: dataFiltroSchema.default(padrao.de),
    ate: dataFiltroSchema.default(padrao.ate),
    setor: filtroAvancadoSchema,
    destino: filtroAvancadoSchema,
    maquina: filtroAvancadoSchema,
    operador: filtroAvancadoSchema,
    liga: filtroAvancadoSchema,
    turno: filtroAvancadoSchema,
  })
  .refine(
    (v) => {
      const de = parseDataPtBr(v.de)
      const ate = parseDataPtBr(v.ate)
      return Boolean(de && ate && de <= ate)
    },
    { message: 'Data inicial deve ser anterior ou igual à data final.', path: ['ate'] }
  )

export type RelatorioFiltrosInput = z.infer<typeof relatorioFiltrosSchema>

export const relatorioConsultaSchema = relatorioFiltrosSchema

export type RelatorioConsultaInput = z.infer<typeof relatorioConsultaSchema>

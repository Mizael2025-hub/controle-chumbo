import { z } from 'zod'
import { parseDataPtBr } from '@/lib/utils/date-time'

export const contagemLinhaFormSchema = z.object({
  data_contagem_ui: z
    .string()
    .min(1, 'Informe a data')
    .refine((v) => parseDataPtBr(v) !== null, 'Data inválida. Use dd/MM/yyyy'),
  liga_id: z.string().min(1, 'Selecione a liga'),
  quantidade_barras: z
    .union([z.string(), z.number()])
    .transform((val, ctx) => {
      const texto = typeof val === 'number' ? String(val) : val.trim()
      if (texto === '') {
        ctx.addIssue({ code: 'custom', message: 'Informe a quantidade de barras' })
        return z.NEVER
      }
      const numero = Number.parseInt(texto, 10)
      if (!Number.isFinite(numero) || !Number.isInteger(numero)) {
        ctx.addIssue({ code: 'custom', message: 'Use número inteiro de barras' })
        return z.NEVER
      }
      if (numero <= 0) {
        ctx.addIssue({ code: 'custom', message: 'Informe ao menos 1 barra' })
        return z.NEVER
      }
      return numero
    }),
  numero_lote: z.string().max(80).optional().or(z.literal('')),
})

export const contagemLinhaPersistSchema = contagemLinhaFormSchema.transform((data) => {
  const parsed = parseDataPtBr(data.data_contagem_ui)
  if (!parsed) throw new Error('Data inválida')
  const iso = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
  const lote = data.numero_lote?.trim()
  return {
    data_contagem: iso,
    liga_id: data.liga_id,
    quantidade_barras: data.quantidade_barras,
    numero_lote: lote && lote.length > 0 ? lote : null,
  }
})

export type ContagemLinhaFormInput = z.infer<typeof contagemLinhaFormSchema>

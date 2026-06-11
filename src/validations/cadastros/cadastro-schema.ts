import { z } from 'zod'
import { CHAVES_COR_LIGA } from '@/lib/types/chave-cor-liga'
import { POLARIDADES_MODELO } from '@/lib/types/polaridade-modelo'
import { SETOR_TIPOS } from '@/lib/types/setor-tipo'

const nomeSchema = z
  .string()
  .trim()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')

const sortOrderSchema = z
  .number()
  .int('Ordem deve ser um número inteiro')
  .min(0, 'Ordem deve ser maior ou igual a zero')

const updatedAtSchema = z.string().datetime('Timestamp de controle obrigatório')

/** Slug gerado no servidor se omitido; ausente/vazio/null aceitos na entrada. */
const slugOpcionalSchema = z.preprocess(
  (valor) => {
    if (valor === '' || valor === null || valor === undefined) return undefined
    if (typeof valor === 'string') {
      const normalizado = valor.trim()
      return normalizado === '' ? undefined : normalizado
    }
    return valor
  },
  z
    .string()
    .min(2, 'Slug deve ter pelo menos 2 caracteres')
    .max(50, 'Slug deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug inválido. Use letras minúsculas, números e hífen')
    .optional()
)

export const criarCadastroSimplesSchema = z.object({
  nome: nomeSchema,
  sort_order: sortOrderSchema.optional(),
})

export const atualizarCadastroSimplesSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
  nome: nomeSchema.optional(),
  sort_order: sortOrderSchema.optional(),
  is_active: z.boolean().optional(),
  updated_at: updatedAtSchema,
})

export const criarLigaSchema = z.object({
  nome: nomeSchema,
  chave_cor: z.enum(CHAVES_COR_LIGA, { message: 'Cor de liga inválida' }),
})

export const atualizarLigaSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
  nome: nomeSchema.optional(),
  chave_cor: z.enum(CHAVES_COR_LIGA, { message: 'Cor de liga inválida' }).optional(),
  is_active: z.boolean().optional(),
  updated_at: updatedAtSchema,
})

export const criarSetorSchema = z.object({
  nome: nomeSchema,
  slug: slugOpcionalSchema,
  tipo: z.enum(SETOR_TIPOS, { message: 'Tipo de setor inválido' }),
  sort_order: sortOrderSchema.optional(),
})

export const atualizarSetorSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
  nome: nomeSchema.optional(),
  slug: slugOpcionalSchema,
  tipo: z.enum(SETOR_TIPOS, { message: 'Tipo de setor inválido' }).optional(),
  sort_order: sortOrderSchema.optional(),
  is_active: z.boolean().optional(),
  updated_at: updatedAtSchema,
})

export const criarDestinoSchema = z.object({
  nome: nomeSchema,
  slug: slugOpcionalSchema,
  sort_order: sortOrderSchema.optional(),
})

export const atualizarDestinoSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
  nome: nomeSchema.optional(),
  slug: slugOpcionalSchema,
  sort_order: sortOrderSchema.optional(),
  is_active: z.boolean().optional(),
  updated_at: updatedAtSchema,
})

export const criarMaquinaSchema = z.object({
  setor_id: z.string().uuid('Setor inválido'),
  nome: nomeSchema,
  sort_order: sortOrderSchema.optional(),
})

export const atualizarMaquinaSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
  setor_id: z.string().uuid('Setor inválido').optional(),
  nome: nomeSchema.optional(),
  sort_order: sortOrderSchema.optional(),
  is_active: z.boolean().optional(),
  updated_at: updatedAtSchema,
})

const placasPorGradeSchema = z
  .number()
  .int('Placas por grade deve ser um número inteiro')
  .min(1, 'Deve haver pelo menos 1 placa por grade')
  .max(20, 'Máximo de 20 placas por grade')

export const criarModeloProdutoSchema = z.object({
  nome: nomeSchema,
  polaridade: z.enum(POLARIDADES_MODELO, { message: 'Polaridade inválida' }),
  placas_por_grade: placasPorGradeSchema,
  sort_order: sortOrderSchema.optional(),
})

export const atualizarModeloProdutoSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
  nome: nomeSchema.optional(),
  polaridade: z.enum(POLARIDADES_MODELO, { message: 'Polaridade inválida' }).optional(),
  placas_por_grade: placasPorGradeSchema.optional(),
  sort_order: sortOrderSchema.optional(),
  is_active: z.boolean().optional(),
  updated_at: updatedAtSchema,
})

export const excluirCadastroSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
})

export type CriarCadastroSimplesInput = z.infer<typeof criarCadastroSimplesSchema>
export type AtualizarCadastroSimplesInput = z.infer<typeof atualizarCadastroSimplesSchema>
export type CriarLigaInput = z.infer<typeof criarLigaSchema>
export type AtualizarLigaInput = z.infer<typeof atualizarLigaSchema>
export type CriarSetorInput = z.infer<typeof criarSetorSchema>
export type AtualizarSetorInput = z.infer<typeof atualizarSetorSchema>
/** Formulário UI — slug gerado no servidor, sem campo na tela. */
export const criarSetorFormSchema = criarSetorSchema.omit({ slug: true })
export type CriarSetorFormInput = z.infer<typeof criarSetorFormSchema>
export type CriarDestinoInput = z.infer<typeof criarDestinoSchema>
export const criarDestinoFormSchema = criarDestinoSchema.omit({ slug: true })
export type CriarDestinoFormInput = z.infer<typeof criarDestinoFormSchema>
export type AtualizarDestinoInput = z.infer<typeof atualizarDestinoSchema>
export type CriarMaquinaInput = z.infer<typeof criarMaquinaSchema>
export type AtualizarMaquinaInput = z.infer<typeof atualizarMaquinaSchema>
export type CriarModeloProdutoInput = z.infer<typeof criarModeloProdutoSchema>
export type AtualizarModeloProdutoInput = z.infer<typeof atualizarModeloProdutoSchema>

'use server'

import {
  getDestinoSaidaRepository,
  getEstoqueRepository,
  getLigaRepository,
  getRelatorioRepository,
  getSetorRepository,
} from '@/lib/data-source/server-repositories'

import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as relatorioService from '@/services/relatorio-service'
import type {
  ConsumoRelatorioDetalhe,
  EntradaRelatorioDetalhe,
  RelatorioResultado,
} from '@/services/relatorio-service'
import { relatorioConsultaSchema } from '@/validations/relatorio/relatorio-schema'
import { z } from 'zod'

async function getContexto() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()
  if (!role) throw AppError.unauthorized()
  return { userId: user.id, role: role as UsuarioRole }
}

function handleError<T = void>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) return { success: false, message: error.message }
  console.error('[relatorioAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function consultarRelatorioAction(
  rawData: unknown
): Promise<ActionResponse<RelatorioResultado>> {
  try {
    const parsed = relatorioConsultaSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        message: 'Filtros inválidos.',
        errors: parsed.error.flatten().fieldErrors,
      }
    }
    const ctx = await getContexto()
    const data = await relatorioService.consultarRelatorio(ctx, parsed.data, await getRelatorioRepository(), {
      ligaRepo: await getLigaRepository(),
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    return { success: true, data, message: 'Relatório carregado.' }
  } catch (error) {
    return handleError(error)
  }
}

export async function exportarCsvRelatorioAction(
  rawData: unknown
): Promise<ActionResponse<string>> {
  try {
    const parsed = relatorioConsultaSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        message: 'Filtros inválidos.',
        errors: parsed.error.flatten().fieldErrors,
      }
    }
    const ctx = await getContexto()
    const data = await relatorioService.gerarCsvRelatorio(ctx, parsed.data, await getRelatorioRepository(), {
      ligaRepo: await getLigaRepository(),
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    return { success: true, data, message: 'CSV gerado.' }
  } catch (error) {
    return handleError(error)
  }
}

const detalheEntradaSchema = z.object({ lote_id: z.string().uuid() })
const detalheConsumoSchema = z.object({ apontamento_id: z.string().uuid() })

export async function buscarEntradaDetalheAction(
  rawData: unknown
): Promise<ActionResponse<EntradaRelatorioDetalhe | null>> {
  try {
    const parsed = detalheEntradaSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Identificador inválido.' }
    }
    const ctx = await getContexto()
    const data = await relatorioService.buscarEntradaDetalhe(ctx, parsed.data.lote_id, await getRelatorioRepository(), {
      ligaRepo: await getLigaRepository(),
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    return { success: true, data, message: 'Detalhe carregado.' }
  } catch (error) {
    return handleError(error)
  }
}

export async function buscarConsumoDetalheAction(
  rawData: unknown
): Promise<ActionResponse<ConsumoRelatorioDetalhe | null>> {
  try {
    const parsed = detalheConsumoSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Identificador inválido.' }
    }
    const ctx = await getContexto()
    const data = await relatorioService.buscarConsumoDetalhe(ctx, parsed.data.apontamento_id, await getRelatorioRepository(), {
      ligaRepo: await getLigaRepository(),
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    return { success: true, data, message: 'Detalhe carregado.' }
  } catch (error) {
    return handleError(error)
  }
}

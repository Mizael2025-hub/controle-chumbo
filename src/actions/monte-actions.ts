'use server'

import {
  getDestinoSaidaRepository,
  getMonteRepository,
  getSetorRepository,
} from '@/lib/data-source/server-repositories'

import { getActionContext } from '@/lib/auth/get-session-context'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { Monte } from '@/repositories/monte-repository'
import * as monteService from '@/services/monte-service'
import {
  baixaMonteSchema,
  cancelarReservaMonteSchema,
  devolverMonteAlmoxarifadoSchema,
  moverMonteSetorSchema,
  reservarMonteSchema,
  historicoMonteSchema,
  trocarPosicaoMonteSchema,
} from '@/validations/monte/monte-schema'
import type { LinhaHistoricoMonte } from '@/services/monte-service'

async function getContexto() {
  const ctx = await getActionContext()
  return { userId: ctx.user.id, role: ctx.role as UsuarioRole }
}

function mensagemValidacao(errors: Record<string, string[] | undefined>): string {
  const primeiro = Object.values(errors).flat()[0]
  return primeiro ?? 'Dados inválidos.'
}

function handleError<T = void>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) return { success: false, message: error.message }
  console.error('[monteAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function reservarMonteAction(rawData: unknown): Promise<ActionResponse<Monte>> {
  try {
    const parsed = reservarMonteSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    const data = await monteService.reservarMonte(ctx, parsed.data, await getMonteRepository(), await getSetorRepository())
    return { success: true, data, message: 'Reserva registrada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function cancelarReservaMonteAction(rawData: unknown): Promise<ActionResponse<Monte>> {
  try {
    const parsed = cancelarReservaMonteSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    const data = await monteService.cancelarReservaMonte(ctx, parsed.data, await getMonteRepository())
    return { success: true, data, message: 'Reserva cancelada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function baixaMonteAction(rawData: unknown): Promise<ActionResponse<Monte>> {
  try {
    const parsed = baixaMonteSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    const data = await monteService.baixaMonte(ctx, parsed.data, await getMonteRepository(), await getDestinoSaidaRepository())
    return { success: true, data, message: 'Baixa registrada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function moverMonteSetorAction(rawData: unknown): Promise<ActionResponse<Monte>> {
  try {
    const parsed = moverMonteSetorSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    const data = await monteService.moverMonteParaSetor(ctx, parsed.data, await getMonteRepository(), await getSetorRepository())
    return { success: true, data, message: 'Monte movido para o setor!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function devolverMonteAlmoxarifadoAction(
  rawData: unknown
): Promise<ActionResponse<Monte>> {
  try {
    const parsed = devolverMonteAlmoxarifadoSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    const data = await monteService.devolverMonteAlmoxarifado(ctx, parsed.data, await getMonteRepository(), await getSetorRepository())
    return { success: true, data, message: 'Monte devolvido ao almoxarifado!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function listarHistoricoMonteAction(
  rawData: unknown
): Promise<ActionResponse<LinhaHistoricoMonte[]>> {
  try {
    const parsed = historicoMonteSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    const data = await monteService.listarHistoricoMonte(ctx, parsed.data.monte_id, await getMonteRepository(), await getDestinoSaidaRepository())
    return { success: true, data, message: 'Histórico carregado.' }
  } catch (error) {
    return handleError(error)
  }
}

export async function trocarPosicaoMonteAction(rawData: unknown): Promise<ActionResponse<Monte>> {
  try {
    const parsed = trocarPosicaoMonteSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    const data = await monteService.trocarPosicaoMonte(ctx, parsed.data, await getMonteRepository())
    return { success: true, data, message: 'Posição atualizada!' }
  } catch (error) {
    return handleError(error)
  }
}

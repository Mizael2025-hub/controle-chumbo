'use server'

import {
  getDestinoSaidaRepository,
  getEstoqueRepository,
  getSaidaRepository,
  getSetorRepository,
} from '@/lib/data-source/server-repositories'

import { getActionContext } from '@/lib/auth/get-session-context'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as saidaService from '@/services/saida-service'
import type {
  LiberacaoGrupoView,
  MonteElegivelSaida,
} from '@/services/saida-service'
import type { BaixaAgrupadaResult } from '@/repositories/saida-repository'
import {
  baixaAgrupadaSchema,
  estornarLiberacaoSchema,
} from '@/validations/saida/saida-schema'

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
  console.error('[saidaAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function listarMontesElegiveisSaidaAction(): Promise<
  ActionResponse<MonteElegivelSaida[]>
> {
  try {
    const ctx = await getContexto()
    const data = await saidaService.listarMontesElegiveisSaida(ctx, await getEstoqueRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function listarLiberacoesAction(): Promise<ActionResponse<LiberacaoGrupoView[]>> {
  try {
    const ctx = await getContexto()
    const data = await saidaService.listarLiberacoes(ctx, await getSaidaRepository(), {
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function baixaAgrupadaAction(
  rawData: unknown
): Promise<ActionResponse<BaixaAgrupadaResult>> {
  try {
    const parsed = baixaAgrupadaSchema.safeParse(rawData)
    // #region agent log
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      console.error('[baixaAgrupadaAction.debug]', {
        message: issue?.message,
        path: issue?.path,
        updatedAtSample:
          rawData && typeof rawData === 'object' && !Array.isArray(rawData)
            ? (rawData as { linhas?: { updated_at?: string }[] }).linhas?.[0]?.updated_at
            : undefined,
      })
      fetch('http://127.0.0.1:7622/ingest/84850b89-18d7-41bb-9510-1c5a775fc6b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b850a4' },
        body: JSON.stringify({
          sessionId: 'b850a4',
          location: 'saida-actions.ts:baixaAgrupadaAction',
          message: 'validacao falhou',
          hypothesisId: 'H-updated-at',
          runId: 'post-fix-3',
          data: { issue: issue?.message, path: issue?.path },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    }
    // #endregion
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    const data = await saidaService.baixaAgrupada(ctx, parsed.data, await getSaidaRepository(), await getDestinoSaidaRepository())
    return { success: true, data, message: 'Liberação registrada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function estornarLiberacaoAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parsed = estornarLiberacaoSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { success: false, message: mensagemValidacao(fieldErrors), errors: fieldErrors }
    }
    const ctx = await getContexto()
    await saidaService.estornarLiberacao(ctx, parsed.data, await getSaidaRepository())
    return { success: true, message: 'Liberação estornada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

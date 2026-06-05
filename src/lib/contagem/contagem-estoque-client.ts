'use client'

import { isLocalDataSourceClient } from '@/lib/data-source/client'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import {
  contagemLinhaPersistSchema,
  type ContagemLinhaFormInput,
} from '@/validations/contagem/contagem-estoque-schema'
import * as contagemService from '@/services/contagem-estoque-service'
import type { ContagemEstoqueLinha } from '@/repositories/contagem-estoque-repository'
import type { VisaoContagemEstoque } from '@/services/contagem-estoque-service'

type ContextoClient = {
  userId: string
  role: UsuarioRole
}

function wrapSuccess<T>(data: T, message: string): ActionResponse<T> {
  return { success: true, data, message }
}

function wrapError<T>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) {
    return { success: false, message: error.message }
  }
  if (error instanceof Error) {
    return { success: false, message: error.message }
  }
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

function exigeLocal(): void {
  if (!isLocalDataSourceClient()) {
    throw AppError.validation('Contagem física disponível somente com DATA_SOURCE=local.')
  }
}

export const contagemEstoqueClient = {
  async listarRascunho(
    ctx: ContextoClient,
    dataContagem: string
  ): Promise<ActionResponse<VisaoContagemEstoque>> {
    try {
      exigeLocal()
      const data = await contagemService.listarContagemRascunho(ctx.userId, dataContagem)
      return wrapSuccess(data, 'Rascunho carregado.')
    } catch (error) {
      console.error('[contagemEstoqueClient.listarRascunho]', error)
      return wrapError<VisaoContagemEstoque>(error)
    }
  },

  async adicionarLinha(
    ctx: ContextoClient,
    form: ContagemLinhaFormInput
  ): Promise<ActionResponse<ContagemEstoqueLinha>> {
    try {
      exigeLocal()
      const parsed = contagemLinhaPersistSchema.safeParse(form)
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos.'
        return { success: false, message: msg }
      }
      const linha = await contagemService.criarLinhaContagem(ctx.userId, parsed.data)
      return wrapSuccess(linha, 'Apontamento adicionado.')
    } catch (error) {
      console.error('[contagemEstoqueClient.adicionarLinha]', error)
      return wrapError<ContagemEstoqueLinha>(error)
    }
  },

  async atualizarLinha(
    ctx: ContextoClient,
    linhaId: string,
    form: ContagemLinhaFormInput
  ): Promise<ActionResponse<ContagemEstoqueLinha>> {
    try {
      exigeLocal()
      const parsed = contagemLinhaPersistSchema.safeParse(form)
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos.'
        return { success: false, message: msg }
      }
      const linha = await contagemService.atualizarLinhaContagem(
        ctx.userId,
        linhaId,
        parsed.data
      )
      return wrapSuccess(linha, 'Apontamento atualizado.')
    } catch (error) {
      console.error('[contagemEstoqueClient.atualizarLinha]', error)
      return wrapError<ContagemEstoqueLinha>(error)
    }
  },

  async excluirLinha(ctx: ContextoClient, linhaId: string): Promise<ActionResponse> {
    try {
      exigeLocal()
      await contagemService.excluirLinhaContagem(ctx.userId, linhaId)
      return { success: true, message: 'Apontamento removido.' }
    } catch (error) {
      console.error('[contagemEstoqueClient.excluirLinha]', error)
      return wrapError<void>(error)
    }
  },
}

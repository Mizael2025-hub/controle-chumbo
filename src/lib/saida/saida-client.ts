'use client'

import {
  baixaAgrupadaAction,
  estornarLiberacaoAction,
  listarLiberacoesAction,
  listarMontesElegiveisSaidaAction,
} from '@/actions/saida-actions'
import { cadastroRepositoriesLocal } from '@/lib/data-source/cadastro-repositories'
import { dispatchLocalOrAction, dispatchLocalOrActionVoid } from '@/lib/data-source/client-dispatch'
import { estoqueRepositoryLocalClient } from '@/lib/data-source/estoque-repositories'
import { saidaRepositoryLocalClient } from '@/lib/data-source/saida-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { BaixaAgrupadaResult } from '@/repositories/saida-repository'
import * as saidaService from '@/services/saida-service'
import type { LiberacaoGrupoView, MonteElegivelSaida } from '@/services/saida-service'
import type {
  BaixaAgrupadaInput,
  EstornarLiberacaoInput,
} from '@/validations/saida/saida-schema'

type ContextoClient = {
  userId: string
  role: UsuarioRole
}

async function executarLocal<T>(
  operacao: () => Promise<T>,
  message: string
): Promise<ActionResponse<T>> {
  try {
    const data = await operacao()
    return { success: true, data, message }
  } catch (error) {
    console.error('[saidaClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

async function executarLocalVoid(
  operacao: () => Promise<void>,
  message: string
): Promise<ActionResponse> {
  try {
    await operacao()
    return { success: true, message }
  } catch (error) {
    console.error('[saidaClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

const listagemDeps = () => ({
  destinoRepo: cadastroRepositoriesLocal.destinos_saida,
  estoqueRepo: estoqueRepositoryLocalClient,
  setorRepo: cadastroRepositoriesLocal.setores,
})

export const saidaClient = {
  listarMontesElegiveis: (ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => saidaService.listarMontesElegiveisSaida(ctx, estoqueRepositoryLocalClient),
          ''
        ),
      () => listarMontesElegiveisSaidaAction()
    ) as Promise<ActionResponse<MonteElegivelSaida[]>>,

  listarLiberacoes: (ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () =>
            saidaService.listarLiberacoes(ctx, saidaRepositoryLocalClient, listagemDeps()),
          ''
        ),
      () => listarLiberacoesAction()
    ) as Promise<ActionResponse<LiberacaoGrupoView[]>>,

  baixaAgrupada: (ctx: ContextoClient, input: BaixaAgrupadaInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () =>
            saidaService.baixaAgrupada(
              ctx,
              input,
              saidaRepositoryLocalClient,
              cadastroRepositoriesLocal.destinos_saida
            ),
          'Liberação registrada com sucesso!'
        ),
      () => baixaAgrupadaAction(input)
    ) as Promise<ActionResponse<BaixaAgrupadaResult>>,

  estornarLiberacao: (ctx: ContextoClient, input: EstornarLiberacaoInput) =>
    dispatchLocalOrActionVoid(
      () =>
        executarLocalVoid(
          () => saidaService.estornarLiberacao(ctx, input, saidaRepositoryLocalClient),
          'Liberação estornada com sucesso!'
        ),
      () => estornarLiberacaoAction(input)
    ),
}

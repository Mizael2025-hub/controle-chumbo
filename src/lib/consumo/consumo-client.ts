'use client'

import { criarConsumoAction, listarLotesConsumoAction } from '@/actions/consumo-actions'
import { cadastroRepositoriesLocal } from '@/lib/data-source/cadastro-repositories'
import { dispatchLocalOrAction } from '@/lib/data-source/client-dispatch'
import { consumoRepositoryLocalClient } from '@/lib/data-source/consumo-repositories'
import { estoqueRepositoryLocalClient } from '@/lib/data-source/estoque-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { CriarConsumoResult, LoteConsumoOpcao } from '@/repositories/consumo-repository'
import * as consumoService from '@/services/consumo-service'
import type { CriarConsumoInput, ListarLotesConsumoInput } from '@/validations/consumo/consumo-schema'

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
    console.error('[consumoClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

const repo = () => consumoRepositoryLocalClient
const deps = () => ({
  setorRepo: cadastroRepositoriesLocal.setores,
  maquinaRepo: cadastroRepositoriesLocal.maquinas,
  operadorRepo: cadastroRepositoriesLocal.operadores,
  turnoRepo: cadastroRepositoriesLocal.turnos,
  estoqueRepo: estoqueRepositoryLocalClient,
})

export const consumoClient = {
  listarLotes: (ctx: ContextoClient, input: ListarLotesConsumoInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => consumoService.listarLotesConsumoSetor(ctx, input, repo()),
          'Lotes carregados.'
        ),
      () => listarLotesConsumoAction(input)
    ),

  criar: (ctx: ContextoClient, input: CriarConsumoInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => consumoService.criarApontamentoConsumo(ctx, input, repo(), deps()),
          'Consumo registrado com sucesso!'
        ),
      () => criarConsumoAction(input)
    ),
}

export type { CriarConsumoResult, LoteConsumoOpcao }

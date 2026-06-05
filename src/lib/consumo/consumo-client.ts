'use client'

import { isLocalDataSourceClient } from '@/lib/data-source/client'
import { consumoRepositoryLocalClient } from '@/lib/data-source/consumo-repositories'
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

async function executar<T>(
  operacao: () => Promise<T>,
  message: string
): Promise<ActionResponse<T>> {
  if (!isLocalDataSourceClient()) {
    return { success: false, message: 'Use server actions quando DATA_SOURCE=supabase.' }
  }
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

export const consumoClient = {
  listarLotes: (ctx: ContextoClient, input: ListarLotesConsumoInput) =>
    executar(
      () => consumoService.listarLotesConsumoSetor(ctx, input, repo()),
      'Lotes carregados.'
    ),

  criar: (ctx: ContextoClient, input: CriarConsumoInput) =>
    executar(
      () => consumoService.criarApontamentoConsumo(ctx, input, repo()),
      'Consumo registrado com sucesso!'
    ),
}

export type { CriarConsumoResult, LoteConsumoOpcao }

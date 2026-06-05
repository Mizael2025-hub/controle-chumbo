'use client'

import { isLocalDataSourceClient } from '@/lib/data-source/client'
import { entradaRepositoryLocalClient } from '@/lib/data-source/entrada-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as entradaService from '@/services/entrada-service'
import type { ResultadoCriarEntrada } from '@/services/entrada-service'
import type { CriarEntradaInput } from '@/validations/entrada/entrada-schema'

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
    console.error('[entradaClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

const repo = () => entradaRepositoryLocalClient

export const entradaClient = {
  criar: (ctx: ContextoClient, input: CriarEntradaInput) =>
    executar(
      () => entradaService.criarEntrada(ctx, input, repo()),
      'Lote e grade cadastrados com sucesso!'
    ) as Promise<ActionResponse<ResultadoCriarEntrada>>,
}

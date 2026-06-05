'use client'

import { isLocalDataSourceClient } from '@/lib/data-source/client'
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
    console.error('[saidaClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

async function executarVoid(
  operacao: () => Promise<void>,
  message: string
): Promise<ActionResponse> {
  if (!isLocalDataSourceClient()) {
    return { success: false, message: 'Use server actions quando DATA_SOURCE=supabase.' }
  }
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

export const saidaClient = {
  listarMontesElegiveis: (ctx: ContextoClient) =>
    executar(
      () => saidaService.listarMontesElegiveisSaida(ctx, estoqueRepositoryLocalClient),
      ''
    ) as Promise<ActionResponse<MonteElegivelSaida[]>>,

  listarLiberacoes: (ctx: ContextoClient) =>
    executar(
      () => saidaService.listarLiberacoes(ctx, saidaRepositoryLocalClient),
      ''
    ) as Promise<ActionResponse<LiberacaoGrupoView[]>>,

  baixaAgrupada: (ctx: ContextoClient, input: BaixaAgrupadaInput) =>
    executar(
      () => saidaService.baixaAgrupada(ctx, input, saidaRepositoryLocalClient),
      'Liberação registrada com sucesso!'
    ) as Promise<ActionResponse<BaixaAgrupadaResult>>,

  estornarLiberacao: (ctx: ContextoClient, input: EstornarLiberacaoInput) =>
    executarVoid(
      () => saidaService.estornarLiberacao(ctx, input, saidaRepositoryLocalClient),
      'Liberação estornada com sucesso!'
    ),
}

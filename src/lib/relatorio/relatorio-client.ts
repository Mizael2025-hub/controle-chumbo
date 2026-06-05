'use client'

import { isLocalDataSourceClient } from '@/lib/data-source/client'
import { relatorioRepositoryLocalClient } from '@/lib/data-source/relatorio-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type {
  ConsumoRelatorioDetalhe,
  EntradaRelatorioDetalhe,
  RelatorioResultado,
} from '@/services/relatorio-service'
import * as relatorioService from '@/services/relatorio-service'
import type { RelatorioConsultaInput } from '@/validations/relatorio/relatorio-schema'

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
    console.error('[relatorioClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

const repo = () => relatorioRepositoryLocalClient

export const relatorioClient = {
  consultar: (ctx: ContextoClient, input: RelatorioConsultaInput) =>
    executar(
      () => relatorioService.consultarRelatorio(ctx, input, repo()),
      'Relatório carregado.'
    ),

  exportarCsv: (ctx: ContextoClient, input: RelatorioConsultaInput) =>
    executar(
      () => relatorioService.gerarCsvRelatorio(ctx, input, repo()),
      'CSV gerado.'
    ),

  buscarEntradaDetalhe: (ctx: ContextoClient, loteId: string) =>
    executar(
      () => relatorioService.buscarEntradaDetalhe(ctx, loteId, repo()),
      'Detalhe carregado.'
    ),

  buscarConsumoDetalhe: (ctx: ContextoClient, apontamentoId: string) =>
    executar(
      () => relatorioService.buscarConsumoDetalhe(ctx, apontamentoId, repo()),
      'Detalhe carregado.'
    ),
}

export type { ConsumoRelatorioDetalhe, EntradaRelatorioDetalhe, RelatorioResultado }

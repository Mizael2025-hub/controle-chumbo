'use client'

import {
  buscarConsumoDetalheAction,
  buscarEntradaDetalheAction,
  consultarRelatorioAction,
  exportarCsvRelatorioAction,
} from '@/actions/relatorio-actions'
import { cadastroRepositoriesLocal } from '@/lib/data-source/cadastro-repositories'
import { dispatchLocalOrAction } from '@/lib/data-source/client-dispatch'
import { estoqueRepositoryLocalClient } from '@/lib/data-source/estoque-repositories'
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

async function executarLocal<T>(
  operacao: () => Promise<T>,
  message: string
): Promise<ActionResponse<T>> {
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
const deps = () => ({
  ligaRepo: cadastroRepositoriesLocal.ligas,
  destinoRepo: cadastroRepositoriesLocal.destinos_saida,
  estoqueRepo: estoqueRepositoryLocalClient,
  setorRepo: cadastroRepositoriesLocal.setores,
})

export const relatorioClient = {
  consultar: (ctx: ContextoClient, input: RelatorioConsultaInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => relatorioService.consultarRelatorio(ctx, input, repo(), deps()),
          'Relatório carregado.'
        ),
      () => consultarRelatorioAction(input)
    ),

  exportarCsv: (ctx: ContextoClient, input: RelatorioConsultaInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => relatorioService.gerarCsvRelatorio(ctx, input, repo(), deps()),
          'CSV gerado.'
        ),
      () => exportarCsvRelatorioAction(input)
    ),

  buscarEntradaDetalhe: (ctx: ContextoClient, loteId: string) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => relatorioService.buscarEntradaDetalhe(ctx, loteId, repo(), deps()),
          'Detalhe carregado.'
        ),
      () => buscarEntradaDetalheAction(loteId)
    ),

  buscarConsumoDetalhe: (ctx: ContextoClient, apontamentoId: string) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => relatorioService.buscarConsumoDetalhe(ctx, apontamentoId, repo(), deps()),
          'Detalhe carregado.'
        ),
      () => buscarConsumoDetalheAction(apontamentoId)
    ),
}

export type { ConsumoRelatorioDetalhe, EntradaRelatorioDetalhe, RelatorioResultado }

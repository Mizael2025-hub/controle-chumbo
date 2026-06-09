'use client'

import {
  baixaMonteAction,
  cancelarReservaMonteAction,
  devolverMonteAlmoxarifadoAction,
  listarHistoricoMonteAction,
  moverMonteSetorAction,
  reservarMonteAction,
  trocarPosicaoMonteAction,
} from '@/actions/monte-actions'
import { cadastroRepositoriesLocal } from '@/lib/data-source/cadastro-repositories'
import { dispatchLocalOrAction } from '@/lib/data-source/client-dispatch'
import { monteRepositoryLocalClient } from '@/lib/data-source/monte-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as monteService from '@/services/monte-service'
import type { LinhaHistoricoMonte } from '@/services/monte-service'
import type {
  BaixaMonteInput,
  CancelarReservaMonteInput,
  DevolverMonteAlmoxarifadoInput,
  HistoricoMonteInput,
  MoverMonteSetorInput,
  ReservarMonteInput,
  TrocarPosicaoMonteInput,
} from '@/validations/monte/monte-schema'

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
    console.error('[monteClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

const repo = () => monteRepositoryLocalClient
const setores = () => cadastroRepositoriesLocal.setores
const destinos = () => cadastroRepositoriesLocal.destinos_saida

export const monteClient = {
  reservar: (ctx: ContextoClient, input: ReservarMonteInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => monteService.reservarMonte(ctx, input, repo(), setores()),
          'Reserva registrada com sucesso!'
        ),
      () => reservarMonteAction(input)
    ),

  cancelarReserva: (ctx: ContextoClient, input: CancelarReservaMonteInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => monteService.cancelarReservaMonte(ctx, input, repo()),
          'Reserva cancelada com sucesso!'
        ),
      () => cancelarReservaMonteAction(input)
    ),

  baixa: (ctx: ContextoClient, input: BaixaMonteInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => monteService.baixaMonte(ctx, input, repo(), destinos()),
          'Baixa registrada com sucesso!'
        ),
      () => baixaMonteAction(input)
    ),

  moverSetor: (ctx: ContextoClient, input: MoverMonteSetorInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => monteService.moverMonteParaSetor(ctx, input, repo(), setores()),
          'Monte movido para o setor!'
        ),
      () => moverMonteSetorAction(input)
    ),

  devolverAlmoxarifado: (ctx: ContextoClient, input: DevolverMonteAlmoxarifadoInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => monteService.devolverMonteAlmoxarifado(ctx, input, repo(), setores()),
          'Monte devolvido ao almoxarifado!'
        ),
      () => devolverMonteAlmoxarifadoAction(input)
    ),

  trocarPosicao: (ctx: ContextoClient, input: TrocarPosicaoMonteInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal(
          () => monteService.trocarPosicaoMonte(ctx, input, repo()),
          'Posição atualizada!'
        ),
      () => trocarPosicaoMonteAction(input)
    ),

  listarHistorico: (ctx: ContextoClient, input: HistoricoMonteInput) =>
    dispatchLocalOrAction(
      () =>
        executarLocal<LinhaHistoricoMonte[]>(
          () => monteService.listarHistoricoMonte(ctx, input.monte_id, repo(), destinos()),
          'Histórico carregado.'
        ),
      () => listarHistoricoMonteAction(input)
    ),
}

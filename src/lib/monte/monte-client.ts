'use client'

import { isLocalDataSourceClient } from '@/lib/data-source/client'
import { monteRepositoryLocalClient } from '@/lib/data-source/monte-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as monteService from '@/services/monte-service'
import type {
  BaixaMonteInput,
  CancelarReservaMonteInput,
  DevolverMonteAlmoxarifadoInput,
  MoverMonteSetorInput,
  ReservarMonteInput,
  HistoricoMonteInput,
  TrocarPosicaoMonteInput,
} from '@/validations/monte/monte-schema'
import type { LinhaHistoricoMonte } from '@/services/monte-service'

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
    console.error('[monteClient]', error)
    if (error instanceof AppError) return { success: false, message: error.message }
    if (error instanceof Error) return { success: false, message: error.message }
    return { success: false, message: 'Erro interno ao processar a solicitação.' }
  }
}

const repo = () => monteRepositoryLocalClient

export const monteClient = {
  reservar: (ctx: ContextoClient, input: ReservarMonteInput) =>
    executar(() => monteService.reservarMonte(ctx, input, repo()), 'Reserva registrada com sucesso!'),

  cancelarReserva: (ctx: ContextoClient, input: CancelarReservaMonteInput) =>
    executar(
      () => monteService.cancelarReservaMonte(ctx, input, repo()),
      'Reserva cancelada com sucesso!'
    ),

  baixa: (ctx: ContextoClient, input: BaixaMonteInput) =>
    executar(() => monteService.baixaMonte(ctx, input, repo()), 'Baixa registrada com sucesso!'),

  moverSetor: (ctx: ContextoClient, input: MoverMonteSetorInput) =>
    executar(() => monteService.moverMonteParaSetor(ctx, input, repo()), 'Monte movido para o setor!'),

  devolverAlmoxarifado: (ctx: ContextoClient, input: DevolverMonteAlmoxarifadoInput) =>
    executar(
      () => monteService.devolverMonteAlmoxarifado(ctx, input, repo()),
      'Monte devolvido ao almoxarifado!'
    ),

  trocarPosicao: (ctx: ContextoClient, input: TrocarPosicaoMonteInput) =>
    executar(() => monteService.trocarPosicaoMonte(ctx, input, repo()), 'Posição atualizada!'),

  listarHistorico: (ctx: ContextoClient, input: HistoricoMonteInput) =>
    executar<LinhaHistoricoMonte[]>(
      () => monteService.listarHistoricoMonte(ctx, input.monte_id, repo()),
      'Histórico carregado.'
    ),
}

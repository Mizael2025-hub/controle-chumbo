'use client'

import {
  atualizarDestinoAction,
  atualizarLigaAction,
  atualizarMaquinaAction,
  atualizarModeloProdutoAction,
  atualizarOperadorAction,
  atualizarSetorAction,
  atualizarTurnoAction,
  criarDestinoAction,
  criarLigaAction,
  criarMaquinaAction,
  criarModeloProdutoAction,
  criarOperadorAction,
  criarSetorAction,
  criarTurnoAction,
  excluirDestinoAction,
  excluirLigaAction,
  excluirMaquinaAction,
  excluirModeloProdutoAction,
  excluirOperadorAction,
  excluirSetorAction,
  excluirTurnoAction,
  listarDestinosAction,
  listarLigasAction,
  listarMaquinasAction,
  listarModelosProdutoAction,
  listarOperadoresAction,
  listarSetoresAction,
  listarTurnosAction,
} from '@/actions/cadastro-actions'
import { dispatchLocalOrAction, dispatchLocalOrActionVoid } from '@/lib/data-source/client-dispatch'
import { ensureDbOpen } from '@/lib/offline/db'
import { cadastroRepositoriesLocal } from '@/lib/data-source/cadastro-repositories'
import { AppError } from '@/lib/errors/app-error'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { ActionResponse } from '@/lib/types/action-response'
import * as cadastroService from '@/services/cadastro-service'

type ContextoClient = {
  userId: string
  role: UsuarioRole
}

function wrapSuccess<T>(data: T, message: string): ActionResponse<T> {
  return { success: true, data, message }
}

function wrapError(error: unknown): ActionResponse {
  if (error instanceof AppError) {
    return { success: false, message: error.message }
  }
  if (error instanceof Error) {
    return { success: false, message: error.message }
  }
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

async function executarCadastroLocal<T>(
  operacao: () => Promise<T>,
  message: string
): Promise<ActionResponse<T>> {
  try {
    await ensureDbOpen()
    const data = await operacao()
    return wrapSuccess(data, message)
  } catch (error) {
    console.error('[executarCadastroLocal]', error)
    return wrapError(error) as ActionResponse<T>
  }
}

async function executarCadastroLocalVoid(
  operacao: () => Promise<void>,
  message: string
): Promise<ActionResponse> {
  try {
    await ensureDbOpen()
    await operacao()
    return { success: true, message }
  } catch (error) {
    console.error('[executarCadastroLocalVoid]', error)
    return wrapError(error)
  }
}

export const cadastroClient = {
  listarLigas: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.listarLigas(_ctx, cadastroRepositoriesLocal.ligas),
          ''
        ),
      () => listarLigasAction()
    ),

  criarLiga: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarLiga>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.criarLiga(_ctx, input, cadastroRepositoriesLocal.ligas),
          'Liga criada com sucesso!'
        ),
      () => criarLigaAction(input)
    ),

  atualizarLiga: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarLiga>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.atualizarLiga(_ctx, input, cadastroRepositoriesLocal.ligas),
          'Liga atualizada com sucesso!'
        ),
      () => atualizarLigaAction(input)
    ),

  excluirLiga: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          () => cadastroService.excluirLiga(_ctx, id, cadastroRepositoriesLocal.ligas),
          'Liga desativada com sucesso!'
        ),
      () => excluirLigaAction({ id })
    ),

  listarSetores: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.listarSetores(_ctx, cadastroRepositoriesLocal.setores),
          ''
        ),
      () => listarSetoresAction()
    ),

  criarSetor: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarSetor>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.criarSetor(_ctx, input, cadastroRepositoriesLocal.setores),
          'Setor criado com sucesso!'
        ),
      () => criarSetorAction(input)
    ),

  atualizarSetor: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarSetor>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.atualizarSetor(_ctx, input, cadastroRepositoriesLocal.setores),
          'Setor atualizado com sucesso!'
        ),
      () => atualizarSetorAction(input)
    ),

  excluirSetor: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          () => cadastroService.excluirSetor(_ctx, id, cadastroRepositoriesLocal.setores),
          'Setor desativado com sucesso!'
        ),
      () => excluirSetorAction({ id })
    ),

  listarDestinos: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.listarDestinos(_ctx, cadastroRepositoriesLocal.destinos_saida),
          ''
        ),
      () => listarDestinosAction()
    ),

  criarDestino: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarDestino>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.criarDestino(_ctx, input, cadastroRepositoriesLocal.destinos_saida),
          'Destino criado com sucesso!'
        ),
      () => criarDestinoAction(input)
    ),

  atualizarDestino: (
    _ctx: ContextoClient,
    input: Parameters<typeof cadastroService.atualizarDestino>[1]
  ) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () =>
            cadastroService.atualizarDestino(_ctx, input, cadastroRepositoriesLocal.destinos_saida),
          'Destino atualizado com sucesso!'
        ),
      () => atualizarDestinoAction(input)
    ),

  excluirDestino: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          () => cadastroService.excluirDestino(_ctx, id, cadastroRepositoriesLocal.destinos_saida),
          'Destino desativado com sucesso!'
        ),
      () => excluirDestinoAction({ id })
    ),

  listarOperadores: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.listarOperadores(_ctx, cadastroRepositoriesLocal.operadores),
          ''
        ),
      () => listarOperadoresAction()
    ),

  criarOperador: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarOperador>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.criarOperador(_ctx, input, cadastroRepositoriesLocal.operadores),
          'Operador criado com sucesso!'
        ),
      () => criarOperadorAction(input)
    ),

  atualizarOperador: (
    _ctx: ContextoClient,
    input: Parameters<typeof cadastroService.atualizarOperador>[1]
  ) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.atualizarOperador(_ctx, input, cadastroRepositoriesLocal.operadores),
          'Operador atualizado com sucesso!'
        ),
      () => atualizarOperadorAction(input)
    ),

  excluirOperador: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          () => cadastroService.excluirOperador(_ctx, id, cadastroRepositoriesLocal.operadores),
          'Operador desativado com sucesso!'
        ),
      () => excluirOperadorAction({ id })
    ),

  listarTurnos: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.listarTurnos(_ctx, cadastroRepositoriesLocal.turnos),
          ''
        ),
      () => listarTurnosAction()
    ),

  criarTurno: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarTurno>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.criarTurno(_ctx, input, cadastroRepositoriesLocal.turnos),
          'Turno criado com sucesso!'
        ),
      () => criarTurnoAction(input)
    ),

  atualizarTurno: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarTurno>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.atualizarTurno(_ctx, input, cadastroRepositoriesLocal.turnos),
          'Turno atualizado com sucesso!'
        ),
      () => atualizarTurnoAction(input)
    ),

  excluirTurno: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          () => cadastroService.excluirTurno(_ctx, id, cadastroRepositoriesLocal.turnos),
          'Turno desativado com sucesso!'
        ),
      () => excluirTurnoAction({ id })
    ),

  listarModelosProduto: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () =>
            cadastroService.listarModelosProduto(_ctx, cadastroRepositoriesLocal.modelos_produto),
          ''
        ),
      () => listarModelosProdutoAction()
    ),

  criarModeloProduto: (
    _ctx: ContextoClient,
    input: Parameters<typeof cadastroService.criarModeloProduto>[1]
  ) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () =>
            cadastroService.criarModeloProduto(_ctx, input, cadastroRepositoriesLocal.modelos_produto),
          'Modelo criado com sucesso!'
        ),
      () => criarModeloProdutoAction(input)
    ),

  atualizarModeloProduto: (
    _ctx: ContextoClient,
    input: Parameters<typeof cadastroService.atualizarModeloProduto>[1]
  ) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () =>
            cadastroService.atualizarModeloProduto(
              _ctx,
              input,
              cadastroRepositoriesLocal.modelos_produto
            ),
          'Modelo atualizado com sucesso!'
        ),
      () => atualizarModeloProdutoAction(input)
    ),

  excluirModeloProduto: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          () =>
            cadastroService.excluirModeloProduto(_ctx, id, cadastroRepositoriesLocal.modelos_produto),
          'Modelo desativado com sucesso!'
        ),
      () => excluirModeloProdutoAction({ id })
    ),

  listarMaquinas: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () => cadastroService.listarMaquinas(_ctx, cadastroRepositoriesLocal.maquinas),
          ''
        ),
      () => listarMaquinasAction()
    ),

  criarMaquina: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarMaquina>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () =>
            cadastroService.criarMaquina(
              _ctx,
              input,
              cadastroRepositoriesLocal.maquinas,
              cadastroRepositoriesLocal.setores
            ),
          'Máquina criada com sucesso!'
        ),
      () => criarMaquinaAction(input)
    ),

  atualizarMaquina: (
    _ctx: ContextoClient,
    input: Parameters<typeof cadastroService.atualizarMaquina>[1]
  ) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          () =>
            cadastroService.atualizarMaquina(
              _ctx,
              input,
              cadastroRepositoriesLocal.maquinas,
              cadastroRepositoriesLocal.setores
            ),
          'Máquina atualizada com sucesso!'
        ),
      () => atualizarMaquinaAction(input)
    ),

  excluirMaquina: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          () => cadastroService.excluirMaquina(_ctx, id, cadastroRepositoriesLocal.maquinas),
          'Máquina desativada com sucesso!'
        ),
      () => excluirMaquinaAction({ id })
    ),
}

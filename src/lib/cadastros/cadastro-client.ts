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
import { AppError } from '@/lib/errors/app-error'
import type { cadastroRepositoriesLocal as CadastroRepositoriesLocal } from '@/lib/data-source/cadastro-repositories'
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

async function abrirCadastroLocal() {
  const [{ ensureDbOpen }, { cadastroRepositoriesLocal }] = await Promise.all([
    import('@/lib/offline/db'),
    import('@/lib/data-source/cadastro-repositories'),
  ])
  await ensureDbOpen()
  return cadastroRepositoriesLocal as typeof CadastroRepositoriesLocal
}

async function executarCadastroLocal<T>(
  operacao: (repos: typeof CadastroRepositoriesLocal) => Promise<T>,
  message: string
): Promise<ActionResponse<T>> {
  try {
    const repos = await abrirCadastroLocal()
    const data = await operacao(repos)
    return wrapSuccess(data, message)
  } catch (error) {
    console.error('[executarCadastroLocal]', error)
    return wrapError(error) as ActionResponse<T>
  }
}

async function executarCadastroLocalVoid(
  operacao: (repos: typeof CadastroRepositoriesLocal) => Promise<void>,
  message: string
): Promise<ActionResponse> {
  try {
    const repos = await abrirCadastroLocal()
    await operacao(repos)
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
          (repos) => cadastroService.listarLigas(_ctx, repos.ligas),
          ''
        ),
      () => listarLigasAction()
    ),

  criarLiga: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarLiga>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.criarLiga(_ctx, input, repos.ligas),
          'Liga criada com sucesso!'
        ),
      () => criarLigaAction(input)
    ),

  atualizarLiga: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarLiga>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.atualizarLiga(_ctx, input, repos.ligas),
          'Liga atualizada com sucesso!'
        ),
      () => atualizarLigaAction(input)
    ),

  excluirLiga: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          (repos) => cadastroService.excluirLiga(_ctx, id, repos.ligas),
          'Liga desativada com sucesso!'
        ),
      () => excluirLigaAction({ id })
    ),

  listarSetores: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.listarSetores(_ctx, repos.setores),
          ''
        ),
      () => listarSetoresAction()
    ),

  criarSetor: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarSetor>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.criarSetor(_ctx, input, repos.setores),
          'Setor criado com sucesso!'
        ),
      () => criarSetorAction(input)
    ),

  atualizarSetor: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarSetor>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.atualizarSetor(_ctx, input, repos.setores),
          'Setor atualizado com sucesso!'
        ),
      () => atualizarSetorAction(input)
    ),

  excluirSetor: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          (repos) => cadastroService.excluirSetor(_ctx, id, repos.setores),
          'Setor desativado com sucesso!'
        ),
      () => excluirSetorAction({ id })
    ),

  listarDestinos: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.listarDestinos(_ctx, repos.destinos_saida),
          ''
        ),
      () => listarDestinosAction()
    ),

  criarDestino: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarDestino>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.criarDestino(_ctx, input, repos.destinos_saida),
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
          (repos) =>
            cadastroService.atualizarDestino(_ctx, input, repos.destinos_saida),
          'Destino atualizado com sucesso!'
        ),
      () => atualizarDestinoAction(input)
    ),

  excluirDestino: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          (repos) => cadastroService.excluirDestino(_ctx, id, repos.destinos_saida),
          'Destino desativado com sucesso!'
        ),
      () => excluirDestinoAction({ id })
    ),

  listarOperadores: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.listarOperadores(_ctx, repos.operadores),
          ''
        ),
      () => listarOperadoresAction()
    ),

  criarOperador: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarOperador>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.criarOperador(_ctx, input, repos.operadores),
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
          (repos) => cadastroService.atualizarOperador(_ctx, input, repos.operadores),
          'Operador atualizado com sucesso!'
        ),
      () => atualizarOperadorAction(input)
    ),

  excluirOperador: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          (repos) => cadastroService.excluirOperador(_ctx, id, repos.operadores),
          'Operador desativado com sucesso!'
        ),
      () => excluirOperadorAction({ id })
    ),

  listarTurnos: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.listarTurnos(_ctx, repos.turnos),
          ''
        ),
      () => listarTurnosAction()
    ),

  criarTurno: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarTurno>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.criarTurno(_ctx, input, repos.turnos),
          'Turno criado com sucesso!'
        ),
      () => criarTurnoAction(input)
    ),

  atualizarTurno: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarTurno>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.atualizarTurno(_ctx, input, repos.turnos),
          'Turno atualizado com sucesso!'
        ),
      () => atualizarTurnoAction(input)
    ),

  excluirTurno: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          (repos) => cadastroService.excluirTurno(_ctx, id, repos.turnos),
          'Turno desativado com sucesso!'
        ),
      () => excluirTurnoAction({ id })
    ),

  listarModelosProduto: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) =>
            cadastroService.listarModelosProduto(_ctx, repos.modelos_produto),
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
          (repos) =>
            cadastroService.criarModeloProduto(_ctx, input, repos.modelos_produto),
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
          (repos) =>
            cadastroService.atualizarModeloProduto(
              _ctx,
              input,
              repos.modelos_produto
            ),
          'Modelo atualizado com sucesso!'
        ),
      () => atualizarModeloProdutoAction(input)
    ),

  excluirModeloProduto: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          (repos) =>
            cadastroService.excluirModeloProduto(_ctx, id, repos.modelos_produto),
          'Modelo desativado com sucesso!'
        ),
      () => excluirModeloProdutoAction({ id })
    ),

  listarMaquinas: (_ctx: ContextoClient) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) => cadastroService.listarMaquinas(_ctx, repos.maquinas),
          ''
        ),
      () => listarMaquinasAction()
    ),

  criarMaquina: (_ctx: ContextoClient, input: Parameters<typeof cadastroService.criarMaquina>[1]) =>
    dispatchLocalOrAction(
      () =>
        executarCadastroLocal(
          (repos) =>
            cadastroService.criarMaquina(
              _ctx,
              input,
              repos.maquinas,
              repos.setores
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
          (repos) =>
            cadastroService.atualizarMaquina(
              _ctx,
              input,
              repos.maquinas,
              repos.setores
            ),
          'Máquina atualizada com sucesso!'
        ),
      () => atualizarMaquinaAction(input)
    ),

  excluirMaquina: (_ctx: ContextoClient, id: string) =>
    dispatchLocalOrActionVoid(
      () =>
        executarCadastroLocalVoid(
          (repos) => cadastroService.excluirMaquina(_ctx, id, repos.maquinas),
          'Máquina desativada com sucesso!'
        ),
      () => excluirMaquinaAction({ id })
    ),
}

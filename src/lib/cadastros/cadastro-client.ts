'use client'

import { isLocalDataSourceClient } from '@/lib/data-source/client'
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

/** Executa operação de cadastro no Dexie (client) quando DATA_SOURCE=local. */
export async function executarCadastroLocal<T>(
  operacao: () => Promise<T>,
  message: string
): Promise<ActionResponse<T>> {
  if (!isLocalDataSourceClient()) {
    return { success: false, message: 'Use server actions quando DATA_SOURCE=supabase.' }
  }

  try {
    const data = await operacao()
    return wrapSuccess(data, message)
  } catch (error) {
    console.error('[executarCadastroLocal]', error)
    return wrapError(error) as ActionResponse<T>
  }
}

/** Variante para operações sem retorno (ex.: soft delete). */
export async function executarCadastroLocalVoid(
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
    console.error('[executarCadastroLocalVoid]', error)
    return wrapError(error)
  }
}

export const cadastroClient = {
  listarLigas: (ctx: ContextoClient) =>
    executarCadastroLocal(
      () => cadastroService.listarLigas(ctx, cadastroRepositoriesLocal.ligas),
      ''
    ),

  criarLiga: (ctx: ContextoClient, input: Parameters<typeof cadastroService.criarLiga>[1]) =>
    executarCadastroLocal(
      () => cadastroService.criarLiga(ctx, input, cadastroRepositoriesLocal.ligas),
      'Liga criada com sucesso!'
    ),

  atualizarLiga: (ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarLiga>[1]) =>
    executarCadastroLocal(
      () => cadastroService.atualizarLiga(ctx, input, cadastroRepositoriesLocal.ligas),
      'Liga atualizada com sucesso!'
    ),

  excluirLiga: (ctx: ContextoClient, id: string) =>
    executarCadastroLocalVoid(
      () => cadastroService.excluirLiga(ctx, id, cadastroRepositoriesLocal.ligas),
      'Liga desativada com sucesso!'
    ),

  listarSetores: (ctx: ContextoClient) =>
    executarCadastroLocal(
      () => cadastroService.listarSetores(ctx, cadastroRepositoriesLocal.setores),
      ''
    ),

  criarSetor: (ctx: ContextoClient, input: Parameters<typeof cadastroService.criarSetor>[1]) =>
    executarCadastroLocal(
      () => cadastroService.criarSetor(ctx, input, cadastroRepositoriesLocal.setores),
      'Setor criado com sucesso!'
    ),

  atualizarSetor: (ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarSetor>[1]) =>
    executarCadastroLocal(
      () => cadastroService.atualizarSetor(ctx, input, cadastroRepositoriesLocal.setores),
      'Setor atualizado com sucesso!'
    ),

  excluirSetor: (ctx: ContextoClient, id: string) =>
    executarCadastroLocalVoid(
      () => cadastroService.excluirSetor(ctx, id, cadastroRepositoriesLocal.setores),
      'Setor desativado com sucesso!'
    ),

  listarDestinos: (ctx: ContextoClient) =>
    executarCadastroLocal(
      () => cadastroService.listarDestinos(ctx, cadastroRepositoriesLocal.destinos_saida),
      ''
    ),

  criarDestino: (ctx: ContextoClient, input: Parameters<typeof cadastroService.criarDestino>[1]) =>
    executarCadastroLocal(
      () => cadastroService.criarDestino(ctx, input, cadastroRepositoriesLocal.destinos_saida),
      'Destino criado com sucesso!'
    ),

  atualizarDestino: (
    ctx: ContextoClient,
    input: Parameters<typeof cadastroService.atualizarDestino>[1]
  ) =>
    executarCadastroLocal(
      () => cadastroService.atualizarDestino(ctx, input, cadastroRepositoriesLocal.destinos_saida),
      'Destino atualizado com sucesso!'
    ),

  excluirDestino: (ctx: ContextoClient, id: string) =>
    executarCadastroLocalVoid(
      () => cadastroService.excluirDestino(ctx, id, cadastroRepositoriesLocal.destinos_saida),
      'Destino desativado com sucesso!'
    ),

  listarOperadores: (ctx: ContextoClient) =>
    executarCadastroLocal(
      () => cadastroService.listarOperadores(ctx, cadastroRepositoriesLocal.operadores),
      ''
    ),

  criarOperador: (ctx: ContextoClient, input: Parameters<typeof cadastroService.criarOperador>[1]) =>
    executarCadastroLocal(
      () => cadastroService.criarOperador(ctx, input, cadastroRepositoriesLocal.operadores),
      'Operador criado com sucesso!'
    ),

  atualizarOperador: (
    ctx: ContextoClient,
    input: Parameters<typeof cadastroService.atualizarOperador>[1]
  ) =>
    executarCadastroLocal(
      () => cadastroService.atualizarOperador(ctx, input, cadastroRepositoriesLocal.operadores),
      'Operador atualizado com sucesso!'
    ),

  excluirOperador: (ctx: ContextoClient, id: string) =>
    executarCadastroLocalVoid(
      () => cadastroService.excluirOperador(ctx, id, cadastroRepositoriesLocal.operadores),
      'Operador desativado com sucesso!'
    ),

  listarTurnos: (ctx: ContextoClient) =>
    executarCadastroLocal(
      () => cadastroService.listarTurnos(ctx, cadastroRepositoriesLocal.turnos),
      ''
    ),

  criarTurno: (ctx: ContextoClient, input: Parameters<typeof cadastroService.criarTurno>[1]) =>
    executarCadastroLocal(
      () => cadastroService.criarTurno(ctx, input, cadastroRepositoriesLocal.turnos),
      'Turno criado com sucesso!'
    ),

  atualizarTurno: (ctx: ContextoClient, input: Parameters<typeof cadastroService.atualizarTurno>[1]) =>
    executarCadastroLocal(
      () => cadastroService.atualizarTurno(ctx, input, cadastroRepositoriesLocal.turnos),
      'Turno atualizado com sucesso!'
    ),

  excluirTurno: (ctx: ContextoClient, id: string) =>
    executarCadastroLocalVoid(
      () => cadastroService.excluirTurno(ctx, id, cadastroRepositoriesLocal.turnos),
      'Turno desativado com sucesso!'
    ),

  listarModelosProduto: (ctx: ContextoClient) =>
    executarCadastroLocal(
      () => cadastroService.listarModelosProduto(ctx, cadastroRepositoriesLocal.modelos_produto),
      ''
    ),

  criarModeloProduto: (
    ctx: ContextoClient,
    input: Parameters<typeof cadastroService.criarModeloProduto>[1]
  ) =>
    executarCadastroLocal(
      () =>
        cadastroService.criarModeloProduto(ctx, input, cadastroRepositoriesLocal.modelos_produto),
      'Modelo criado com sucesso!'
    ),

  atualizarModeloProduto: (
    ctx: ContextoClient,
    input: Parameters<typeof cadastroService.atualizarModeloProduto>[1]
  ) =>
    executarCadastroLocal(
      () =>
        cadastroService.atualizarModeloProduto(
          ctx,
          input,
          cadastroRepositoriesLocal.modelos_produto
        ),
      'Modelo atualizado com sucesso!'
    ),

  excluirModeloProduto: (ctx: ContextoClient, id: string) =>
    executarCadastroLocalVoid(
      () =>
        cadastroService.excluirModeloProduto(ctx, id, cadastroRepositoriesLocal.modelos_produto),
      'Modelo desativado com sucesso!'
    ),

  listarMaquinas: (ctx: ContextoClient) =>
    executarCadastroLocal(
      () => cadastroService.listarMaquinas(ctx, cadastroRepositoriesLocal.maquinas),
      ''
    ),

  criarMaquina: (ctx: ContextoClient, input: Parameters<typeof cadastroService.criarMaquina>[1]) =>
    executarCadastroLocal(
      () => cadastroService.criarMaquina(ctx, input, cadastroRepositoriesLocal.maquinas),
      'Máquina criada com sucesso!'
    ),

  atualizarMaquina: (
    ctx: ContextoClient,
    input: Parameters<typeof cadastroService.atualizarMaquina>[1]
  ) =>
    executarCadastroLocal(
      () => cadastroService.atualizarMaquina(ctx, input, cadastroRepositoriesLocal.maquinas),
      'Máquina atualizada com sucesso!'
    ),

  excluirMaquina: (ctx: ContextoClient, id: string) =>
    executarCadastroLocalVoid(
      () => cadastroService.excluirMaquina(ctx, id, cadastroRepositoriesLocal.maquinas),
      'Máquina desativada com sucesso!'
    ),
}

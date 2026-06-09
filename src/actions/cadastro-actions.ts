'use server'

import {
  getDestinoSaidaRepository,
  getLigaRepository,
  getMaquinaRepository,
  getModeloProdutoRepository,
  getOperadorRepository,
  getSetorRepository,
  getTurnoRepository,
} from '@/lib/data-source/server-repositories'

import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AppError } from '@/lib/errors/app-error'
import type {
  DestinoSaida,
  Liga,
  Maquina,
  ModeloProduto,
  Operador,
  Setor,
  Turno,
} from '@/repositories/cadastro-repository'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { ActionResponse } from '@/lib/types/action-response'
import * as cadastroService from '@/services/cadastro-service'
import {
  atualizarCadastroSimplesSchema,
  atualizarDestinoSchema,
  atualizarLigaSchema,
  atualizarMaquinaSchema,
  atualizarModeloProdutoSchema,
  atualizarSetorSchema,
  criarCadastroSimplesSchema,
  criarDestinoSchema,
  criarLigaSchema,
  criarMaquinaSchema,
  criarModeloProdutoSchema,
  criarSetorSchema,
  excluirCadastroSchema,
} from '@/validations/cadastros/cadastro-schema'

async function getContexto() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()
  if (!role) throw AppError.unauthorized()
  return { userId: user.id, role: role as UsuarioRole }
}

function handleError<T = void>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) return { success: false, message: error.message }
  console.error('[cadastroAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function listarLigasAction(): Promise<ActionResponse<Awaited<ReturnType<typeof cadastroService.listarLigas>>>> {
  try {
    const ctx = await getContexto()
    const data = await cadastroService.listarLigas(ctx, await getLigaRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function criarLigaAction(rawData: unknown): Promise<ActionResponse<Liga>> {
  try {
    const parsed = criarLigaSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.criarLiga(ctx, parsed.data, await getLigaRepository())
    return { success: true, data, message: 'Liga criada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function atualizarLigaAction(rawData: unknown): Promise<ActionResponse<Liga>> {
  try {
    const parsed = atualizarLigaSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.atualizarLiga(ctx, parsed.data, await getLigaRepository())
    return { success: true, data, message: 'Liga atualizada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function excluirLigaAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parsed = excluirCadastroSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    await cadastroService.excluirLiga(ctx, parsed.data.id, await getLigaRepository())
    return { success: true, message: 'Liga desativada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function listarSetoresAction(): Promise<ActionResponse<Setor[]>> {
  try {
    const ctx = await getContexto()
    const data = await cadastroService.listarSetores(ctx, await getSetorRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function criarSetorAction(rawData: unknown): Promise<ActionResponse<Setor>> {
  try {
    const parsed = criarSetorSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.criarSetor(ctx, parsed.data, await getSetorRepository())
    return { success: true, data, message: 'Setor criado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function atualizarSetorAction(rawData: unknown): Promise<ActionResponse<Setor>> {
  try {
    const parsed = atualizarSetorSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.atualizarSetor(ctx, parsed.data, await getSetorRepository())
    return { success: true, data, message: 'Setor atualizado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function excluirSetorAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parsed = excluirCadastroSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    await cadastroService.excluirSetor(ctx, parsed.data.id, await getSetorRepository())
    return { success: true, message: 'Setor desativado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function listarDestinosAction(): Promise<ActionResponse<DestinoSaida[]>> {
  try {
    const ctx = await getContexto()
    const data = await cadastroService.listarDestinos(ctx, await getDestinoSaidaRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function criarDestinoAction(rawData: unknown): Promise<ActionResponse<DestinoSaida>> {
  try {
    const parsed = criarDestinoSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.criarDestino(ctx, parsed.data, await getDestinoSaidaRepository())
    return { success: true, data, message: 'Destino criado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function atualizarDestinoAction(rawData: unknown): Promise<ActionResponse<DestinoSaida>> {
  try {
    const parsed = atualizarDestinoSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.atualizarDestino(ctx, parsed.data, await getDestinoSaidaRepository())
    return { success: true, data, message: 'Destino atualizado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function excluirDestinoAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parsed = excluirCadastroSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    await cadastroService.excluirDestino(ctx, parsed.data.id, await getDestinoSaidaRepository())
    return { success: true, message: 'Destino desativado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function listarOperadoresAction(): Promise<ActionResponse<Operador[]>> {
  try {
    const ctx = await getContexto()
    const data = await cadastroService.listarOperadores(ctx, await getOperadorRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function criarOperadorAction(rawData: unknown): Promise<ActionResponse<Operador>> {
  try {
    const parsed = criarCadastroSimplesSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.criarOperador(ctx, parsed.data, await getOperadorRepository())
    return { success: true, data, message: 'Operador criado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function atualizarOperadorAction(rawData: unknown): Promise<ActionResponse<Operador>> {
  try {
    const parsed = atualizarCadastroSimplesSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.atualizarOperador(ctx, parsed.data, await getOperadorRepository())
    return { success: true, data, message: 'Operador atualizado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function excluirOperadorAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parsed = excluirCadastroSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    await cadastroService.excluirOperador(ctx, parsed.data.id, await getOperadorRepository())
    return { success: true, message: 'Operador desativado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function listarTurnosAction(): Promise<ActionResponse<Turno[]>> {
  try {
    const ctx = await getContexto()
    const data = await cadastroService.listarTurnos(ctx, await getTurnoRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function criarTurnoAction(rawData: unknown): Promise<ActionResponse<Turno>> {
  try {
    const parsed = criarCadastroSimplesSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.criarTurno(ctx, parsed.data, await getTurnoRepository())
    return { success: true, data, message: 'Turno criado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function atualizarTurnoAction(rawData: unknown): Promise<ActionResponse<Turno>> {
  try {
    const parsed = atualizarCadastroSimplesSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.atualizarTurno(ctx, parsed.data, await getTurnoRepository())
    return { success: true, data, message: 'Turno atualizado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function excluirTurnoAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parsed = excluirCadastroSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    await cadastroService.excluirTurno(ctx, parsed.data.id, await getTurnoRepository())
    return { success: true, message: 'Turno desativado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function listarModelosProdutoAction(): Promise<ActionResponse<ModeloProduto[]>> {
  try {
    const ctx = await getContexto()
    const data = await cadastroService.listarModelosProduto(ctx, await getModeloProdutoRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function criarModeloProdutoAction(rawData: unknown): Promise<ActionResponse<ModeloProduto>> {
  try {
    const parsed = criarModeloProdutoSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.criarModeloProduto(ctx, parsed.data, await getModeloProdutoRepository())
    return { success: true, data, message: 'Modelo criado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function atualizarModeloProdutoAction(rawData: unknown): Promise<ActionResponse<ModeloProduto>> {
  try {
    const parsed = atualizarModeloProdutoSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.atualizarModeloProduto(ctx, parsed.data, await getModeloProdutoRepository())
    return { success: true, data, message: 'Modelo atualizado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function excluirModeloProdutoAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parsed = excluirCadastroSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    await cadastroService.excluirModeloProduto(ctx, parsed.data.id, await getModeloProdutoRepository())
    return { success: true, message: 'Modelo desativado com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function listarMaquinasAction(): Promise<ActionResponse<Maquina[]>> {
  try {
    const ctx = await getContexto()
    const data = await cadastroService.listarMaquinas(ctx, await getMaquinaRepository())
    return { success: true, data }
  } catch (error) {
    return handleError(error)
  }
}

export async function criarMaquinaAction(rawData: unknown): Promise<ActionResponse<Maquina>> {
  try {
    const parsed = criarMaquinaSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.criarMaquina(ctx, parsed.data, await getMaquinaRepository(), await getSetorRepository())
    return { success: true, data, message: 'Máquina criada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function atualizarMaquinaAction(rawData: unknown): Promise<ActionResponse<Maquina>> {
  try {
    const parsed = atualizarMaquinaSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    const data = await cadastroService.atualizarMaquina(ctx, parsed.data, await getMaquinaRepository(), await getSetorRepository())
    return { success: true, data, message: 'Máquina atualizada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

export async function excluirMaquinaAction(rawData: unknown): Promise<ActionResponse> {
  try {
    const parsed = excluirCadastroSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors }
    }
    const ctx = await getContexto()
    await cadastroService.excluirMaquina(ctx, parsed.data.id, await getMaquinaRepository())
    return { success: true, message: 'Máquina desativada com sucesso!' }
  } catch (error) {
    return handleError(error)
  }
}

import { v4 as uuid } from 'uuid'
import type { EntityTable } from 'dexie'
import { db } from '@/lib/offline/db'
import type {
  CadastroBase,
  CreateCadastroSimples,
  CreateDestinoInput,
  CreateModeloProdutoInput,
  CreateSetorInput,
  UpdateCadastroSimples,
  UpdateDestinoInput,
  UpdateModeloProdutoInput,
  UpdateSetorInput,
} from '@/repositories/cadastro-repository'
import { TIPO_PRODUTO_MVP } from '@/lib/types/tipo-produto-modelo'
import { AppError } from '@/lib/errors/app-error'

type CadastroSortavel = CadastroBase

export function createCadastroSimplesLocal<T extends CadastroSortavel>(
  table: EntityTable<T, 'id'>,
  entidade: string
) {
  return {
    async findAll(incluirInativos = false): Promise<T[]> {
      const registros = await table.orderBy('sort_order').toArray()
      if (incluirInativos) return registros
      return registros.filter((r) => r.is_active)
    },

    async findById(id: string): Promise<T | null> {
      const registro = await table.get(id as never)
      return registro ?? null
    },

    async create(data: CreateCadastroSimples): Promise<T> {
      const now = new Date().toISOString()
      const ultimo = await table.orderBy('sort_order').last()
      const sortOrder = data.sort_order ?? (ultimo ? ultimo.sort_order + 1 : 0)
      const registro = {
        id: uuid(),
        nome: data.nome.trim(),
        sort_order: sortOrder,
        is_active: true,
        created_by: data.created_by,
        created_at: now,
        updated_at: now,
      } as T

      await table.add(registro)
      return registro
    },

    async update(id: string, data: UpdateCadastroSimples): Promise<T | null> {
      const existente = await table.get(id as never)
      if (!existente) return null

      if (data.updated_at !== existente.updated_at) {
        throw AppError.conflict(`${entidade} foi alterado por outro usuário. Recarregue e tente novamente.`)
      }

      const atualizado = {
        ...existente,
        ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
        ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
        ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
        updated_at: new Date().toISOString(),
      }

      await table.put(atualizado)
      return atualizado
    },

    async softDelete(id: string): Promise<void> {
      const existente = await table.get(id as never)
      if (!existente) return

      await table.put({
        ...existente,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
    },

    async count(): Promise<number> {
      return table.count()
    },
  }
}

export const operadorRepositoryLocal = createCadastroSimplesLocal(db.operadores, 'Operador')
export const turnoRepositoryLocal = createCadastroSimplesLocal(db.turnos, 'Turno')

async function proximoSortOrderModelo(): Promise<number> {
  const ultimo = await db.modelos_produto.orderBy('sort_order').last()
  return ultimo ? ultimo.sort_order + 1 : 0
}

export const modeloProdutoRepositoryLocal = {
  async findAll(incluirInativos = false) {
    const registros = await db.modelos_produto.orderBy('sort_order').toArray()
    if (incluirInativos) return registros
    return registros.filter((r) => r.is_active)
  },

  async findById(id: string) {
    return (await db.modelos_produto.get(id)) ?? null
  },

  async findByNomeEPolaridade(nome: string, polaridade: string, ignorarId?: string) {
    const normalizado = nome.trim().toLowerCase()
    const registros = await db.modelos_produto
      .where('polaridade')
      .equals(polaridade)
      .filter((r) => r.is_active && r.nome.trim().toLowerCase() === normalizado)
      .toArray()
    const encontrado = registros[0]
    if (!encontrado || encontrado.id === ignorarId) return null
    return encontrado
  },

  async create(data: CreateModeloProdutoInput) {
    const now = new Date().toISOString()
    const registro = {
      id: uuid(),
      nome: data.nome.trim(),
      tipo_produto: TIPO_PRODUTO_MVP,
      polaridade: data.polaridade,
      placas_por_grade: data.placas_por_grade,
      sort_order: data.sort_order ?? (await proximoSortOrderModelo()),
      is_active: true,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    await db.modelos_produto.add(registro)
    return registro
  },

  async update(id: string, data: UpdateModeloProdutoInput) {
    const existente = await db.modelos_produto.get(id)
    if (!existente) return null
    if (data.updated_at !== existente.updated_at) {
      throw AppError.conflict(
        'Modelo de produto foi alterado por outro usuário. Recarregue e tente novamente.'
      )
    }
    const atualizado = {
      ...existente,
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.polaridade !== undefined ? { polaridade: data.polaridade } : {}),
      ...(data.placas_por_grade !== undefined
        ? { placas_por_grade: data.placas_por_grade }
        : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date().toISOString(),
    }
    await db.modelos_produto.put(atualizado)
    return atualizado
  },

  async softDelete(id: string) {
    const existente = await db.modelos_produto.get(id)
    if (!existente) return
    await db.modelos_produto.put({
      ...existente,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
  },

  async count() {
    return db.modelos_produto.count()
  },
}

async function proximoSortOrderSetor(): Promise<number> {
  const ultimo = await db.setores.orderBy('sort_order').last()
  return ultimo ? ultimo.sort_order + 1 : 0
}

async function proximoSortOrderDestino(): Promise<number> {
  const ultimo = await db.destinos_saida.orderBy('sort_order').last()
  return ultimo ? ultimo.sort_order + 1 : 0
}

async function proximoSortOrderMaquina(setorId: string): Promise<number> {
  const ultimo = await db.maquinas.where('setor_id').equals(setorId).sortBy('sort_order')
  const last = ultimo.at(-1)
  return last ? last.sort_order + 1 : 0
}

export const ligaRepositoryLocal = {
  async findAll(incluirInativos = false) {
    const registros = await db.ligas.orderBy('nome').toArray()
    if (incluirInativos) return registros
    return registros.filter((r) => r.is_active)
  },

  async findById(id: string) {
    return (await db.ligas.get(id)) ?? null
  },

  async create(data: { nome: string; chave_cor: string; created_by?: string }) {
    const now = new Date().toISOString()
    const registro = {
      id: uuid(),
      nome: data.nome.trim(),
      chave_cor: data.chave_cor,
      is_active: true,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    await db.ligas.add(registro)
    return registro
  },

  async update(
    id: string,
    data: { nome?: string; chave_cor?: string; is_active?: boolean; updated_at: string }
  ) {
    const existente = await db.ligas.get(id)
    if (!existente) return null
    if (data.updated_at !== existente.updated_at) {
      throw AppError.conflict('Liga foi alterada por outro usuário. Recarregue e tente novamente.')
    }
    const atualizado = {
      ...existente,
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.chave_cor !== undefined ? { chave_cor: data.chave_cor } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date().toISOString(),
    }
    await db.ligas.put(atualizado)
    return atualizado
  },

  async softDelete(id: string) {
    const existente = await db.ligas.get(id)
    if (!existente) return
    await db.ligas.put({
      ...existente,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
  },
}

export const setorRepositoryLocal = {
  async findAll(incluirInativos = false) {
    const registros = await db.setores.orderBy('sort_order').toArray()
    if (incluirInativos) return registros
    return registros.filter((r) => r.is_active)
  },

  async findById(id: string) {
    return (await db.setores.get(id)) ?? null
  },

  async findBySlug(slug: string) {
    return (await db.setores.where('slug').equals(slug).first()) ?? null
  },

  async create(data: CreateSetorInput) {
    const now = new Date().toISOString()
    const registro = {
      id: uuid(),
      nome: data.nome.trim(),
      slug: data.slug ?? '',
      tipo: data.tipo,
      sort_order: data.sort_order ?? (await proximoSortOrderSetor()),
      is_active: true,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    await db.setores.add(registro)
    return registro
  },

  async update(id: string, data: UpdateSetorInput) {
    const existente = await db.setores.get(id)
    if (!existente) return null
    if (data.updated_at !== existente.updated_at) {
      throw AppError.conflict('Setor foi alterado por outro usuário. Recarregue e tente novamente.')
    }
    const atualizado = {
      ...existente,
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.tipo !== undefined ? { tipo: data.tipo } : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date().toISOString(),
    }
    await db.setores.put(atualizado)
    return atualizado
  },

  async softDelete(id: string) {
    const existente = await db.setores.get(id)
    if (!existente) return
    await db.setores.put({
      ...existente,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
  },
}

export const destinoSaidaRepositoryLocal = {
  async findAll(incluirInativos = false) {
    const registros = await db.destinos_saida.orderBy('sort_order').toArray()
    if (incluirInativos) return registros
    return registros.filter((r) => r.is_active)
  },

  async findById(id: string) {
    return (await db.destinos_saida.get(id)) ?? null
  },

  async findBySlug(slug: string) {
    return (await db.destinos_saida.where('slug').equals(slug).first()) ?? null
  },

  async create(data: CreateDestinoInput) {
    const now = new Date().toISOString()
    const registro = {
      id: uuid(),
      nome: data.nome.trim(),
      slug: data.slug ?? '',
      sort_order: data.sort_order ?? (await proximoSortOrderDestino()),
      is_active: true,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    await db.destinos_saida.add(registro)
    return registro
  },

  async update(id: string, data: UpdateDestinoInput) {
    const existente = await db.destinos_saida.get(id)
    if (!existente) return null
    if (data.updated_at !== existente.updated_at) {
      throw AppError.conflict(
        'Destino foi alterado por outro usuário. Recarregue e tente novamente.'
      )
    }
    const atualizado = {
      ...existente,
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date().toISOString(),
    }
    await db.destinos_saida.put(atualizado)
    return atualizado
  },

  async softDelete(id: string) {
    const existente = await db.destinos_saida.get(id)
    if (!existente) return
    await db.destinos_saida.put({
      ...existente,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
  },

  async count() {
    return db.destinos_saida.count()
  },
}

export const maquinaRepositoryLocal = {
  async findAll(incluirInativos = false) {
    const registros = await db.maquinas.orderBy('sort_order').toArray()
    if (incluirInativos) return registros
    return registros.filter((r) => r.is_active)
  },

  async findBySetor(setorId: string, incluirInativos = false) {
    const registros = await db.maquinas.where('setor_id').equals(setorId).sortBy('sort_order')
    if (incluirInativos) return registros
    return registros.filter((r) => r.is_active)
  },

  async findById(id: string) {
    return (await db.maquinas.get(id)) ?? null
  },

  async create(data: {
    setor_id: string
    nome: string
    sort_order?: number
    created_by?: string
  }) {
    const now = new Date().toISOString()
    const registro = {
      id: uuid(),
      setor_id: data.setor_id,
      nome: data.nome.trim(),
      sort_order: data.sort_order ?? (await proximoSortOrderMaquina(data.setor_id)),
      is_active: true,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    await db.maquinas.add(registro)
    return registro
  },

  async update(
    id: string,
    data: {
      setor_id?: string
      nome?: string
      sort_order?: number
      is_active?: boolean
      updated_at: string
    }
  ) {
    const existente = await db.maquinas.get(id)
    if (!existente) return null
    if (data.updated_at !== existente.updated_at) {
      throw AppError.conflict('Máquina foi alterada por outro usuário. Recarregue e tente novamente.')
    }
    const atualizado = {
      ...existente,
      ...(data.setor_id !== undefined ? { setor_id: data.setor_id } : {}),
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date().toISOString(),
    }
    await db.maquinas.put(atualizado)
    return atualizado
  },

  async softDelete(id: string) {
    const existente = await db.maquinas.get(id)
    if (!existente) return
    await db.maquinas.put({
      ...existente,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
  },
}

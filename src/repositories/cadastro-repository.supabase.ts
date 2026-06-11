import { v4 as uuid } from 'uuid'
import { createServerSupabase } from '@/lib/supabase/server'
import {
  assertUpdatedAt,
  proximoSortOrder,
  resolveSortOrderForInsert,
  throwIfSupabaseError,
} from '@/lib/supabase/repository-utils'
import { TIPO_PRODUTO_MVP } from '@/lib/types/tipo-produto-modelo'
import type {
  CreateCadastroSimples,
  CreateDestinoInput,
  CreateLigaInput,
  CreateMaquinaInput,
  CreateModeloProdutoInput,
  CreateSetorInput,
  DestinoSaida,
  DestinoSaidaRepository,
  Liga,
  LigaRepository,
  Maquina,
  MaquinaRepository,
  ModeloProduto,
  ModeloProdutoRepository,
  OperadorRepository,
  Setor,
  SetorRepository,
  TurnoRepository,
  UpdateCadastroSimples,
  UpdateDestinoInput,
  UpdateLigaInput,
  UpdateMaquinaInput,
  UpdateModeloProdutoInput,
  UpdateSetorInput,
} from '@/repositories/cadastro-repository'

function mapOptionalCreatedBy<T extends { created_by: string | null }>(
  row: T
): Omit<T, 'created_by'> & { created_by?: string } {
  const { created_by, ...rest } = row
  return {
    ...rest,
    ...(created_by ? { created_by } : {}),
  } as Omit<T, 'created_by'> & { created_by?: string }
}

function createCadastroSimplesSupabase(tabela: 'operadores' | 'turnos', entidade: string) {
  return {
    async findAll(incluirInativos = false) {
      const supabase = await createServerSupabase()
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .order('sort_order', { ascending: true })
      throwIfSupabaseError(error, entidade)
      const registros = data ?? []
      return incluirInativos ? registros : registros.filter((r) => r.is_active)
    },

    async findById(id: string) {
      const supabase = await createServerSupabase()
      const { data, error } = await supabase.from(tabela).select('*').eq('id', id).maybeSingle()
      throwIfSupabaseError(error, entidade)
      return data
    },

    async create(data: CreateCadastroSimples) {
      const supabase = await createServerSupabase()
      const sortOrder = await resolveSortOrderForInsert(data.sort_order, () =>
        proximoSortOrder(tabela)
      )
      const registro = {
        id: uuid(),
        nome: data.nome.trim(),
        sort_order: sortOrder,
        is_active: true,
        created_by: data.created_by ?? null,
      }
      const { data: criado, error } = await supabase.from(tabela).insert(registro).select().single()
      throwIfSupabaseError(error, entidade)
      return mapOptionalCreatedBy(criado)
    },

    async update(id: string, data: UpdateCadastroSimples) {
      const supabase = await createServerSupabase()
      const { data: existente, error: erroLeitura } = await supabase
        .from(tabela)
        .select('*')
        .eq('id', id)
        .maybeSingle()
      throwIfSupabaseError(erroLeitura, entidade)
      if (!existente) return null
      assertUpdatedAt(existente, data.updated_at, entidade)

      const patch = {
        ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
        ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
        ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      }

      const { data: atualizado, error } = await supabase
        .from(tabela)
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      throwIfSupabaseError(error, entidade)
      return mapOptionalCreatedBy(atualizado)
    },

    async softDelete(id: string) {
      const supabase = await createServerSupabase()
      const { error } = await supabase.from(tabela).update({ is_active: false }).eq('id', id)
      throwIfSupabaseError(error, entidade)
    },

    async count() {
      const supabase = await createServerSupabase()
      const { count, error } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true })
      throwIfSupabaseError(error, entidade)
      return count ?? 0
    },
  }
}

export const operadorRepositorySupabase =
  createCadastroSimplesSupabase('operadores', 'Operador') as OperadorRepository

export const turnoRepositorySupabase =
  createCadastroSimplesSupabase('turnos', 'Turno') as TurnoRepository

export const ligaRepositorySupabase: LigaRepository = {
  async findAll(incluirInativos = false) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('ligas').select('*').order('nome')
    throwIfSupabaseError(error, 'Liga')
    const registros = (data ?? []) as Liga[]
    return incluirInativos ? registros : registros.filter((r) => r.is_active)
  },

  async findById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('ligas').select('*').eq('id', id).maybeSingle()
    throwIfSupabaseError(error, 'Liga')
    return data as Liga | null
  },

  async create(data: CreateLigaInput) {
    const supabase = await createServerSupabase()
    const registro = {
      id: uuid(),
      nome: data.nome.trim(),
      chave_cor: data.chave_cor,
      is_active: true,
      created_by: data.created_by ?? null,
    }
    const { data: criado, error } = await supabase.from('ligas').insert(registro).select().single()
    throwIfSupabaseError(error, 'Liga')
    return mapOptionalCreatedBy(criado) as Liga
  },

  async update(id, data: UpdateLigaInput) {
    const supabase = await createServerSupabase()
    const existente = await ligaRepositorySupabase.findById(id)
    if (!existente) return null
    assertUpdatedAt(existente, data.updated_at, 'Liga')

    const patch = {
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.chave_cor !== undefined ? { chave_cor: data.chave_cor } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    }

    const { data: atualizado, error } = await supabase
      .from('ligas')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    throwIfSupabaseError(error, 'Liga')
    return mapOptionalCreatedBy(atualizado) as Liga
  },

  async softDelete(id) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.from('ligas').update({ is_active: false }).eq('id', id)
    throwIfSupabaseError(error, 'Liga')
  },
}

export const setorRepositorySupabase: SetorRepository = {
  async findAll(incluirInativos = false) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('setores').select('*').order('sort_order')
    throwIfSupabaseError(error, 'Setor')
    const registros = data ?? []
    return incluirInativos ? registros : registros.filter((r) => r.is_active)
  },

  async findById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('setores').select('*').eq('id', id).maybeSingle()
    throwIfSupabaseError(error, 'Setor')
    return data as Setor | null
  },

  async findBySlug(slug) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('setores').select('*').eq('slug', slug).maybeSingle()
    throwIfSupabaseError(error, 'Setor')
    return data as Setor | null
  },

  async create(data: CreateSetorInput) {
    const supabase = await createServerSupabase()
    const sortOrder = await resolveSortOrderForInsert(data.sort_order, () =>
      proximoSortOrder('setores')
    )
    const registro = {
      id: uuid(),
      nome: data.nome.trim(),
      slug: data.slug ?? '',
      tipo: data.tipo,
      sort_order: sortOrder,
      is_active: true,
      created_by: data.created_by ?? null,
    }
    const { data: criado, error } = await supabase.from('setores').insert(registro).select().single()
    throwIfSupabaseError(error, 'Setor')
    return mapOptionalCreatedBy(criado) as Setor
  },

  async update(id, data: UpdateSetorInput) {
    const supabase = await createServerSupabase()
    const existente = await setorRepositorySupabase.findById(id)
    if (!existente) return null
    assertUpdatedAt(existente, data.updated_at, 'Setor')

    const patch = {
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.tipo !== undefined ? { tipo: data.tipo } : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    }

    const { data: atualizado, error } = await supabase
      .from('setores')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    throwIfSupabaseError(error, 'Setor')
    return mapOptionalCreatedBy(atualizado) as Setor
  },

  async softDelete(id) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.from('setores').update({ is_active: false }).eq('id', id)
    throwIfSupabaseError(error, 'Setor')
  },
}

export const destinoSaidaRepositorySupabase: DestinoSaidaRepository = {
  async findAll(incluirInativos = false) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('destinos_saida').select('*').order('sort_order')
    throwIfSupabaseError(error, 'Destino de saída')
    const registros = data ?? []
    return incluirInativos ? registros : registros.filter((r) => r.is_active)
  },

  async findById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('destinos_saida')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    throwIfSupabaseError(error, 'Destino de saída')
    return data as DestinoSaida | null
  },

  async findBySlug(slug) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('destinos_saida')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    throwIfSupabaseError(error, 'Destino de saída')
    return data as DestinoSaida | null
  },

  async create(data: CreateDestinoInput) {
    const supabase = await createServerSupabase()
    const sortOrder = await resolveSortOrderForInsert(data.sort_order, () =>
      proximoSortOrder('destinos_saida')
    )
    const registro = {
      id: uuid(),
      nome: data.nome.trim(),
      slug: data.slug ?? '',
      sort_order: sortOrder,
      is_active: true,
      created_by: data.created_by ?? null,
    }
    const { data: criado, error } = await supabase
      .from('destinos_saida')
      .insert(registro)
      .select()
      .single()
    throwIfSupabaseError(error, 'Destino de saída')
    return mapOptionalCreatedBy(criado) as DestinoSaida
  },

  async update(id, data: UpdateDestinoInput) {
    const supabase = await createServerSupabase()
    const existente = await destinoSaidaRepositorySupabase.findById(id)
    if (!existente) return null
    assertUpdatedAt(existente, data.updated_at, 'Destino de saída')

    const patch = {
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    }

    const { data: atualizado, error } = await supabase
      .from('destinos_saida')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    throwIfSupabaseError(error, 'Destino de saída')
    return mapOptionalCreatedBy(atualizado) as DestinoSaida
  },

  async softDelete(id) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.from('destinos_saida').update({ is_active: false }).eq('id', id)
    throwIfSupabaseError(error, 'Destino de saída')
  },

  async count() {
    const supabase = await createServerSupabase()
    const { count, error } = await supabase
      .from('destinos_saida')
      .select('*', { count: 'exact', head: true })
    throwIfSupabaseError(error, 'Destino de saída')
    return count ?? 0
  },
}

export const maquinaRepositorySupabase: MaquinaRepository = {
  async findAll(incluirInativos = false) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('maquinas').select('*').order('sort_order')
    throwIfSupabaseError(error, 'Máquina')
    const registros = data ?? []
    return incluirInativos ? registros : registros.filter((r) => r.is_active)
  },

  async findBySetor(setorId, incluirInativos = false) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('maquinas')
      .select('*')
      .eq('setor_id', setorId)
      .order('sort_order')
    throwIfSupabaseError(error, 'Máquina')
    const registros = data ?? []
    return incluirInativos ? registros : registros.filter((r) => r.is_active)
  },

  async findById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('maquinas').select('*').eq('id', id).maybeSingle()
    throwIfSupabaseError(error, 'Máquina')
    return data as Maquina | null
  },

  async create(data: CreateMaquinaInput) {
    const supabase = await createServerSupabase()
    const sortOrder = await resolveSortOrderForInsert(data.sort_order, () =>
      proximoSortOrder('maquinas', { coluna: 'setor_id', valor: data.setor_id })
    )
    const registro = {
      id: uuid(),
      setor_id: data.setor_id,
      nome: data.nome.trim(),
      sort_order: sortOrder,
      is_active: true,
      created_by: data.created_by ?? null,
    }
    const { data: criado, error } = await supabase.from('maquinas').insert(registro).select().single()
    throwIfSupabaseError(error, 'Máquina')
    return mapOptionalCreatedBy(criado) as Maquina
  },

  async update(id, data: UpdateMaquinaInput) {
    const supabase = await createServerSupabase()
    const existente = await maquinaRepositorySupabase.findById(id)
    if (!existente) return null
    assertUpdatedAt(existente, data.updated_at, 'Máquina')

    const patch = {
      ...(data.setor_id !== undefined ? { setor_id: data.setor_id } : {}),
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    }

    const { data: atualizado, error } = await supabase
      .from('maquinas')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    throwIfSupabaseError(error, 'Máquina')
    return mapOptionalCreatedBy(atualizado) as Maquina
  },

  async softDelete(id) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.from('maquinas').update({ is_active: false }).eq('id', id)
    throwIfSupabaseError(error, 'Máquina')
  },
}

export const modeloProdutoRepositorySupabase: ModeloProdutoRepository = {
  async findAll(incluirInativos = false) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('modelos_produto').select('*').order('sort_order')
    throwIfSupabaseError(error, 'Modelo de produto')
    const registros = data ?? []
    return incluirInativos ? registros : registros.filter((r) => r.is_active)
  },

  async findById(id) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('modelos_produto')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    throwIfSupabaseError(error, 'Modelo de produto')
    return data as ModeloProduto | null
  },

  async findByNomeEPolaridade(nome, polaridade, ignorarId) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('modelos_produto')
      .select('*')
      .eq('polaridade', polaridade)
      .eq('is_active', true)
    throwIfSupabaseError(error, 'Modelo de produto')
    const normalizado = nome.trim().toLowerCase()
    const encontrado = (data ?? []).find(
      (r) => r.nome.trim().toLowerCase() === normalizado && r.id !== ignorarId
    )
    return (encontrado as ModeloProduto | undefined) ?? null
  },

  async create(data: CreateModeloProdutoInput) {
    const supabase = await createServerSupabase()
    const sortOrder = await resolveSortOrderForInsert(data.sort_order, () =>
      proximoSortOrder('modelos_produto')
    )
    const registro = {
      id: uuid(),
      nome: data.nome.trim(),
      tipo_produto: TIPO_PRODUTO_MVP,
      polaridade: data.polaridade,
      placas_por_grade: data.placas_por_grade,
      sort_order: sortOrder,
      is_active: true,
      created_by: data.created_by ?? null,
    }
    const { data: criado, error } = await supabase
      .from('modelos_produto')
      .insert(registro)
      .select()
      .single()
    throwIfSupabaseError(error, 'Modelo de produto')
    return mapOptionalCreatedBy(criado) as ModeloProduto
  },

  async update(id, data: UpdateModeloProdutoInput) {
    const supabase = await createServerSupabase()
    const existente = await modeloProdutoRepositorySupabase.findById(id)
    if (!existente) return null
    assertUpdatedAt(existente, data.updated_at, 'Modelo de produto')

    const patch = {
      ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
      ...(data.polaridade !== undefined ? { polaridade: data.polaridade } : {}),
      ...(data.placas_por_grade !== undefined ? { placas_por_grade: data.placas_por_grade } : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    }

    const { data: atualizado, error } = await supabase
      .from('modelos_produto')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    throwIfSupabaseError(error, 'Modelo de produto')
    return mapOptionalCreatedBy(atualizado) as ModeloProduto
  },

  async softDelete(id) {
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from('modelos_produto')
      .update({ is_active: false })
      .eq('id', id)
    throwIfSupabaseError(error, 'Modelo de produto')
  },

  async count() {
    const supabase = await createServerSupabase()
    const { count, error } = await supabase
      .from('modelos_produto')
      .select('*', { count: 'exact', head: true })
    throwIfSupabaseError(error, 'Modelo de produto')
    return count ?? 0
  },
}

import type {
  DestinoSaidaLocal,
  LigaLocal,
  MaquinaLocal,
  ModeloProdutoLocal,
  OperadorLocal,
  SetorLocal,
  TurnoLocal,
} from '@/lib/offline/types'

export type CadastroBase = {
  id: string
  nome: string
  sort_order: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type Liga = LigaLocal
export type Setor = SetorLocal
export type DestinoSaida = DestinoSaidaLocal
export type Operador = OperadorLocal
export type Turno = TurnoLocal
export type ModeloProduto = ModeloProdutoLocal
export type Maquina = MaquinaLocal

export type CreateCadastroSimples = {
  nome: string
  sort_order?: number
  created_by?: string
}

export type UpdateCadastroSimples = {
  nome?: string
  sort_order?: number
  is_active?: boolean
  updated_at: string
}

export type CreateLigaInput = {
  nome: string
  chave_cor: string
  created_by?: string
}

export type UpdateLigaInput = {
  nome?: string
  chave_cor?: string
  is_active?: boolean
  updated_at: string
}

export type CreateSetorInput = {
  nome: string
  slug?: string
  tipo: string
  sort_order?: number
  created_by?: string
}

export type UpdateSetorInput = {
  nome?: string
  slug?: string
  tipo?: string
  sort_order?: number
  is_active?: boolean
  updated_at: string
}

export type CreateDestinoInput = CreateCadastroSimples & {
  slug?: string
}

export type UpdateDestinoInput = UpdateCadastroSimples & {
  slug?: string
}

export type CreateMaquinaInput = {
  setor_id: string
  nome: string
  sort_order?: number
  created_by?: string
}

export type CreateModeloProdutoInput = {
  nome: string
  polaridade: string
  placas_por_grade: number
  sort_order?: number
  created_by?: string
}

export type UpdateMaquinaInput = {
  setor_id?: string
  nome?: string
  sort_order?: number
  is_active?: boolean
  updated_at: string
}

export type UpdateModeloProdutoInput = {
  nome?: string
  polaridade?: string
  placas_por_grade?: number
  sort_order?: number
  is_active?: boolean
  updated_at: string
}

export type CadastroSimplesRepository<T extends CadastroBase> = {
  findAll: (incluirInativos?: boolean) => Promise<T[]>
  findById: (id: string) => Promise<T | null>
  create: (data: CreateCadastroSimples) => Promise<T>
  update: (id: string, data: UpdateCadastroSimples) => Promise<T | null>
  softDelete: (id: string) => Promise<void>
  count: () => Promise<number>
}

export type LigaRepository = {
  findAll: (incluirInativos?: boolean) => Promise<Liga[]>
  findById: (id: string) => Promise<Liga | null>
  create: (data: CreateLigaInput) => Promise<Liga>
  update: (id: string, data: UpdateLigaInput) => Promise<Liga | null>
  softDelete: (id: string) => Promise<void>
}

export type SetorRepository = {
  findAll: (incluirInativos?: boolean) => Promise<Setor[]>
  findById: (id: string) => Promise<Setor | null>
  findBySlug: (slug: string) => Promise<Setor | null>
  create: (data: CreateSetorInput) => Promise<Setor>
  update: (id: string, data: UpdateSetorInput) => Promise<Setor | null>
  softDelete: (id: string) => Promise<void>
}

export type DestinoSaidaRepository = {
  findAll: (incluirInativos?: boolean) => Promise<DestinoSaida[]>
  findById: (id: string) => Promise<DestinoSaida | null>
  findBySlug: (slug: string) => Promise<DestinoSaida | null>
  create: (data: CreateDestinoInput) => Promise<DestinoSaida>
  update: (id: string, data: UpdateDestinoInput) => Promise<DestinoSaida | null>
  softDelete: (id: string) => Promise<void>
  count: () => Promise<number>
}

export type MaquinaRepository = {
  findAll: (incluirInativos?: boolean) => Promise<Maquina[]>
  findBySetor: (setorId: string, incluirInativos?: boolean) => Promise<Maquina[]>
  findById: (id: string) => Promise<Maquina | null>
  create: (data: CreateMaquinaInput) => Promise<Maquina>
  update: (id: string, data: UpdateMaquinaInput) => Promise<Maquina | null>
  softDelete: (id: string) => Promise<void>
}

export type OperadorRepository = CadastroSimplesRepository<Operador>
export type TurnoRepository = CadastroSimplesRepository<Turno>

export type ModeloProdutoRepository = {
  findAll: (incluirInativos?: boolean) => Promise<ModeloProduto[]>
  findById: (id: string) => Promise<ModeloProduto | null>
  findByNomeEPolaridade: (
    nome: string,
    polaridade: string,
    ignorarId?: string
  ) => Promise<ModeloProduto | null>
  create: (data: CreateModeloProdutoInput) => Promise<ModeloProduto>
  update: (id: string, data: UpdateModeloProdutoInput) => Promise<ModeloProduto | null>
  softDelete: (id: string) => Promise<void>
  count: () => Promise<number>
}

export type TipoCadastro =
  | 'ligas'
  | 'setores'
  | 'destinos_saida'
  | 'operadores'
  | 'turnos'
  | 'maquinas'
  | 'modelos_produto'

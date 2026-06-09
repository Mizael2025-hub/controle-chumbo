import { SEED_DESTINOS_SAIDA } from '@/lib/cadastros/seed-destinos'
import { AppError } from '@/lib/errors/app-error'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { gerarSlug } from '@/lib/utils/slug'
import type {
  DestinoSaidaRepository,
  LigaRepository,
  MaquinaRepository,
  ModeloProdutoRepository,
  OperadorRepository,
  SetorRepository,
  TurnoRepository,
} from '@/repositories/cadastro-repository'
import type {
  AtualizarCadastroSimplesInput,
  AtualizarDestinoInput,
  AtualizarLigaInput,
  AtualizarMaquinaInput,
  AtualizarModeloProdutoInput,
  AtualizarSetorInput,
  CriarCadastroSimplesInput,
  CriarDestinoInput,
  CriarLigaInput,
  CriarMaquinaInput,
  CriarModeloProdutoInput,
  CriarSetorInput,
} from '@/validations/cadastros/cadastro-schema'

type ContextoCadastro = {
  userId: string
  role: UsuarioRole
}

function requireRepo<T>(repo: T | undefined): T {
  if (!repo) throw AppError.validation('Repositório não informado.')
  return repo
}

function assertAdmin(role: UsuarioRole): void {
  if (role !== 'admin') {
    throw AppError.unauthorized()
  }
}

async function garantirSlugUnicoSetor(
  repo: SetorRepository,
  slug: string,
  ignorarId?: string
): Promise<void> {
  const existente = await repo.findBySlug(slug)
  if (existente && existente.id !== ignorarId && existente.is_active) {
    throw AppError.conflict('Já existe um setor com este slug.')
  }
}

async function garantirSlugUnicoDestino(
  repo: DestinoSaidaRepository,
  slug: string,
  ignorarId?: string
): Promise<void> {
  const existente = await repo.findBySlug(slug)
  if (existente && existente.id !== ignorarId) {
    throw AppError.conflict('Já existe um destino com este slug.')
  }
}

async function garantirModeloUnico(
  repo: ModeloProdutoRepository,
  nome: string,
  polaridade: string,
  ignorarId?: string
): Promise<void> {
  const existente = await repo.findByNomeEPolaridade(nome, polaridade, ignorarId)
  if (existente) {
    throw AppError.conflict('Já existe um modelo ativo com este nome e polaridade.')
  }
}

export async function seedDestinosSaidaSeVazio(
  userId: string,
  repo?: DestinoSaidaRepository
): Promise<void> {
  try {
    const destinoRepo = requireRepo(repo)
    const total = await destinoRepo.count()
    if (total > 0) return

    for (let i = 0; i < SEED_DESTINOS_SAIDA.length; i++) {
      const item = SEED_DESTINOS_SAIDA[i]
      await destinoRepo.create({
        nome: item.nome,
        slug: item.slug,
        sort_order: i,
        created_by: userId,
      })
    }
  } catch (error) {
    console.error('[seedDestinosSaidaSeVazio]', error)
    throw error
  }
}

export async function listarLigas(ctx: ContextoCadastro, repo?: LigaRepository) {
  assertAdmin(ctx.role)
  return requireRepo(repo).findAll(true)
}

export async function criarLiga(
  ctx: ContextoCadastro,
  input: CriarLigaInput,
  repo?: LigaRepository
) {
  assertAdmin(ctx.role)
  return requireRepo(repo).create({ ...input, created_by: ctx.userId })
}

export async function atualizarLiga(
  ctx: ContextoCadastro,
  input: AtualizarLigaInput,
  repo?: LigaRepository
) {
  assertAdmin(ctx.role)
  const ligaRepo = requireRepo(repo)
  const { id, ...data } = input
  const atualizado = await ligaRepo.update(id, data)
  if (!atualizado) throw AppError.notFound('Liga')
  return atualizado
}

export async function excluirLiga(ctx: ContextoCadastro, id: string, repo?: LigaRepository) {
  assertAdmin(ctx.role)
  const ligaRepo = requireRepo(repo)
  const existente = await ligaRepo.findById(id)
  if (!existente) throw AppError.notFound('Liga')
  await ligaRepo.softDelete(id)
}

export async function listarSetores(ctx: ContextoCadastro, repo?: SetorRepository) {
  assertAdmin(ctx.role)
  return requireRepo(repo).findAll(true)
}

export async function criarSetor(
  ctx: ContextoCadastro,
  input: CriarSetorInput,
  repo?: SetorRepository
) {
  assertAdmin(ctx.role)
  const setorRepo = requireRepo(repo)
  const slug = input.slug ?? gerarSlug(input.nome)
  if (!slug) throw AppError.validation('Não foi possível gerar slug a partir do nome.')
  await garantirSlugUnicoSetor(setorRepo, slug)
  return setorRepo.create({ ...input, slug, created_by: ctx.userId })
}

export async function atualizarSetor(
  ctx: ContextoCadastro,
  input: AtualizarSetorInput,
  repo?: SetorRepository
) {
  assertAdmin(ctx.role)
  const setorRepo = requireRepo(repo)
  const { id, ...data } = input
  if (data.slug) await garantirSlugUnicoSetor(setorRepo, data.slug, id)
  const atualizado = await setorRepo.update(id, data)
  if (!atualizado) throw AppError.notFound('Setor')
  return atualizado
}

export async function excluirSetor(ctx: ContextoCadastro, id: string, repo?: SetorRepository) {
  assertAdmin(ctx.role)
  const setorRepo = requireRepo(repo)
  const existente = await setorRepo.findById(id)
  if (!existente) throw AppError.notFound('Setor')
  await setorRepo.softDelete(id)
}

export async function listarDestinos(ctx: ContextoCadastro, repo?: DestinoSaidaRepository) {
  assertAdmin(ctx.role)
  const destinoRepo = requireRepo(repo)
  await seedDestinosSaidaSeVazio(ctx.userId, destinoRepo)
  return destinoRepo.findAll(true)
}

export async function criarDestino(
  ctx: ContextoCadastro,
  input: CriarDestinoInput,
  repo?: DestinoSaidaRepository
) {
  assertAdmin(ctx.role)
  const destinoRepo = requireRepo(repo)
  const slug = input.slug ?? gerarSlug(input.nome)
  if (!slug) throw AppError.validation('Não foi possível gerar slug a partir do nome.')
  await garantirSlugUnicoDestino(destinoRepo, slug)
  return destinoRepo.create({ ...input, slug, created_by: ctx.userId })
}

export async function atualizarDestino(
  ctx: ContextoCadastro,
  input: AtualizarDestinoInput,
  repo?: DestinoSaidaRepository
) {
  assertAdmin(ctx.role)
  const destinoRepo = requireRepo(repo)
  const { id, ...data } = input
  if (data.slug) await garantirSlugUnicoDestino(destinoRepo, data.slug, id)
  const atualizado = await destinoRepo.update(id, data)
  if (!atualizado) throw AppError.notFound('Destino de saída')
  return atualizado
}

export async function excluirDestino(
  ctx: ContextoCadastro,
  id: string,
  repo?: DestinoSaidaRepository
) {
  assertAdmin(ctx.role)
  const destinoRepo = requireRepo(repo)
  const existente = await destinoRepo.findById(id)
  if (!existente) throw AppError.notFound('Destino de saída')
  await destinoRepo.softDelete(id)
}

async function cadastroSimplesOps(
  ctx: ContextoCadastro,
  repo: OperadorRepository | TurnoRepository,
  entidade: string
) {
  assertAdmin(ctx.role)

  return {
    listar: () => repo.findAll(true),
    criar: (input: CriarCadastroSimplesInput) =>
      repo.create({ ...input, created_by: ctx.userId }),
    atualizar: async (input: AtualizarCadastroSimplesInput) => {
      const { id, ...data } = input
      const atualizado = await repo.update(id, data)
      if (!atualizado) throw AppError.notFound(entidade)
      return atualizado
    },
    excluir: async (id: string) => {
      const existente = await repo.findById(id)
      if (!existente) throw AppError.notFound(entidade)
      await repo.softDelete(id)
    },
  }
}

export async function listarOperadores(ctx: ContextoCadastro, repo?: OperadorRepository) {
  return cadastroSimplesOps(ctx, requireRepo(repo), 'Operador').then((ops) => ops.listar())
}

export async function criarOperador(
  ctx: ContextoCadastro,
  input: CriarCadastroSimplesInput,
  repo?: OperadorRepository
) {
  return cadastroSimplesOps(ctx, requireRepo(repo), 'Operador').then((ops) => ops.criar(input))
}

export async function atualizarOperador(
  ctx: ContextoCadastro,
  input: AtualizarCadastroSimplesInput,
  repo?: OperadorRepository
) {
  return cadastroSimplesOps(ctx, requireRepo(repo), 'Operador').then((ops) => ops.atualizar(input))
}

export async function excluirOperador(ctx: ContextoCadastro, id: string, repo?: OperadorRepository) {
  return cadastroSimplesOps(ctx, requireRepo(repo), 'Operador').then((ops) => ops.excluir(id))
}

export async function listarTurnos(ctx: ContextoCadastro, repo?: TurnoRepository) {
  return cadastroSimplesOps(ctx, requireRepo(repo), 'Turno').then((ops) => ops.listar())
}

export async function criarTurno(
  ctx: ContextoCadastro,
  input: CriarCadastroSimplesInput,
  repo?: TurnoRepository
) {
  return cadastroSimplesOps(ctx, requireRepo(repo), 'Turno').then((ops) => ops.criar(input))
}

export async function atualizarTurno(
  ctx: ContextoCadastro,
  input: AtualizarCadastroSimplesInput,
  repo?: TurnoRepository
) {
  return cadastroSimplesOps(ctx, requireRepo(repo), 'Turno').then((ops) => ops.atualizar(input))
}

export async function excluirTurno(ctx: ContextoCadastro, id: string, repo?: TurnoRepository) {
  return cadastroSimplesOps(ctx, requireRepo(repo), 'Turno').then((ops) => ops.excluir(id))
}

export async function listarModelosProduto(
  ctx: ContextoCadastro,
  repo?: ModeloProdutoRepository
) {
  assertAdmin(ctx.role)
  return requireRepo(repo).findAll(true)
}

export async function criarModeloProduto(
  ctx: ContextoCadastro,
  input: CriarModeloProdutoInput,
  repo?: ModeloProdutoRepository
) {
  assertAdmin(ctx.role)
  const modeloRepo = requireRepo(repo)
  await garantirModeloUnico(modeloRepo, input.nome, input.polaridade)
  return modeloRepo.create({ ...input, created_by: ctx.userId })
}

export async function atualizarModeloProduto(
  ctx: ContextoCadastro,
  input: AtualizarModeloProdutoInput,
  repo?: ModeloProdutoRepository
) {
  assertAdmin(ctx.role)
  const modeloRepo = requireRepo(repo)
  const { id, ...data } = input
  const existente = await modeloRepo.findById(id)
  if (!existente) throw AppError.notFound('Modelo de produto')

  const nome = data.nome ?? existente.nome
  const polaridade = data.polaridade ?? existente.polaridade
  await garantirModeloUnico(modeloRepo, nome, polaridade, id)

  const atualizado = await modeloRepo.update(id, data)
  if (!atualizado) throw AppError.notFound('Modelo de produto')
  return atualizado
}

export async function excluirModeloProduto(
  ctx: ContextoCadastro,
  id: string,
  repo?: ModeloProdutoRepository
) {
  assertAdmin(ctx.role)
  const modeloRepo = requireRepo(repo)
  const existente = await modeloRepo.findById(id)
  if (!existente) throw AppError.notFound('Modelo de produto')
  await modeloRepo.softDelete(id)
}

export async function listarMaquinas(ctx: ContextoCadastro, repo?: MaquinaRepository) {
  assertAdmin(ctx.role)
  return requireRepo(repo).findAll(true)
}

export async function criarMaquina(
  ctx: ContextoCadastro,
  input: CriarMaquinaInput,
  repo?: MaquinaRepository,
  setorRepo?: SetorRepository
) {
  assertAdmin(ctx.role)
  const maquinaRepo = requireRepo(repo)
  const setores = requireRepo(setorRepo)
  const setor = await setores.findById(input.setor_id)
  if (!setor || !setor.is_active) throw AppError.validation('Setor inválido ou inativo.')
  return maquinaRepo.create({ ...input, created_by: ctx.userId })
}

export async function atualizarMaquina(
  ctx: ContextoCadastro,
  input: AtualizarMaquinaInput,
  repo?: MaquinaRepository,
  setorRepo?: SetorRepository
) {
  assertAdmin(ctx.role)
  const maquinaRepo = requireRepo(repo)
  const { id, ...data } = input
  if (data.setor_id) {
    const setores = requireRepo(setorRepo)
    const setor = await setores.findById(data.setor_id)
    if (!setor || !setor.is_active) throw AppError.validation('Setor inválido ou inativo.')
  }
  const atualizado = await maquinaRepo.update(id, data)
  if (!atualizado) throw AppError.notFound('Máquina')
  return atualizado
}

export async function excluirMaquina(ctx: ContextoCadastro, id: string, repo?: MaquinaRepository) {
  assertAdmin(ctx.role)
  const maquinaRepo = requireRepo(repo)
  const existente = await maquinaRepo.findById(id)
  if (!existente) throw AppError.notFound('Máquina')
  await maquinaRepo.softDelete(id)
}

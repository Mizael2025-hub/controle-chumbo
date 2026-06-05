import { SEED_DESTINOS_SAIDA } from '@/lib/cadastros/seed-destinos'
import {
  getDestinoSaidaRepository,
  getLigaRepository,
  getMaquinaRepository,
  getModeloProdutoRepository,
  getOperadorRepository,
  getSetorRepository,
  getTurnoRepository,
} from '@/lib/data-source/cadastro-repositories'
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
  if (existente && existente.id !== ignorarId) {
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
  repo: DestinoSaidaRepository = getDestinoSaidaRepository()
): Promise<void> {
  try {
    const total = await repo.count()
    if (total > 0) return

    for (let i = 0; i < SEED_DESTINOS_SAIDA.length; i++) {
      const item = SEED_DESTINOS_SAIDA[i]
      await repo.create({
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

export async function listarLigas(
  ctx: ContextoCadastro,
  repo: LigaRepository = getLigaRepository()
) {
  assertAdmin(ctx.role)
  return repo.findAll(true)
}

export async function criarLiga(
  ctx: ContextoCadastro,
  input: CriarLigaInput,
  repo: LigaRepository = getLigaRepository()
) {
  assertAdmin(ctx.role)
  return repo.create({ ...input, created_by: ctx.userId })
}

export async function atualizarLiga(
  ctx: ContextoCadastro,
  input: AtualizarLigaInput,
  repo: LigaRepository = getLigaRepository()
) {
  assertAdmin(ctx.role)
  const { id, ...data } = input
  const atualizado = await repo.update(id, data)
  if (!atualizado) throw AppError.notFound('Liga')
  return atualizado
}

export async function excluirLiga(
  ctx: ContextoCadastro,
  id: string,
  repo: LigaRepository = getLigaRepository()
) {
  assertAdmin(ctx.role)
  const existente = await repo.findById(id)
  if (!existente) throw AppError.notFound('Liga')
  await repo.softDelete(id)
}

export async function listarSetores(
  ctx: ContextoCadastro,
  repo: SetorRepository = getSetorRepository()
) {
  assertAdmin(ctx.role)
  return repo.findAll(true)
}

export async function criarSetor(
  ctx: ContextoCadastro,
  input: CriarSetorInput,
  repo: SetorRepository = getSetorRepository()
) {
  assertAdmin(ctx.role)
  const slug = input.slug ?? gerarSlug(input.nome)
  if (!slug) throw AppError.validation('Não foi possível gerar slug a partir do nome.')
  await garantirSlugUnicoSetor(repo, slug)
  return repo.create({ ...input, slug, created_by: ctx.userId })
}

export async function atualizarSetor(
  ctx: ContextoCadastro,
  input: AtualizarSetorInput,
  repo: SetorRepository = getSetorRepository()
) {
  assertAdmin(ctx.role)
  const { id, ...data } = input
  if (data.slug) await garantirSlugUnicoSetor(repo, data.slug, id)
  const atualizado = await repo.update(id, data)
  if (!atualizado) throw AppError.notFound('Setor')
  return atualizado
}

export async function excluirSetor(
  ctx: ContextoCadastro,
  id: string,
  repo: SetorRepository = getSetorRepository()
) {
  assertAdmin(ctx.role)
  const existente = await repo.findById(id)
  if (!existente) throw AppError.notFound('Setor')
  await repo.softDelete(id)
}

export async function listarDestinos(
  ctx: ContextoCadastro,
  repo: DestinoSaidaRepository = getDestinoSaidaRepository()
) {
  assertAdmin(ctx.role)
  await seedDestinosSaidaSeVazio(ctx.userId, repo)
  return repo.findAll(true)
}

export async function criarDestino(
  ctx: ContextoCadastro,
  input: CriarDestinoInput,
  repo: DestinoSaidaRepository = getDestinoSaidaRepository()
) {
  assertAdmin(ctx.role)
  const slug = input.slug ?? gerarSlug(input.nome)
  if (!slug) throw AppError.validation('Não foi possível gerar slug a partir do nome.')
  await garantirSlugUnicoDestino(repo, slug)
  return repo.create({ ...input, slug, created_by: ctx.userId })
}

export async function atualizarDestino(
  ctx: ContextoCadastro,
  input: AtualizarDestinoInput,
  repo: DestinoSaidaRepository = getDestinoSaidaRepository()
) {
  assertAdmin(ctx.role)
  const { id, ...data } = input
  if (data.slug) await garantirSlugUnicoDestino(repo, data.slug, id)
  const atualizado = await repo.update(id, data)
  if (!atualizado) throw AppError.notFound('Destino de saída')
  return atualizado
}

export async function excluirDestino(
  ctx: ContextoCadastro,
  id: string,
  repo: DestinoSaidaRepository = getDestinoSaidaRepository()
) {
  assertAdmin(ctx.role)
  const existente = await repo.findById(id)
  if (!existente) throw AppError.notFound('Destino de saída')
  await repo.softDelete(id)
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

export async function listarOperadores(
  ctx: ContextoCadastro,
  repo: OperadorRepository = getOperadorRepository()
) {
  return cadastroSimplesOps(ctx, repo, 'Operador').then((ops) => ops.listar())
}

export async function criarOperador(
  ctx: ContextoCadastro,
  input: CriarCadastroSimplesInput,
  repo: OperadorRepository = getOperadorRepository()
) {
  return cadastroSimplesOps(ctx, repo, 'Operador').then((ops) => ops.criar(input))
}

export async function atualizarOperador(
  ctx: ContextoCadastro,
  input: AtualizarCadastroSimplesInput,
  repo: OperadorRepository = getOperadorRepository()
) {
  return cadastroSimplesOps(ctx, repo, 'Operador').then((ops) => ops.atualizar(input))
}

export async function excluirOperador(
  ctx: ContextoCadastro,
  id: string,
  repo: OperadorRepository = getOperadorRepository()
) {
  return cadastroSimplesOps(ctx, repo, 'Operador').then((ops) => ops.excluir(id))
}

export async function listarTurnos(
  ctx: ContextoCadastro,
  repo: TurnoRepository = getTurnoRepository()
) {
  return cadastroSimplesOps(ctx, repo, 'Turno').then((ops) => ops.listar())
}

export async function criarTurno(
  ctx: ContextoCadastro,
  input: CriarCadastroSimplesInput,
  repo: TurnoRepository = getTurnoRepository()
) {
  return cadastroSimplesOps(ctx, repo, 'Turno').then((ops) => ops.criar(input))
}

export async function atualizarTurno(
  ctx: ContextoCadastro,
  input: AtualizarCadastroSimplesInput,
  repo: TurnoRepository = getTurnoRepository()
) {
  return cadastroSimplesOps(ctx, repo, 'Turno').then((ops) => ops.atualizar(input))
}

export async function excluirTurno(
  ctx: ContextoCadastro,
  id: string,
  repo: TurnoRepository = getTurnoRepository()
) {
  return cadastroSimplesOps(ctx, repo, 'Turno').then((ops) => ops.excluir(id))
}

export async function listarModelosProduto(
  ctx: ContextoCadastro,
  repo: ModeloProdutoRepository = getModeloProdutoRepository()
) {
  assertAdmin(ctx.role)
  return repo.findAll(true)
}

export async function criarModeloProduto(
  ctx: ContextoCadastro,
  input: CriarModeloProdutoInput,
  repo: ModeloProdutoRepository = getModeloProdutoRepository()
) {
  assertAdmin(ctx.role)
  await garantirModeloUnico(repo, input.nome, input.polaridade)
  return repo.create({ ...input, created_by: ctx.userId })
}

export async function atualizarModeloProduto(
  ctx: ContextoCadastro,
  input: AtualizarModeloProdutoInput,
  repo: ModeloProdutoRepository = getModeloProdutoRepository()
) {
  assertAdmin(ctx.role)
  const { id, ...data } = input
  const existente = await repo.findById(id)
  if (!existente) throw AppError.notFound('Modelo de produto')

  const nome = data.nome ?? existente.nome
  const polaridade = data.polaridade ?? existente.polaridade
  await garantirModeloUnico(repo, nome, polaridade, id)

  const atualizado = await repo.update(id, data)
  if (!atualizado) throw AppError.notFound('Modelo de produto')
  return atualizado
}

export async function excluirModeloProduto(
  ctx: ContextoCadastro,
  id: string,
  repo: ModeloProdutoRepository = getModeloProdutoRepository()
) {
  assertAdmin(ctx.role)
  const existente = await repo.findById(id)
  if (!existente) throw AppError.notFound('Modelo de produto')
  await repo.softDelete(id)
}

export async function listarMaquinas(
  ctx: ContextoCadastro,
  repo: MaquinaRepository = getMaquinaRepository()
) {
  assertAdmin(ctx.role)
  return repo.findAll(true)
}

export async function criarMaquina(
  ctx: ContextoCadastro,
  input: CriarMaquinaInput,
  repo: MaquinaRepository = getMaquinaRepository()
) {
  assertAdmin(ctx.role)
  const setor = await getSetorRepository().findById(input.setor_id)
  if (!setor || !setor.is_active) throw AppError.validation('Setor inválido ou inativo.')
  return repo.create({ ...input, created_by: ctx.userId })
}

export async function atualizarMaquina(
  ctx: ContextoCadastro,
  input: AtualizarMaquinaInput,
  repo: MaquinaRepository = getMaquinaRepository()
) {
  assertAdmin(ctx.role)
  const { id, ...data } = input
  if (data.setor_id) {
    const setor = await getSetorRepository().findById(data.setor_id)
    if (!setor || !setor.is_active) throw AppError.validation('Setor inválido ou inativo.')
  }
  const atualizado = await repo.update(id, data)
  if (!atualizado) throw AppError.notFound('Máquina')
  return atualizado
}

export async function excluirMaquina(
  ctx: ContextoCadastro,
  id: string,
  repo: MaquinaRepository = getMaquinaRepository()
) {
  assertAdmin(ctx.role)
  const existente = await repo.findById(id)
  if (!existente) throw AppError.notFound('Máquina')
  await repo.softDelete(id)
}

import { filtrarCelulasPreenchidas, somarCelulasEntrada } from '@/lib/entrada/validar-grade-entrada'
import { AppError } from '@/lib/errors/app-error'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { CriarEntradaResult, EntradaRepository } from '@/repositories/entrada-repository'
import type { CriarEntradaInput } from '@/validations/entrada/entrada-schema'

type ContextoEntrada = {
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

export type ResultadoCriarEntrada = CriarEntradaResult & {
  soma_operacional_kg: number
  soma_operacional_barras: number
}

export async function criarEntrada(
  ctx: ContextoEntrada,
  input: CriarEntradaInput,
  repo?: EntradaRepository
): Promise<ResultadoCriarEntrada> {
  assertAdmin(ctx.role)
  const entradaRepo = requireRepo(repo)

  const liga = await entradaRepo.findLigaById(input.liga_id)
  if (!liga || !liga.is_active) {
    throw AppError.validation('Liga não encontrada ou inativa.')
  }

  const existente = await entradaRepo.findLoteByNumero(input.liga_id, input.numero_lote)
  if (existente) {
    throw AppError.validation(`Já existe o lote "${input.numero_lote.trim()}" nesta liga.`)
  }

  const celulasPreenchidas = filtrarCelulasPreenchidas(input.celulas)
  const soma = somarCelulasEntrada(celulasPreenchidas)

  const resultado = await entradaRepo.createLoteComMontes(
    {
      liga_id: input.liga_id,
      numero_lote: input.numero_lote.trim(),
      data_chegada: input.data_chegada,
      peso_inicial_kg: soma.peso_kg,
      barras_iniciais: soma.barras,
      colunas_grade: input.colunas_grade,
      linhas_grade: input.linhas_grade,
      created_by: ctx.userId,
    },
    celulasPreenchidas
  )

  return {
    ...resultado,
    soma_operacional_kg: soma.peso_kg,
    soma_operacional_barras: soma.barras,
  }
}

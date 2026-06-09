import { agruparTotaisContagemPorLiga } from '@/lib/contagem/agrupar-totais-contagem'
import { AppError } from '@/lib/errors/app-error'
import type { ContagemEstoqueLinha, ContagemLinhaInput } from '@/repositories/contagem-estoque-repository'
import { contagemEstoqueRepositoryLocal } from '@/repositories/contagem-estoque-repository.local'

export type VisaoContagemEstoque = {
  linhas: ContagemEstoqueLinha[]
  totais_por_liga: ReturnType<typeof agruparTotaisContagemPorLiga>
}

export async function listarContagemRascunho(
  usuarioId: string,
  dataContagem: string
): Promise<VisaoContagemEstoque> {
  const linhas = await contagemEstoqueRepositoryLocal.listarPorUsuarioData(
    usuarioId,
    dataContagem
  )
  return {
    linhas,
    totais_por_liga: agruparTotaisContagemPorLiga(linhas),
  }
}

export async function criarLinhaContagem(
  usuarioId: string,
  input: ContagemLinhaInput
): Promise<ContagemEstoqueLinha> {
  if (input.quantidade_barras <= 0) {
    throw AppError.validation('Informe ao menos 1 barra.')
  }
  return contagemEstoqueRepositoryLocal.criar(usuarioId, input)
}

export async function atualizarLinhaContagem(
  usuarioId: string,
  linhaId: string,
  input: ContagemLinhaInput
): Promise<ContagemEstoqueLinha> {
  if (input.quantidade_barras <= 0) {
    throw AppError.validation('Informe ao menos 1 barra.')
  }
  return contagemEstoqueRepositoryLocal.atualizar(linhaId, usuarioId, input)
}

export async function excluirLinhaContagem(usuarioId: string, linhaId: string): Promise<void> {
  await contagemEstoqueRepositoryLocal.excluir(linhaId, usuarioId)
}

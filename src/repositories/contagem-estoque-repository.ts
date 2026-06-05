export type ContagemEstoqueLinha = {
  id: string
  usuario_id: string
  data_contagem: string
  liga_id: string
  quantidade_barras: number
  numero_lote: string | null
  created_at: string
  updated_at: string
}

export type ContagemLinhaInput = {
  data_contagem: string
  liga_id: string
  quantidade_barras: number
  numero_lote: string | null
}

export type ContagemEstoqueRepository = {
  listarPorUsuarioData(usuarioId: string, dataContagem: string): Promise<ContagemEstoqueLinha[]>
  criar(usuarioId: string, input: ContagemLinhaInput): Promise<ContagemEstoqueLinha>
  atualizar(
    id: string,
    usuarioId: string,
    input: ContagemLinhaInput
  ): Promise<ContagemEstoqueLinha>
  excluir(id: string, usuarioId: string): Promise<void>
}

import 'server-only'

export {
  getDestinoSaidaRepository,
  getLigaRepository,
  getMaquinaRepository,
  getModeloProdutoRepository,
  getOperadorRepository,
  getSetorRepository,
  getTurnoRepository,
} from '@/lib/data-source/cadastro-repositories.server'

export { getConsumoRepository } from '@/lib/data-source/consumo-repositories.server'
export { getEntradaRepository } from '@/lib/data-source/entrada-repositories.server'
export { getEstoqueRepository } from '@/lib/data-source/estoque-repositories.server'
export { getMonteRepository } from '@/lib/data-source/monte-repositories.server'
export { getRelatorioRepository } from '@/lib/data-source/relatorio-repositories.server'
export { getSaidaRepository } from '@/lib/data-source/saida-repositories.server'

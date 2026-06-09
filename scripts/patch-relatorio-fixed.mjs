import { execSync } from 'child_process'
import fs from 'fs'

let s = execSync('git show HEAD:src/services/relatorio-service.ts', { encoding: 'utf8' })

s = s.replace(
  /import \{ getDestinoSaidaRepository, getLigaRepository, getSetorRepository \} from '@\/lib\/data-source\/cadastro-repositories'\nimport \{ getEstoqueRepository \} from '@\/lib\/data-source\/estoque-repositories'\nimport \{ getRelatorioRepository \} from '@\/lib\/data-source\/relatorio-repositories'\n/,
  ''
)

s = s.replace(
  "import type { RelatorioRepository } from '@/repositories/relatorio-repository'",
  `import type { DestinoSaidaRepository, LigaRepository, SetorRepository } from '@/repositories/cadastro-repository'
import type { EstoqueRepository } from '@/repositories/estoque-repository'
import type { RelatorioRepository } from '@/repositories/relatorio-repository'`
)

s = s.replace(
  'type ContextoRelatorio = {',
  `export type RelatorioConsultaDeps = {
  ligaRepo: LigaRepository
  destinoRepo: DestinoSaidaRepository
  estoqueRepo: EstoqueRepository
  setorRepo: SetorRepository
}

function useRepo<T>(repo: T | undefined): T {
  if (!repo) throw AppError.validation('Repositório não informado.')
  return repo
}

type ContextoRelatorio = {`
)

s = s.replace(/repo: RelatorioRepository = getRelatorioRepository\(\)/g, 'repo?: RelatorioRepository')
s = s.replace(/getLigaRepository\(\)/g, 'useRepo(deps).ligaRepo')
s = s.replace(/getDestinoSaidaRepository\(\)/g, 'useRepo(deps).destinoRepo')
s = s.replace(/getEstoqueRepository\(\)/g, 'useRepo(deps).estoqueRepo')
s = s.replace(/getSetorRepository\(\)/g, 'useRepo(deps).setorRepo')

const fnSigs = [
  'listarEntradasRelatorio',
  'listarSaidasRelatorio',
  'listarReservasRelatorio',
  'listarConsumoRelatorio',
  'buscarEntradaDetalhe',
  'buscarConsumoDetalhe',
  'consultarRelatorio',
  'gerarCsvRelatorio',
]

for (const fn of fnSigs) {
  s = s.replace(
    new RegExp(`(export async function ${fn}\\([\\s\\S]*?repo\\?: RelatorioRepository)\\)`),
    '$1,\n  deps?: RelatorioConsultaDeps)'
  )
}

s = s.replace(
  "return { aba: 'entradas', linhas: await listarEntradasRelatorio(ctx, input, repo) }",
  "return { aba: 'entradas', linhas: await listarEntradasRelatorio(ctx, input, repo, deps) }"
)
s = s.replace(
  "return { aba: 'saidas', linhas: await listarSaidasRelatorio(ctx, input, repo) }",
  "return { aba: 'saidas', linhas: await listarSaidasRelatorio(ctx, input, repo, deps) }"
)
s = s.replace(
  "return { aba: 'reservas', linhas: await listarReservasRelatorio(ctx, input, repo) }",
  "return { aba: 'reservas', linhas: await listarReservasRelatorio(ctx, input, repo, deps) }"
)
s = s.replace(
  "return { aba: 'consumo', linhas: await listarConsumoRelatorio(ctx, input, repo) }",
  "return { aba: 'consumo', linhas: await listarConsumoRelatorio(ctx, input, repo, deps) }"
)
s = s.replace(
  'const resultadoBruto = await consultarRelatorio(ctx, input, repo)',
  'const resultadoBruto = await consultarRelatorio(ctx, input, repo, deps)'
)

s = s.replace(
  '  const [lotes, ligas] = await Promise.all([\n    repo.listarLotesPorPeriodo',
  '  const relatorioRepo = useRepo(repo)\n  const [lotes, ligas] = await Promise.all([\n    relatorioRepo.listarLotesPorPeriodo'
)
s = s.replace(
  '      qtd_montes: await repo.contarMontesPorLote(lote.id),',
  '      qtd_montes: await relatorioRepo.contarMontesPorLote(lote.id),'
)

s = s.replace(
  '    repo.listarTransacoesPorPeriodo',
  '    useRepo(repo).listarTransacoesPorPeriodo'
)
s = s.replace(
  '    repo.listarEventosPorPeriodo',
  '    useRepo(repo).listarEventosPorPeriodo'
)
s = s.replace(
  '    repo.listarApontamentosPorPeriodo',
  '    useRepo(repo).listarApontamentosPorPeriodo'
)

s = s.replace(
  '  const apontamento = await repo.findApontamentoById(apontamentoId)',
  '  const relatorioRepo = useRepo(repo)\n  const apontamento = await relatorioRepo.findApontamentoById(apontamentoId)'
)
s = s.replace(
  '    repo.listarAlocacoesPorApontamentos([apontamentoId]),',
  '    relatorioRepo.listarAlocacoesPorApontamentos([apontamentoId]),'
)

s = s.replace(
  '    qtd_montes: await repo.contarMontesPorLote(lote.id),\n    colunas_grade',
  '    qtd_montes: await useRepo(repo).contarMontesPorLote(lote.id),\n    colunas_grade'
)

fs.writeFileSync('src/services/relatorio-service.ts', s, 'utf8')
console.log('relatorio ok')

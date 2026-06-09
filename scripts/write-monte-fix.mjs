import { execSync } from 'child_process'
import fs from 'fs'

let s = execSync('git show HEAD:src/services/monte-service.ts', { encoding: 'utf8' })

s = s.replace(/import \{[\s\S]*?\} from '@\/lib\/data-source\/cadastro-repositories'\n/, '')
s = s.replace(/import \{ getMonteRepository \} from '@\/lib\/data-source\/monte-repositories'\n/, '')
s = s.replace(
  "import type { UsuarioRole } from '@/lib/types/usuario-role'",
  `import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { DestinoSaidaRepository, SetorRepository } from '@/repositories/cadastro-repository'`
)

s = s.replace(
  'function assertAdmin(role: UsuarioRole): void {',
  `function useRepo<T>(repo: T | undefined): T {
  if (!repo) throw AppError.validation('Repositório não informado.')
  return repo
}

function assertAdmin(role: UsuarioRole): void {`
)

s = s.replace(/repo: MonteRepository = getMonteRepository\(\)/g, 'repo?: MonteRepository')

s = s.replace(
  'export async function reservarMonte(\n  ctx: ContextoMonte,\n  input: ReservarMonteInput,\n  repo?: MonteRepository\n)',
  'export async function reservarMonte(\n  ctx: ContextoMonte,\n  input: ReservarMonteInput,\n  repo?: MonteRepository,\n  setorRepo?: SetorRepository\n)'
)
s = s.replace(
  'export async function baixaMonte(\n  ctx: ContextoMonte,\n  input: BaixaMonteInput,\n  repo?: MonteRepository\n)',
  'export async function baixaMonte(\n  ctx: ContextoMonte,\n  input: BaixaMonteInput,\n  repo?: MonteRepository,\n  destinoRepo?: DestinoSaidaRepository\n)'
)
s = s.replace(
  'export async function moverMonteParaSetor(\n  ctx: ContextoMonte,\n  input: MoverMonteSetorInput,\n  repo?: MonteRepository\n)',
  'export async function moverMonteParaSetor(\n  ctx: ContextoMonte,\n  input: MoverMonteSetorInput,\n  repo?: MonteRepository,\n  setorRepo?: SetorRepository\n)'
)
s = s.replace(
  'export async function listarHistoricoMonte(\n  ctx: ContextoMonte,\n  monteId: string,\n  repo?: MonteRepository\n)',
  'export async function listarHistoricoMonte(\n  ctx: ContextoMonte,\n  monteId: string,\n  repo?: MonteRepository,\n  destinoRepo?: DestinoSaidaRepository\n)'
)
s = s.replace(
  'export async function devolverMonteAlmoxarifado(\n  ctx: ContextoMonte,\n  input: DevolverMonteAlmoxarifadoInput,\n  repo?: MonteRepository\n)',
  'export async function devolverMonteAlmoxarifado(\n  ctx: ContextoMonte,\n  input: DevolverMonteAlmoxarifadoInput,\n  repo?: MonteRepository,\n  setorRepo?: SetorRepository\n)'
)

s = s.replace(/getSetorRepository\(\)/g, 'useRepo(setorRepo)')
s = s.replace(/getDestinoSaidaRepository\(\)/g, 'useRepo(destinoRepo)')

const fns = [
  'reservarMonte',
  'cancelarReservaMonte',
  'baixaMonte',
  'moverMonteParaSetor',
  'devolverMonteAlmoxarifado',
  'trocarPosicaoMonte',
]

for (const fn of fns) {
  s = s.replace(
    new RegExp(`(export async function ${fn}[\\s\\S]*?try \\{\\n    assertAdmin\\(ctx\\.role\\)\\n)(?!    const monteRepo = useRepo)`),
    '$1    const monteRepo = useRepo(repo)\n'
  )
}

s = s.replace(
  'export async function listarHistoricoMonte(\n  ctx: ContextoMonte,\n  monteId: string,\n  repo?: MonteRepository,\n  destinoRepo?: DestinoSaidaRepository\n): Promise<LinhaHistoricoMonte[]> {\n  assertAdmin(ctx.role)\n  const monte = await repo.findById(monteId)',
  'export async function listarHistoricoMonte(\n  ctx: ContextoMonte,\n  monteId: string,\n  repo?: MonteRepository,\n  destinoRepo?: DestinoSaidaRepository\n): Promise<LinhaHistoricoMonte[]> {\n  assertAdmin(ctx.role)\n  const monteRepo = useRepo(repo)\n  const monte = await monteRepo.findById(monteId)'
)

s = s.replace(/\bawait repo\./g, 'await monteRepo.')
s = s.replace(/\breturn repo\./g, 'return monteRepo.')

s = s.replace(
  'async function getMonteAtivo(\n  monteId: string,\n  repo?: MonteRepository\n): Promise<Monte> {\n  const monte = await repo.findById(monteId)',
  'async function getMonteAtivo(\n  monteId: string,\n  repo: MonteRepository\n): Promise<Monte> {\n  const monte = await repo.findById(monteId)'
)

s = s.replace(
  '    const monte = await getMonteAtivo(input.monte_id, repo)',
  '    const monte = await getMonteAtivo(input.monte_id, monteRepo)'
)

s = s.replace(
  '    const novoStatus = await statusAposCancelarReserva(monte.id, repo)',
  '    const novoStatus = await statusAposCancelarReserva(monte.id, monteRepo)'
)

s = s.replace(
  '  const eventos = await repo.listEventosByMonteId(monteId)\n  const transacoes = await repo.listTransacoesByMonteId(monteId)',
  '  const eventos = await monteRepo.listEventosByMonteId(monteId)\n  const transacoes = await monteRepo.listTransacoesByMonteId(monteId)'
)

fs.writeFileSync('src/services/monte-service.ts', s, 'utf8')
console.log('monte-service.ts written', s.length)

import fs from 'fs'

let s = fs.readFileSync('src/services/monte-service.ts', 'utf8')

if (!s.includes("from '@/lib/estoque/calcular-saldos'")) {
  s = `import { monteTemReservaAtiva, monteEstaConsumido } from '@/lib/estoque/calcular-saldos'
import { calcularPesoBaixado } from '@/lib/monte/calcular-baixa'
${s}`
}

s = s.replace(
  'const monte = await monteRepo.findById(monteId)',
  'const monte = await repo.findById(monteId)'
)
s = s.replace(
  'await monteRepo.countTransacoesNaoEstornadas',
  'await repo.countTransacoesNaoEstornadas'
)

s = s.replace(
  '    const monte = await getMonteAtivo(input.monte_id, repo)',
  '    const monte = await getMonteAtivo(input.monte_id, monteRepo)'
)

fs.writeFileSync('src/services/monte-service.ts', s, 'utf8')
console.log('ok')

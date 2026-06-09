/**
 * Grava src/lib/supabase/database.types.ts a partir do payload MCP.
 *
 * Pré-requisito (uma das opções):
 * 1. Arquivo `.cursor/types-mcp.json` com `{ "types": "export type Json =\\n..." }`
 *    (resposta de `generate_typescript_types` no MCP Supabase do Cursor).
 * 2. `supabase login` e depois `npm run gen:types` (CLI grava o mesmo destino).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const payloadPath = path.join(root, '.cursor', 'types-mcp.json')
const outPath = path.join(root, 'src', 'lib', 'supabase', 'database.types.ts')

const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
if (!payload.types || !payload.types.includes('export type Json')) {
  console.error('[write-database-types] JSON inválido ou types vazio')
  process.exit(1)
}

fs.writeFileSync(outPath, payload.types, 'utf8')
console.log(`[write-database-types] ${outPath} (${payload.types.length} chars)`)

import { resolverConflito } from '@/lib/offline/conflict-resolver'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { throwIfSupabaseError } from '@/lib/supabase/repository-utils'

const TABELAS_PERMITIDAS = [
  'ligas',
  'lotes',
  'setores',
  'maquinas',
  'montes',
  'destinos_saida',
  'transacoes_saida',
  'eventos_monte',
  'operadores',
  'turnos',
  'modelos_produto',
  'apontamentos_consumo',
  'alocacoes_consumo',
] as const

type TabelaSync = (typeof TABELAS_PERMITIDAS)[number]

export type UpsertSyncPayload = {
  tabela: string
  registro: Record<string, unknown>
}

export async function executarUpsertSync(payload: UpsertSyncPayload): Promise<void> {
  const { tabela, registro } = payload

  if (!TABELAS_PERMITIDAS.includes(tabela as TabelaSync)) {
    throw new Error(`Tabela não permitida no sync: ${tabela}`)
  }

  const id = registro.id
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Registro de sync deve conter id (UUID).')
  }

  const supabase = createAdminSupabase()
  const tabelaTipada = tabela as TabelaSync

  const { data: existente, error: erroLeitura } = await supabase
    .from(tabelaTipada)
    .select('updated_at')
    .eq('id', id)
    .maybeSingle()

  throwIfSupabaseError(erroLeitura, tabela)

  if (existente && typeof registro.updated_at === 'string') {
    const updatedAtServidor =
      typeof existente.updated_at === 'string' ? existente.updated_at : String(existente.updated_at)
    const vencedor = resolverConflito(
      { updated_at: registro.updated_at },
      { updated_at: updatedAtServidor }
    )
    if (vencedor === 'servidor') {
      return
    }
  }

  const { error: erroUpsert } = await supabase
    .from(tabelaTipada)
    .upsert(registro, { onConflict: 'id' })

  throwIfSupabaseError(erroUpsert, tabela)
}

export async function executarDeleteSync(payload: {
  tabela: string
  id: string
}): Promise<void> {
  const { tabela, id } = payload

  if (!TABELAS_PERMITIDAS.includes(tabela as TabelaSync)) {
    throw new Error(`Tabela não permitida no sync: ${tabela}`)
  }

  const supabase = createAdminSupabase()
  const { error } = await supabase.from(tabela as TabelaSync).delete().eq('id', id)
  throwIfSupabaseError(error, tabela)
}

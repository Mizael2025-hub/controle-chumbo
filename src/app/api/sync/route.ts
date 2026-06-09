import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getDataSource } from '@/lib/data-source'
import { executarDeleteSync, executarUpsertSync } from '@/lib/supabase/sync-handler'

type SyncBody = {
  action: string
  payload: Record<string, unknown>
}

export async function POST(request: Request) {
  try {
    await getAuthenticatedUser()

    if (getDataSource() === 'local') {
      return NextResponse.json(
        {
          success: false,
          message: 'Sync desabilitado com DATA_SOURCE=local.',
        },
        { status: 503 }
      )
    }

    const body = (await request.json()) as SyncBody
    const { action, payload } = body

    switch (action) {
      case 'UPSERT_ROW':
        await executarUpsertSync({
          tabela: String(payload.tabela ?? ''),
          registro: (payload.registro as Record<string, unknown>) ?? {},
        })
        break
      case 'DELETE_ROW':
        await executarDeleteSync({
          tabela: String(payload.tabela ?? ''),
          id: String(payload.id ?? ''),
        })
        break
      default:
        return NextResponse.json(
          { success: false, message: `Ação desconhecida: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/sync]', error)
    const message = error instanceof Error ? error.message : 'Erro interno.'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

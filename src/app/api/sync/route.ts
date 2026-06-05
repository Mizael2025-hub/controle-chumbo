import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getDataSource } from '@/lib/data-source'

type SyncBody = {
  action: string
  payload: Record<string, unknown>
}

export async function POST(request: Request) {
  try {
    await getAuthenticatedUser()

    if (getDataSource() === 'local') {
      return NextResponse.json({
        success: false,
        message: 'Sync desabilitado com DATA_SOURCE=local.',
      }, { status: 503 })
    }

    const body = (await request.json()) as SyncBody
    const { action } = body

    switch (action) {
      // Actions de entidades serão despachadas nas tarefas de domínio
      default:
        return NextResponse.json(
          { success: false, message: `Ação desconhecida: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[api/sync]', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno.' },
      { status: 500 }
    )
  }
}

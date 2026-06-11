'use server'

import { getEstoqueRepository, getSetorRepository } from '@/lib/data-source/server-repositories'

import { getActionContext } from '@/lib/auth/get-session-context'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as estoqueService from '@/services/estoque-service'

async function getContexto() {
  const ctx = await getActionContext()
  return { userId: ctx.user.id, role: ctx.role as UsuarioRole }
}

function handleError<T = void>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) return { success: false, message: error.message }
  console.error('[estoqueAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function listarVisaoEstoqueAction(): Promise<
  ActionResponse<Awaited<ReturnType<typeof estoqueService.listarVisaoEstoque>>>
> {
  try {
    const ctx = await getContexto()
    const data = await estoqueService.listarVisaoEstoque(ctx, await getEstoqueRepository(), await getSetorRepository())
    const reservados = data.ligas.flatMap((liga) =>
      liga.lotes.flatMap((lote) =>
        lote.montes.filter((m) => m.status === 'RESERVADO' || Boolean(m.setor_reserva_id))
      )
    ).length
    // #region agent log
    fetch('http://127.0.0.1:7622/ingest/84850b89-18d7-41bb-9510-1c5a775fc6b2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'46d402'},body:JSON.stringify({sessionId:'46d402',location:'estoque-actions.ts:listar',message:'Visão estoque carregada',data:{ligas:data.ligas.length,montesReservados:reservados,dataSource:process.env.DATA_SOURCE},timestamp:Date.now(),hypothesisId:'H3',runId:'pre-fix'})}).catch(()=>{});
    // #endregion
    return { success: true, data }
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7622/ingest/84850b89-18d7-41bb-9510-1c5a775fc6b2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'46d402'},body:JSON.stringify({sessionId:'46d402',location:'estoque-actions.ts:listar',message:'Visão estoque falhou',data:{erro:error instanceof Error?error.message:'unknown',dataSource:process.env.DATA_SOURCE},timestamp:Date.now(),hypothesisId:'H3',runId:'pre-fix'})}).catch(()=>{});
    // #endregion
    return handleError(error)
  }
}

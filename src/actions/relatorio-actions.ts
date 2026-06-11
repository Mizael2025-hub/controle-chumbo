'use server'

import {
  getDestinoSaidaRepository,
  getEstoqueRepository,
  getLigaRepository,
  getRelatorioRepository,
  getSetorRepository,
} from '@/lib/data-source/server-repositories'

import { getActionContext } from '@/lib/auth/get-session-context'
import { AppError } from '@/lib/errors/app-error'
import type { ActionResponse } from '@/lib/types/action-response'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import * as relatorioService from '@/services/relatorio-service'
import type {
  ConsumoRelatorioDetalhe,
  EntradaRelatorioDetalhe,
  RelatorioResultado,
} from '@/services/relatorio-service'
import { relatorioConsultaSchema } from '@/validations/relatorio/relatorio-schema'
import { z } from 'zod'

async function getContexto() {
  const ctx = await getActionContext()
  return { userId: ctx.user.id, role: ctx.role as UsuarioRole }
}

function handleError<T = void>(error: unknown): ActionResponse<T> {
  if (error instanceof AppError) return { success: false, message: error.message }
  console.error('[relatorioAction]', error)
  return { success: false, message: 'Erro interno ao processar a solicitação.' }
}

export async function consultarRelatorioAction(
  rawData: unknown
): Promise<ActionResponse<RelatorioResultado>> {
  try {
    const parsed = relatorioConsultaSchema.safeParse(rawData)
    if (!parsed.success) {
      // #region agent log
      fetch('http://127.0.0.1:7622/ingest/84850b89-18d7-41bb-9510-1c5a775fc6b2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'46d402'},body:JSON.stringify({sessionId:'46d402',location:'relatorio-actions.ts:consultar',message:'Validação filtros falhou',data:{aba:typeof rawData==='object'&&rawData&&'aba' in rawData?String((rawData as {aba?:string}).aba):null,errors:parsed.error.flatten().fieldErrors},timestamp:Date.now(),hypothesisId:'H1',runId:'pre-fix'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        message: 'Filtros inválidos.',
        errors: parsed.error.flatten().fieldErrors,
      }
    }
    const ctx = await getContexto()
    const data = await relatorioService.consultarRelatorio(ctx, parsed.data, await getRelatorioRepository(), {
      ligaRepo: await getLigaRepository(),
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    // #region agent log
    fetch('http://127.0.0.1:7622/ingest/84850b89-18d7-41bb-9510-1c5a775fc6b2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'46d402'},body:JSON.stringify({sessionId:'46d402',location:'relatorio-actions.ts:consultar',message:'Relatório OK',data:{aba:data.aba,linhas:data.linhas.length,dataSource:process.env.DATA_SOURCE},timestamp:Date.now(),hypothesisId:'H1',runId:'pre-fix'})}).catch(()=>{});
    // #endregion
    return { success: true, data, message: 'Relatório carregado.' }
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7622/ingest/84850b89-18d7-41bb-9510-1c5a775fc6b2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'46d402'},body:JSON.stringify({sessionId:'46d402',location:'relatorio-actions.ts:consultar',message:'Relatório erro',data:{erro:error instanceof Error?error.message:'unknown',dataSource:process.env.DATA_SOURCE},timestamp:Date.now(),hypothesisId:'H1',runId:'pre-fix'})}).catch(()=>{});
    // #endregion
    return handleError(error)
  }
}

export async function exportarCsvRelatorioAction(
  rawData: unknown
): Promise<ActionResponse<string>> {
  try {
    const parsed = relatorioConsultaSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        message: 'Filtros inválidos.',
        errors: parsed.error.flatten().fieldErrors,
      }
    }
    const ctx = await getContexto()
    const data = await relatorioService.gerarCsvRelatorio(ctx, parsed.data, await getRelatorioRepository(), {
      ligaRepo: await getLigaRepository(),
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    return { success: true, data, message: 'CSV gerado.' }
  } catch (error) {
    return handleError(error)
  }
}

const detalheEntradaSchema = z.object({ lote_id: z.string().uuid() })
const detalheConsumoSchema = z.object({ apontamento_id: z.string().uuid() })

export async function buscarEntradaDetalheAction(
  rawData: unknown
): Promise<ActionResponse<EntradaRelatorioDetalhe | null>> {
  try {
    const parsed = detalheEntradaSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Identificador inválido.' }
    }
    const ctx = await getContexto()
    const data = await relatorioService.buscarEntradaDetalhe(ctx, parsed.data.lote_id, await getRelatorioRepository(), {
      ligaRepo: await getLigaRepository(),
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    return { success: true, data, message: 'Detalhe carregado.' }
  } catch (error) {
    return handleError(error)
  }
}

export async function buscarConsumoDetalheAction(
  rawData: unknown
): Promise<ActionResponse<ConsumoRelatorioDetalhe | null>> {
  try {
    const parsed = detalheConsumoSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, message: 'Identificador inválido.' }
    }
    const ctx = await getContexto()
    const data = await relatorioService.buscarConsumoDetalhe(ctx, parsed.data.apontamento_id, await getRelatorioRepository(), {
      ligaRepo: await getLigaRepository(),
      destinoRepo: await getDestinoSaidaRepository(),
      estoqueRepo: await getEstoqueRepository(),
      setorRepo: await getSetorRepository(),
    })
    return { success: true, data, message: 'Detalhe carregado.' }
  } catch (error) {
    return handleError(error)
  }
}

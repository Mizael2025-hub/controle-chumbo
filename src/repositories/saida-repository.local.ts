import { v4 as uuid } from 'uuid'
import { monteEstaConsumido, monteTemReservaAtiva } from '@/lib/estoque/calcular-saldos'
import { calcularPesoBaixado } from '@/lib/monte/calcular-baixa'
import { calcularStatusPosEstorno } from '@/lib/monte/calcular-status-pos-estorno'
import { db } from '@/lib/offline/db'
import type { MonteLocal } from '@/lib/offline/types'
import { AppError } from '@/lib/errors/app-error'
import { STATUS_MONTE } from '@/lib/types/status-monte'
import type {
  BaixaAgrupadaExecData,
  BaixaAgrupadaResult,
  EstornarTransacoesData,
  SaidaRepository,
} from '@/repositories/saida-repository'

function limparReserva(): Pick<
  MonteLocal,
  'reservado_para' | 'reservado_em' | 'setor_reserva_id' | 'grupo_reserva_id'
> {
  return {
    reservado_para: null,
    reservado_em: null,
    setor_reserva_id: null,
    grupo_reserva_id: null,
  }
}

function assertMonteAtivo(monte: MonteLocal): void {
  if (monteEstaConsumido(monte)) {
    throw AppError.validation('Monte já está consumido.')
  }
  if (monte.barras_atuais <= 0 || monte.peso_atual_kg < 0) {
    throw AppError.validation('Monte sem saldo disponível.')
  }
}

function assertUpdatedAt(monte: MonteLocal, expected: string): void {
  if (monte.updated_at !== expected) {
    throw AppError.conflict('Monte foi alterado por outro usuário. Recarregue e tente novamente.')
  }
}

async function countBaixasAtivas(monteId: string): Promise<number> {
  return db.transacoes_saida
    .where('monte_id')
    .equals(monteId)
    .filter((t) => !t.estornada)
    .count()
}

export const saidaRepositoryLocal: SaidaRepository = {
  async listarTransacoes() {
    const registros = await db.transacoes_saida.toArray()
    return registros.sort((a, b) => b.data_transacao.localeCompare(a.data_transacao))
  },

  async findTransacaoById(id) {
    return (await db.transacoes_saida.get(id)) ?? null
  },

  async findTransacoesByGrupo(grupoId) {
    return db.transacoes_saida.where('grupo_liberacao_id').equals(grupoId).toArray()
  },

  async executarBaixaAgrupada(data: BaixaAgrupadaExecData): Promise<BaixaAgrupadaResult> {
    if (data.linhas.length === 0) {
      throw AppError.validation('Selecione ao menos um monte para liberar.')
    }

    const destino = await db.destinos_saida.get(data.destino_saida_id)
    if (!destino || !destino.is_active) {
      throw AppError.validation('Destino de saída inválido.')
    }

    const grupoLiberacaoId = uuid()
    const agora = new Date().toISOString()
    const transacaoIds: string[] = []

    return db.transaction('rw', db.montes, db.transacoes_saida, async () => {
      for (const linha of data.linhas) {
        const monte = await db.montes.get(linha.monte_id)
        if (!monte) throw AppError.notFound('Monte')

        assertUpdatedAt(monte, linha.updated_at)
        assertMonteAtivo(monte)

        if (linha.barras_baixadas > monte.barras_atuais) {
          throw AppError.validation('Barras informadas excedem o saldo do monte.')
        }

        const pesoBaixado = calcularPesoBaixado(
          monte.peso_atual_kg,
          monte.barras_atuais,
          linha.barras_baixadas
        )
        const novasBarras = monte.barras_atuais - linha.barras_baixadas
        const novoPeso = Math.max(
          0,
          Math.round((monte.peso_atual_kg - pesoBaixado) * 100) / 100
        )
        const baixaTotal = novasBarras <= 0

        let novoStatus: string
        const patchReserva = baixaTotal ? limparReserva() : {}

        if (baixaTotal) {
          novoStatus = STATUS_MONTE.CONSUMIDO
        } else if (monteTemReservaAtiva(monte) || monte.status === STATUS_MONTE.RESERVADO) {
          novoStatus = STATUS_MONTE.RESERVADO
        } else {
          novoStatus = STATUS_MONTE.PARCIAL
        }

        const transacaoId = uuid()
        transacaoIds.push(transacaoId)

        await db.transacoes_saida.add({
          id: transacaoId,
          monte_id: monte.id,
          peso_baixado_kg: pesoBaixado,
          barras_baixadas: linha.barras_baixadas,
          destino_saida_id: destino.id,
          setor_id: data.setor_id ?? null,
          data_transacao: agora,
          grupo_liberacao_id: grupoLiberacaoId,
          observacao: data.observacao?.trim() || null,
          estornada: false,
          estornada_em: null,
          estornada_por: null,
          created_by: data.created_by,
          created_at: agora,
          updated_at: agora,
        })

        await db.montes.put({
          ...monte,
          peso_atual_kg: baixaTotal ? 0 : novoPeso,
          barras_atuais: baixaTotal ? 0 : novasBarras,
          status: novoStatus,
          ...patchReserva,
          updated_at: agora,
        })
      }

      return { grupo_liberacao_id: grupoLiberacaoId, transacao_ids: transacaoIds }
    })
  },

  async estornarTransacoes(data: EstornarTransacoesData): Promise<void> {
    if (data.transacao_ids.length === 0) {
      throw AppError.validation('Nenhuma transação informada para estorno.')
    }

    const agora = new Date().toISOString()

    await db.transaction('rw', db.montes, db.transacoes_saida, async () => {
      for (const transacaoId of data.transacao_ids) {
        const transacao = await db.transacoes_saida.get(transacaoId)
        if (!transacao) throw AppError.notFound('Transação de saída')
        if (transacao.estornada) {
          throw AppError.validation('Esta liberação já foi estornada.')
        }

        const monte = await db.montes.get(transacao.monte_id)
        if (!monte) throw AppError.notFound('Monte')

        await db.transacoes_saida.put({
          ...transacao,
          estornada: true,
          estornada_em: agora,
          estornada_por: data.estornada_por,
          updated_at: agora,
        })

        const novasBarras = monte.barras_atuais + transacao.barras_baixadas
        const novoPeso =
          Math.round((monte.peso_atual_kg + transacao.peso_baixado_kg) * 100) / 100

        const temOutrasBaixas = (await countBaixasAtivas(monte.id)) > 0
        const novoStatus = calcularStatusPosEstorno(monte, temOutrasBaixas)

        await db.montes.put({
          ...monte,
          peso_atual_kg: novoPeso,
          barras_atuais: novasBarras,
          status: novoStatus,
          updated_at: agora,
        })
      }
    })
  },
}

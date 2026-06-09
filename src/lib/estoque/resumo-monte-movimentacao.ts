import { monteEstaConsumido } from '@/lib/estoque/calcular-saldos'
import type { LinhaHistoricoMonte } from '@/services/monte-service'
import type { Monte } from '@/repositories/estoque-repository'

export type ResumoMonteMovimentacao = {
  titulo: string
  descricao: string
  destaque: 'setor' | 'consumido' | 'parcial' | 'info'
}

export function montarResumoMonte(monte: Monte): ResumoMonteMovimentacao {
  if (monte.localizacao === 'setor') {
    return {
      titulo: 'Material no setor',
      descricao: '',
      destaque: 'setor',
    }
  }

  if (monteEstaConsumido(monte)) {
    return {
      titulo: 'Consumido',
      descricao: '',
      destaque: 'consumido',
    }
  }

  if (monte.status === 'PARCIAL') {
    return {
      titulo: 'Baixa parcial',
      descricao: 'Parte do material já foi liberada. Veja as transações no histórico.',
      destaque: 'parcial',
    }
  }

  return {
    titulo: 'Situação do monte',
    descricao: 'Consulte o histórico de movimentações e liberações.',
    destaque: 'info',
  }
}

export function ultimaLinhaHistorico(linhas: LinhaHistoricoMonte[]): LinhaHistoricoMonte | null {
  return linhas[0] ?? null
}

export function transacoesAtivasHistorico(linhas: LinhaHistoricoMonte[]): LinhaHistoricoMonte[] {
  return linhas.filter((l) => l.tipo === 'transacao' && !l.estornada)
}

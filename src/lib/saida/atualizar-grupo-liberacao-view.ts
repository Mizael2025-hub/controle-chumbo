import type { LiberacaoGrupoView } from '@/services/saida-service'

type MetadadosTransacaoGrupo = {
  observacao?: string | null
  ligaNome?: string
  setorNome?: string
}

export function metadadosIniciaisGrupo(transacao: MetadadosTransacaoGrupo): Pick<
  LiberacaoGrupoView,
  'observacao' | 'ligas' | 'setores'
> {
  const obs = transacao.observacao?.trim()
  return {
    observacao: obs || null,
    ligas: transacao.ligaNome ? [transacao.ligaNome] : [],
    setores: transacao.setorNome ? [transacao.setorNome] : [],
  }
}

export function mesclarMetadadosGrupo(
  grupo: LiberacaoGrupoView,
  transacao: MetadadosTransacaoGrupo
): void {
  const obs = transacao.observacao?.trim()
  if (obs && !grupo.observacao) {
    grupo.observacao = obs
  }
  if (transacao.ligaNome && !grupo.ligas.includes(transacao.ligaNome)) {
    grupo.ligas.push(transacao.ligaNome)
  }
  if (transacao.setorNome && !grupo.setores.includes(transacao.setorNome)) {
    grupo.setores.push(transacao.setorNome)
  }
}

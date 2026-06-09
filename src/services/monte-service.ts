import { monteTemReservaAtiva, monteEstaConsumido } from '@/lib/estoque/calcular-saldos'
import { calcularPesoBaixado } from '@/lib/monte/calcular-baixa'
import { AppError } from '@/lib/errors/app-error'
import { STATUS_MONTE, type StatusMonte } from '@/lib/types/status-monte'
import { TIPOS_EVENTO_MONTE } from '@/lib/types/tipo-evento-monte'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { DestinoSaidaRepository, SetorRepository } from '@/repositories/cadastro-repository'
import type { Monte, MonteRepository } from '@/repositories/monte-repository'
import type {
  BaixaMonteInput,
  CancelarReservaMonteInput,
  DevolverMonteAlmoxarifadoInput,
  MoverMonteSetorInput,
  ReservarMonteInput,
  TrocarPosicaoMonteInput,
} from '@/validations/monte/monte-schema'

type ContextoMonte = {
  userId: string
  role: UsuarioRole
}

function requireRepo<T>(repo: T | undefined): T {
  if (!repo) throw AppError.validation('Repositório não informado.')
  return repo
}

function assertAdmin(role: UsuarioRole): void {
  if (role !== 'admin') {
    throw AppError.unauthorized()
  }
}

async function getMonteAtivo(
  monteId: string,
  repo: MonteRepository
): Promise<Monte> {
  const monte = await repo.findById(monteId)
  if (!monte) throw AppError.notFound('Monte')
  if (monteEstaConsumido(monte)) {
    throw AppError.validation('Monte já está consumido.')
  }
  if (monte.barras_atuais <= 0 || monte.peso_atual_kg < 0) {
    throw AppError.validation('Monte sem saldo disponível.')
  }
  return monte
}

async function statusAposCancelarReserva(
  monteId: string,
  repo: MonteRepository
): Promise<string> {
  const temBaixa = (await repo.countTransacoesNaoEstornadas(monteId)) > 0
  return temBaixa ? STATUS_MONTE.PARCIAL : STATUS_MONTE.DISPONIVEL
}

function limparReserva(): {
  reservado_para: null
  reservado_em: null
  setor_reserva_id: null
  grupo_reserva_id: null
} {
  return {
    reservado_para: null,
    reservado_em: null,
    setor_reserva_id: null,
    grupo_reserva_id: null,
  }
}

export async function reservarMonte(
  ctx: ContextoMonte,
  input: ReservarMonteInput,
  repo?: MonteRepository,
  setorRepo?: SetorRepository
): Promise<Monte> {
  try {
    assertAdmin(ctx.role)
    const monteRepo = requireRepo(repo)
    const monte = await getMonteAtivo(input.monte_id, monteRepo)

    if (monteTemReservaAtiva(monte)) {
      throw AppError.validation('Monte já possui reserva ativa.')
    }

    const setor = await requireRepo(setorRepo).findById(input.setor_reserva_id)
    if (!setor || !setor.is_active) {
      throw AppError.validation('Setor de reserva inválido.')
    }

    const agora = new Date().toISOString()
    const destinatario = input.reservado_para?.trim() || setor.nome

    const atualizado = await monteRepo.update(input.monte_id, input.updated_at, {
      status: STATUS_MONTE.RESERVADO,
      setor_reserva_id: setor.id,
      reservado_para: destinatario,
      reservado_em: agora,
    })

    await monteRepo.createEvento({
      monte_id: monte.id,
      tipo: TIPOS_EVENTO_MONTE.RESERVA,
      destinatario,
      data_evento: agora,
      created_by: ctx.userId,
    })

    return atualizado
  } catch (error) {
    console.error('[reservarMonte]', error)
    throw error
  }
}

export async function cancelarReservaMonte(
  ctx: ContextoMonte,
  input: CancelarReservaMonteInput,
  repo?: MonteRepository
): Promise<Monte> {
  try {
    assertAdmin(ctx.role)
    const monteRepo = requireRepo(repo)
    const monte = await monteRepo.findById(input.monte_id)
    if (!monte) throw AppError.notFound('Monte')

    if (!monteTemReservaAtiva(monte)) {
      throw AppError.validation('Monte não possui reserva ativa.')
    }

    const agora = new Date().toISOString()
    const novoStatus = await statusAposCancelarReserva(monte.id, monteRepo)
    const destinatario = monte.reservado_para ?? 'Reserva cancelada'

    const atualizado = await monteRepo.update(input.monte_id, input.updated_at, {
      status: novoStatus,
      ...limparReserva(),
    })

    await monteRepo.createEvento({
      monte_id: monte.id,
      tipo: TIPOS_EVENTO_MONTE.CANCELAMENTO_RESERVA,
      destinatario,
      data_evento: agora,
      created_by: ctx.userId,
    })

    return atualizado
  } catch (error) {
    console.error('[cancelarReservaMonte]', error)
    throw error
  }
}

export async function baixaMonte(
  ctx: ContextoMonte,
  input: BaixaMonteInput,
  repo?: MonteRepository,
  destinoRepo?: DestinoSaidaRepository
): Promise<Monte> {
  try {
    assertAdmin(ctx.role)
    const monteRepo = requireRepo(repo)
    const monte = await getMonteAtivo(input.monte_id, monteRepo)

    if (input.barras_baixadas > monte.barras_atuais) {
      throw AppError.validation('Barras informadas excedem o saldo do monte.')
    }

    const destino = await requireRepo(destinoRepo).findById(input.destino_saida_id)
    if (!destino || !destino.is_active) {
      throw AppError.validation('Destino de saída inválido.')
    }

    const pesoBaixado = calcularPesoBaixado(
      monte.peso_atual_kg,
      monte.barras_atuais,
      input.barras_baixadas
    )
    const novasBarras = monte.barras_atuais - input.barras_baixadas
    const novoPeso = Math.max(0, Math.round((monte.peso_atual_kg - pesoBaixado) * 100) / 100)
    const agora = new Date().toISOString()
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

    await monteRepo.createTransacao({
      monte_id: monte.id,
      peso_baixado_kg: pesoBaixado,
      barras_baixadas: input.barras_baixadas,
      destino_saida_id: destino.id,
      setor_id: input.setor_id ?? null,
      data_transacao: agora,
      grupo_liberacao_id: input.grupo_liberacao_id ?? null,
      created_by: ctx.userId,
    })

    return monteRepo.update(input.monte_id, input.updated_at, {
      peso_atual_kg: baixaTotal ? 0 : novoPeso,
      barras_atuais: baixaTotal ? 0 : novasBarras,
      status: novoStatus,
      ...patchReserva,
    })
  } catch (error) {
    console.error('[baixaMonte]', error)
    throw error
  }
}

export async function moverMonteParaSetor(
  ctx: ContextoMonte,
  input: MoverMonteSetorInput,
  repo?: MonteRepository,
  setorRepo?: SetorRepository
): Promise<Monte> {
  try {
    assertAdmin(ctx.role)
    const monteRepo = requireRepo(repo)
    const monte = await getMonteAtivo(input.monte_id, monteRepo)

    if (monte.localizacao !== 'almoxarifado') {
      throw AppError.validation('Monte já está em um setor. Devolva ao almoxarifado antes.')
    }

    const setor = await requireRepo(setorRepo).findById(input.setor_id)
    if (!setor || !setor.is_active) {
      throw AppError.validation('Setor inválido.')
    }

    const barrasMovidas = input.barras_movidas ?? monte.barras_atuais
    if (barrasMovidas > monte.barras_atuais) {
      throw AppError.validation('Barras movidas excedem o saldo do monte.')
    }

    const agora = new Date().toISOString()
    const obs = input.observacao?.trim()
    const destinatarioBase = obs ? `${setor.nome} — ${obs}` : setor.nome

    if (barrasMovidas === monte.barras_atuais) {
      const atualizado = await monteRepo.update(input.monte_id, input.updated_at, {
        localizacao: 'setor',
        setor_id: setor.id,
        movido_setor_em: agora,
      })

      await monteRepo.createEvento({
        monte_id: monte.id,
        tipo: TIPOS_EVENTO_MONTE.MOVIDO_PARA_SETOR,
        destinatario: destinatarioBase,
        data_evento: agora,
        created_by: ctx.userId,
      })

      return atualizado
    }

    const pesoMovido = calcularPesoBaixado(monte.peso_atual_kg, monte.barras_atuais, barrasMovidas)
    const novasBarrasPai = monte.barras_atuais - barrasMovidas
    const novoPesoPai = Math.round((monte.peso_atual_kg - pesoMovido) * 100) / 100

    let novoStatusPai: StatusMonte = STATUS_MONTE.PARCIAL
    if (monteTemReservaAtiva(monte) || monte.status === STATUS_MONTE.RESERVADO) {
      novoStatusPai = STATUS_MONTE.RESERVADO
    }

    const posSetor = await monteRepo.proximaPosicaoSetorNoLote(monte.lote_id)
    const destinatarioParcial = `${destinatarioBase} (${barrasMovidas} barras)`

    const paiAtualizado = await monteRepo.update(input.monte_id, input.updated_at, {
      peso_atual_kg: novoPesoPai,
      barras_atuais: novasBarrasPai,
      status: novoStatusPai,
    })

    const filho = await monteRepo.createMonte({
      lote_id: monte.lote_id,
      peso_atual_kg: pesoMovido,
      barras_atuais: barrasMovidas,
      posicao_x: posSetor.posicao_x,
      posicao_y: posSetor.posicao_y,
      status: STATUS_MONTE.DISPONIVEL,
      localizacao: 'setor',
      setor_id: setor.id,
      movido_setor_em: agora,
      monte_origem_id: monte.id,
      created_by: ctx.userId,
    })

    await monteRepo.createEvento({
      monte_id: paiAtualizado.id,
      tipo: TIPOS_EVENTO_MONTE.MOVIDO_PARA_SETOR,
      destinatario: `Parcial → ${destinatarioParcial}`,
      data_evento: agora,
      created_by: ctx.userId,
    })

    await monteRepo.createEvento({
      monte_id: filho.id,
      tipo: TIPOS_EVENTO_MONTE.MOVIDO_PARA_SETOR,
      destinatario: destinatarioParcial,
      data_evento: agora,
      created_by: ctx.userId,
    })

    return paiAtualizado
  } catch (error) {
    console.error('[moverMonteParaSetor]', error)
    throw error
  }
}

export type LinhaHistoricoMonte = {
  id: string
  tipo: 'evento' | 'transacao'
  rotulo: string
  detalhe: string
  data: string
  estornada?: boolean
  grupo_liberacao_id?: string | null
}

export async function listarHistoricoMonte(
  ctx: ContextoMonte,
  monteId: string,
  repo?: MonteRepository,
  destinoRepo?: DestinoSaidaRepository
): Promise<LinhaHistoricoMonte[]> {
  assertAdmin(ctx.role)
  const monteRepo = requireRepo(repo)
  const monte = await monteRepo.findById(monteId)
  if (!monte) throw AppError.notFound('Monte')

  const destinos = await requireRepo(destinoRepo).findAll(true)
  const destinosPorId = new Map(destinos.map((d) => [d.id, d.nome]))

  const eventos = await monteRepo.listEventosByMonteId(monteId)
  const transacoes = await monteRepo.listTransacoesByMonteId(monteId)

  const linhas: LinhaHistoricoMonte[] = []

  for (const ev of eventos) {
    linhas.push({
      id: ev.id,
      tipo: 'evento',
      rotulo: ev.tipo.replaceAll('_', ' '),
      detalhe: ev.destinatario,
      data: ev.data_evento,
    })
  }

  for (const tx of transacoes) {
    linhas.push({
      id: tx.id,
      tipo: 'transacao',
      rotulo: 'Baixa / liberação',
      detalhe: `${destinosPorId.get(tx.destino_saida_id) ?? 'Destino'} · ${tx.barras_baixadas} barras`,
      data: tx.data_transacao,
      estornada: tx.estornada,
      grupo_liberacao_id: tx.grupo_liberacao_id,
    })
  }

  return linhas.sort((a, b) => b.data.localeCompare(a.data))
}

export async function devolverMonteAlmoxarifado(
  ctx: ContextoMonte,
  input: DevolverMonteAlmoxarifadoInput,
  repo?: MonteRepository,
  setorRepo?: SetorRepository
): Promise<Monte> {
  try {
    assertAdmin(ctx.role)
    const monteRepo = requireRepo(repo)
    const monte = await monteRepo.findById(input.monte_id)
    if (!monte) throw AppError.notFound('Monte')
    if (monteEstaConsumido(monte)) {
      throw AppError.validation('Monte consumido não pode ser movido.')
    }

    if (monte.localizacao !== 'setor') {
      throw AppError.validation('Monte já está no almoxarifado.')
    }

    const agora = new Date().toISOString()
    const setorNome = monte.setor_id
      ? (await requireRepo(setorRepo).findById(monte.setor_id))?.nome ?? 'Setor'
      : 'Setor'

    const atualizado = await monteRepo.update(input.monte_id, input.updated_at, {
      localizacao: 'almoxarifado',
      setor_id: null,
      movido_setor_em: null,
    })

    await monteRepo.createEvento({
      monte_id: monte.id,
      tipo: TIPOS_EVENTO_MONTE.DEVOLVIDO_ALMOXARIFADO,
      destinatario: setorNome,
      data_evento: agora,
      created_by: ctx.userId,
    })

    return atualizado
  } catch (error) {
    console.error('[devolverMonteAlmoxarifado]', error)
    throw error
  }
}

export async function trocarPosicaoMonte(
  ctx: ContextoMonte,
  input: TrocarPosicaoMonteInput,
  repo?: MonteRepository
): Promise<Monte> {
  try {
    assertAdmin(ctx.role)
    const monteRepo = requireRepo(repo)
    const monte = await monteRepo.findById(input.monte_id)
    if (!monte) throw AppError.notFound('Monte')

    const limites = await monteRepo.findLoteLimitesByMonteId(input.monte_id)
    if (!limites) throw AppError.notFound('Lote')

    if (
      input.posicao_x >= limites.colunas_grade ||
      input.posicao_y >= limites.linhas_grade ||
      input.posicao_x < 0 ||
      input.posicao_y < 0
    ) {
      throw AppError.validation('Posição fora dos limites da grade do lote.')
    }

    if (monte.posicao_x === input.posicao_x && monte.posicao_y === input.posicao_y) {
      return monte
    }

    return monteRepo.trocarPosicoes(
      input.monte_id,
      input.updated_at,
      input.posicao_x,
      input.posicao_y
    )
  } catch (error) {
    console.error('[trocarPosicaoMonte]', error)
    throw error
  }
}

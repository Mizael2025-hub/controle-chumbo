'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataInputPtBr } from '@/components/ui/data-input-pt-br'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import { contagemEstoqueClient } from '@/lib/contagem/contagem-estoque-client'
import {
  CHAVE_COR_CLASSES,
  type ChaveCorLiga,
  isChaveCorLiga,
} from '@/lib/types/chave-cor-liga'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { agoraLocal, dataPtBrParaInputIso, formatarData } from '@/lib/utils/date-time'
import { formatarNumeroPtBr } from '@/lib/utils/format-number'
import type { ContagemEstoqueLinha } from '@/repositories/contagem-estoque-repository'
import {
  contagemLinhaFormSchema,
  type ContagemLinhaFormInput,
} from '@/validations/contagem/contagem-estoque-schema'

type Props = {
  userId: string
  role: UsuarioRole
}

function linhaParaForm(linha: ContagemEstoqueLinha): ContagemLinhaFormInput {
  const [ano, mes, dia] = linha.data_contagem.split('-').map(Number)
  const dataUi = format(new Date(ano, mes - 1, dia), 'dd/MM/yyyy')
  return {
    data_contagem_ui: dataUi,
    liga_id: linha.liga_id,
    quantidade_barras: linha.quantidade_barras,
    numero_lote: linha.numero_lote ?? '',
  }
}

const formVazio = (): ContagemLinhaFormInput => ({
  data_contagem_ui: format(agoraLocal(), 'dd/MM/yyyy'),
  liga_id: '',
  quantidade_barras: 1,
  numero_lote: '',
})

export function ContagemEstoqueView({ userId, role }: Props) {
  const ctx = { userId, role }
  const queryClient = useQueryClient()
  const [dataUi, setDataUi] = useState(format(agoraLocal(), 'dd/MM/yyyy'))
  const [form, setForm] = useState<ContagemLinhaFormInput>(formVazio)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const dataIso = useMemo(() => dataPtBrParaInputIso(dataUi) || null, [dataUi])

  const { data: ligas = [] } = useQuery({
    queryKey: ['cadastros', 'ligas'],
    queryFn: async () => {
      const res = await cadastroClient.listarLigas(ctx)
      if (!res.success) throw new Error(res.message)
      return (res.data ?? []).filter((l) => l.is_active)
    },
  })

  const ligasPorId = useMemo(() => new Map(ligas.map((l) => [l.id, l])), [ligas])
  const ligaIdForm = form.liga_id || ligas[0]?.id || ''

  const { data: visao, isLoading } = useQuery({
    queryKey: ['contagem', 'rascunho', userId, dataIso],
    enabled: Boolean(dataIso),
    queryFn: async () => {
      if (!dataIso) throw new Error('Data inválida')
      const res = await contagemEstoqueClient.listarRascunho(ctx, dataIso)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
  })

  const invalidar = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['contagem', 'rascunho', userId] })
  }, [queryClient, userId])

  const salvar = useMutation({
    mutationFn: async () => {
      const payload = { ...form, liga_id: ligaIdForm, data_contagem_ui: dataUi }
      const check = contagemLinhaFormSchema.safeParse(payload)
      if (!check.success) {
        throw new Error(check.error.issues[0]?.message ?? 'Dados inválidos')
      }
      if (editandoId) {
        return contagemEstoqueClient.atualizarLinha(ctx, editandoId, check.data)
      }
      return contagemEstoqueClient.adicionarLinha(ctx, check.data)
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
      setForm((f) => ({
        ...formVazio(),
        data_contagem_ui: dataUi,
        liga_id: f.liga_id || ligas[0]?.id || '',
      }))
      setEditandoId(null)
      invalidar()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const excluir = useMutation({
    mutationFn: (id: string) => contagemEstoqueClient.excluirLinha(ctx, id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
      if (editandoId) setEditandoId(null)
      invalidar()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const linhas = visao?.linhas ?? []
  const totais = visao?.totais_por_liga ?? []

  const iniciarEdicao = (linha: ContagemEstoqueLinha) => {
    setEditandoId(linha.id)
    setForm(linhaParaForm(linha))
    setDataUi(linhaParaForm(linha).data_contagem_ui)
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setForm({
      ...formVazio(),
      data_contagem_ui: dataUi,
      liga_id: ligas[0]?.id ?? '',
    })
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <p className="text-sm text-zinc-500">
        Rascunho salvo neste dispositivo. Você pode sair e voltar — os apontamentos permanecem até
        excluir ou concluir a auditoria (fase futura).
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="data-contagem">
          Data da contagem
        </label>
        <DataInputPtBr
          id="data-contagem"
          value={dataUi}
          onChange={(ptBr) => {
            setDataUi(ptBr)
            setForm((f) => ({ ...f, data_contagem_ui: ptBr }))
          }}
          className="max-w-[220px]"
          data-testid="input-data-contagem"
        />
        {dataIso && (
          <span className="text-xs text-zinc-500">Registros do dia {formatarData(dataIso)}</span>
        )}
      </div>

      <form
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-ios-card p-4 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          salvar.mutate()
        }}
        data-testid="form-contagem-linha"
      >
        <h2 className="font-semibold">{editandoId ? 'Editar apontamento' : 'Novo apontamento'}</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="liga-contagem">
            Liga
          </label>
          <select
            id="liga-contagem"
            value={ligaIdForm}
            onChange={(e) => setForm((f) => ({ ...f, liga_id: e.target.value }))}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-ios-btn text-[16px] min-h-[44px]"
            data-testid="select-liga-contagem"
          >
            {ligas.map((liga) => (
              <option key={liga.id} value={liga.id}>
                {liga.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="barras-contagem">
            Quantidade de barras
          </label>
          <input
            id="barras-contagem"
            type="number"
            min={1}
            value={form.quantidade_barras}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                quantidade_barras: Number.parseInt(e.target.value, 10) || 0,
              }))
            }
            className="w-full max-w-[160px] px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-ios-btn text-[16px] min-h-[44px] tabular-nums"
            data-testid="input-barras-contagem"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="lote-contagem">
            Lote (opcional)
          </label>
          <input
            id="lote-contagem"
            type="text"
            value={form.numero_lote ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, numero_lote: e.target.value }))}
            placeholder="Ex.: 2024-03"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-ios-btn text-[16px] min-h-[44px]"
            data-testid="input-lote-contagem"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={salvar.isPending || !dataIso}
            className="apple-pressable bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px] disabled:opacity-50"
            data-testid="btn-salvar-contagem"
          >
            {salvar.isPending ? 'Salvando…' : editandoId ? 'Atualizar' : 'Adicionar'}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicao}
              className="apple-pressable px-4 py-2 rounded-ios-btn border border-zinc-300 dark:border-zinc-700 min-h-[44px]"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {totais.length > 0 && (
        <section
          className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-ios-card p-4"
          data-testid="contagem-totais-liga"
        >
          <h2 className="font-semibold mb-3">Totais por liga</h2>
          <ul className="flex flex-col gap-2">
            {totais.map((t) => {
              const liga = ligasPorId.get(t.liga_id)
              const cor = liga && isChaveCorLiga(liga.chave_cor)
                ? CHAVE_COR_CLASSES[liga.chave_cor as ChaveCorLiga]
                : 'bg-zinc-300'
              return (
                <li key={t.liga_id} className="flex items-center gap-3 text-sm">
                  <span className={`h-4 w-4 rounded-full shrink-0 ${cor}`} />
                  <span className="font-medium flex-1">{liga?.nome ?? 'Liga'}</span>
                  <span className="tabular-nums font-semibold text-apple-blue">
                    {formatarNumeroPtBr(t.total_barras)} barras
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-2">Apontamentos do dia</h2>
        {isLoading ? (
          <p className="text-zinc-500 text-sm">Carregando rascunho…</p>
        ) : linhas.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nenhum apontamento para esta data.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {linhas.map((linha) => {
              const liga = ligasPorId.get(linha.liga_id)
              return (
                <li
                  key={linha.id}
                  className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-ios-card p-3"
                  data-testid={`contagem-linha-${linha.id}`}
                >
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-medium block">{liga?.nome ?? 'Liga'}</span>
                    <span className="text-zinc-500 tabular-nums">
                      {formatarNumeroPtBr(linha.quantidade_barras)} barras
                      {linha.numero_lote ? ` · Lote ${linha.numero_lote}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => iniciarEdicao(linha)}
                    className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-ios-btn"
                    aria-label="Editar"
                    data-testid={`btn-editar-contagem-${linha.id}`}
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => excluir.mutate(linha.id)}
                    disabled={excluir.isPending}
                    className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-ios-btn text-apple-red"
                    aria-label="Excluir"
                    data-testid={`btn-excluir-contagem-${linha.id}`}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Link
        href="/estoque"
        className="text-sm text-apple-blue min-h-[44px] inline-flex items-center w-fit"
      >
        Voltar ao estoque
      </Link>
    </div>
  )
}

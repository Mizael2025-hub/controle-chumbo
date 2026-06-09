'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { agentLog } from '@/lib/debug/agent-log'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import { consumoClient } from '@/lib/consumo/consumo-client'
import { estoqueClient } from '@/lib/estoque/estoque-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { DataInputPtBr } from '@/components/ui/data-input-pt-br'
import { agoraLocal, formatarData } from '@/lib/utils/date-time'
import {
  criarConsumoSchema,
  type CriarConsumoInput,
} from '@/validations/consumo/consumo-schema'

type Props = {
  ctx: { userId: string; role: UsuarioRole }
}

type FormValues = {
  data_consumo: string
  setor_id: string
  maquina_id: string
  operador_id: string
  turno_id: string
  liga_id: string
  lote_id: string
  barras: string
  borra_kg: string
  observacoes: string
}

export function ConsumoForm({ ctx }: Props) {
  const queryClient = useQueryClient()

  useEffect(() => {
    // #region agent log
    requestAnimationFrame(() => {
      const main = document.querySelector('[data-testid="app-main-scroll"]')
      agentLog({
        location: 'consumo-form.tsx:mount',
        message: 'Consumo — medição de overflow horizontal',
        hypothesisId: 'H4',
        runId: 'post-fix-v3',
        data: {
          innerWidth: window.innerWidth,
          docScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          mainClientWidth: main?.clientWidth ?? null,
          mainScrollWidth: main instanceof HTMLElement ? main.scrollWidth : null,
          temOverflow: document.documentElement.scrollWidth > window.innerWidth,
        },
      })
    })
    // #endregion
  }, [])

  const { data: visaoEstoque } = useQuery({
    queryKey: ['estoque', 'visao'],
    queryFn: async () => {
      const res = await estoqueClient.listarVisaoEstoque(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
  })

  const ligas = useMemo(() => visaoEstoque?.ligas ?? [], [visaoEstoque])

  const { data: setores = [] } = useQuery({
    queryKey: ['cadastros', 'setores'],
    queryFn: async () => {
      const res = await cadastroClient.listarSetores(ctx)
      if (!res.success) throw new Error(res.message)
      return (res.data ?? []).filter((s) => s.is_active)
    },
  })

  const { data: maquinas = [] } = useQuery({
    queryKey: ['cadastros', 'maquinas'],
    queryFn: async () => {
      const res = await cadastroClient.listarMaquinas(ctx)
      if (!res.success) throw new Error(res.message)
      return (res.data ?? []).filter((m) => m.is_active)
    },
  })

  const { data: operadores = [] } = useQuery({
    queryKey: ['cadastros', 'operadores'],
    queryFn: async () => {
      const res = await cadastroClient.listarOperadores(ctx)
      if (!res.success) throw new Error(res.message)
      return (res.data ?? []).filter((o) => o.is_active)
    },
  })

  const { data: turnos = [] } = useQuery({
    queryKey: ['cadastros', 'turnos'],
    queryFn: async () => {
      const res = await cadastroClient.listarTurnos(ctx)
      if (!res.success) throw new Error(res.message)
      return (res.data ?? []).filter((t) => t.is_active)
    },
  })

  const form = useForm<FormValues>({
    defaultValues: {
      data_consumo: formatarData(agoraLocal()),
      setor_id: '',
      maquina_id: '',
      operador_id: '',
      turno_id: '',
      liga_id: '',
      lote_id: '',
      barras: '',
      borra_kg: '',
      observacoes: '',
    },
  })

  const setorId = useWatch({ control: form.control, name: 'setor_id' }) ?? ''
  const ligaIdForm = useWatch({ control: form.control, name: 'liga_id' }) ?? ''

  const maquinasSetor = useMemo(
    () => maquinas.filter((m) => m.setor_id === setorId),
    [maquinas, setorId]
  )

  const { data: lotesConsumo = [] } = useQuery({
    queryKey: ['consumo', 'lotes', setorId, ligaIdForm],
    enabled: Boolean(setorId && ligaIdForm),
    queryFn: async () => {
      const res = await consumoClient.listarLotes(ctx, {
        setor_id: setorId,
        liga_id: ligaIdForm,
      })
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const salvar = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload: CriarConsumoInput = {
        data_consumo: values.data_consumo,
        setor_id: values.setor_id,
        maquina_id: values.maquina_id,
        operador_id: values.operador_id,
        turno_id: values.turno_id,
        liga_id: values.liga_id,
        lote_id: values.lote_id,
        barras: Number.parseInt(values.barras, 10),
        borra_kg: Number.parseFloat(values.borra_kg.replace(',', '.')) || 0,
        observacoes: values.observacoes.trim() || undefined,
        modo_selecao_montes: 'automatico',
      }
      const parsed = criarConsumoSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error('Revise os campos do formulário.')
      }
      const res = await consumoClient.criar(ctx, parsed.data)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      toast.success('Consumo registrado com sucesso!')
      form.reset({
        data_consumo: formatarData(agoraLocal()),
        setor_id: setorId,
        maquina_id: '',
        operador_id: '',
        turno_id: '',
        liga_id: ligaIdForm,
        lote_id: '',
        barras: '',
        borra_kg: '',
        observacoes: '',
      })
      void queryClient.invalidateQueries({ queryKey: ['estoque', 'visao'] })
      void queryClient.invalidateQueries({ queryKey: ['consumo'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const onSubmit = form.handleSubmit((values) => salvar.mutate(values))

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 max-lg:gap-3 w-full min-w-0 max-w-lg pb-4"
      data-testid="consumo-form"
    >
      <p className="text-sm text-zinc-500">
        Registre o consumo diário de chumbo já liberado nos setores de produção.
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="data-consumo">
          Data
        </label>
        <Controller
          name="data_consumo"
          control={form.control}
          render={({ field }) => (
            <DataInputPtBr
              id="data-consumo"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              data-testid="input-data-consumo"
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Setor</label>
        <select
          {...form.register('setor_id', {
            onChange: () => form.setValue('maquina_id', ''),
          })}
          className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
          data-testid="select-setor-consumo"
        >
          <option value="">Selecione</option>
          {setores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Máquina</label>
        <select
          {...form.register('maquina_id')}
          disabled={!setorId}
          className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px] disabled:opacity-50"
          data-testid="select-maquina-consumo"
        >
          <option value="">Selecione</option>
          {maquinasSetor.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Operador</label>
          <select
            {...form.register('operador_id')}
            className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
            data-testid="select-operador-consumo"
          >
            <option value="">Selecione</option>
            {operadores.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Turno</label>
          <select
            {...form.register('turno_id')}
            className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
            data-testid="select-turno-consumo"
          >
            <option value="">Selecione</option>
            {turnos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Liga</label>
        <select
          {...form.register('liga_id', {
            onChange: () => form.setValue('lote_id', ''),
          })}
          className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
          data-testid="select-liga-consumo"
        >
          <option value="">Selecione</option>
          {ligas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Lote do chumbo</label>
        <select
          {...form.register('lote_id')}
          disabled={!ligaIdForm || !setorId}
          className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px] disabled:opacity-50"
          data-testid="select-lote-consumo"
        >
          <option value="">Selecione</option>
          {lotesConsumo.map((l) => (
            <option key={l.id} value={l.id}>
              {l.numero_lote}
            </option>
          ))}
        </select>
        {ligaIdForm && setorId && lotesConsumo.length === 0 && (
          <span className="text-xs text-zinc-500">Nenhum lote com saldo neste setor.</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Barras consumidas</label>
          <input
            type="number"
            min={1}
            {...form.register('barras')}
            className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px] tabular-nums"
            data-testid="input-barras-consumo"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Borra (kg)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            {...form.register('borra_kg')}
            className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px] tabular-nums"
            data-testid="input-borra-consumo"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Observação</label>
        <textarea
          rows={2}
          maxLength={500}
          {...form.register('observacoes')}
          className="form-field px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] resize-none"
          data-testid="input-observacao-consumo"
        />
      </div>

      <button
        type="submit"
        disabled={salvar.isPending}
        className="apple-pressable w-full bg-apple-blue text-white font-medium px-4 py-3 rounded-ios-btn min-h-[44px] disabled:opacity-50"
        data-testid="btn-salvar-consumo"
      >
        {salvar.isPending ? 'Salvando...' : 'Registrar consumo'}
      </button>
    </form>
  )
}

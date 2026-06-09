'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { PackagePlus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { EntradaGradeEditor } from '@/components/features/entrada/entrada-grade-editor'
import { DataInputPtBr } from '@/components/ui/data-input-pt-br'
import { EntradaSomaGradePanel } from '@/components/features/entrada/entrada-soma-grade-panel'
import { modalBtnCancelClass, modalBtnPrimaryClass } from '@/components/ui/modal-ui-classes'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import { entradaClient } from '@/lib/entrada/entrada-client'
import {
  GRADE_ENTRADA_COLUNAS,
  GRADE_ENTRADA_LINHAS,
} from '@/lib/entrada/grade-entrada-constants'
import {
  filtrarCelulasPreenchidas,
  somarCelulasEntrada,
} from '@/lib/entrada/validar-grade-entrada'
import type { ChaveCorLiga } from '@/lib/types/chave-cor-liga'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { agoraLocal } from '@/lib/utils/date-time'
import {
  criarEntradaSchema,
  metaEntradaPasso1Schema,
  type CelulaEntradaInput,
} from '@/validations/entrada/entrada-schema'

type Props = {
  userId: string
  role: UsuarioRole
}

type Passo = 1 | 2

type FormMeta = {
  liga_id: string
  numero_lote: string
  data_chegada_ui: string
  data_chegada: string
}

export function EntradaView({ userId, role }: Props) {
  const ctx = { userId, role }
  const queryClient = useQueryClient()
  const [passo, setPasso] = useState<Passo>(1)
  const [celulas, setCelulas] = useState<Map<string, CelulaEntradaInput>>(new Map())
  const [loteCriadoId, setLoteCriadoId] = useState<string | null>(null)
  const { data: ligas = [], isLoading: carregandoLigas } = useQuery({
    queryKey: ['cadastros', 'ligas'],
    queryFn: async () => {
      const res = await cadastroClient.listarLigas(ctx)
      if (!res.success) throw new Error(res.message)
      return (res.data ?? []).filter((l) => l.is_active)
    },
  })

  const form = useForm<FormMeta>({
    defaultValues: {
      liga_id: '',
      numero_lote: '',
      data_chegada: '',
      data_chegada_ui: format(agoraLocal(), 'dd/MM/yyyy'),
    },
  })

  const ligaId = useWatch({ control: form.control, name: 'liga_id' })

  const ligaSelecionada = useMemo(
    () => ligas.find((l) => l.id === ligaId),
    [ligas, ligaId]
  )

  const celulasLista = useMemo(() => Array.from(celulas.values()), [celulas])
  const celulasPreenchidas = useMemo(
    () => filtrarCelulasPreenchidas(celulasLista),
    [celulasLista]
  )
  const somaOperacional = useMemo(
    () => somarCelulasEntrada(celulasPreenchidas),
    [celulasPreenchidas]
  )
  const irParaGrade = useCallback(async () => {
    const dataUi = form.getValues('data_chegada_ui')
    const parsed = metaEntradaPasso1Schema.safeParse({
      liga_id: form.getValues('liga_id'),
      numero_lote: form.getValues('numero_lote'),
      data_chegada: dataUi,
    })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      if (flat.liga_id) form.setError('liga_id', { message: flat.liga_id[0] })
      if (flat.numero_lote) form.setError('numero_lote', { message: flat.numero_lote[0] })
      if (flat.data_chegada) {
        form.setError('data_chegada_ui', { message: flat.data_chegada[0] })
      }
      toast.error('Revise data, liga e número do lote.')
      return
    }
    form.setValue('data_chegada', parsed.data.data_chegada)

    const nextCelulas = new Map<string, CelulaEntradaInput>()
    for (const c of celulasLista) {
      if (
        c.posicao_x < GRADE_ENTRADA_COLUNAS &&
        c.posicao_y < GRADE_ENTRADA_LINHAS
      ) {
        nextCelulas.set(`${c.posicao_x}-${c.posicao_y}`, c)
      }
    }
    setCelulas(nextCelulas)
    setPasso(2)
  }, [form, celulasLista])

  const criarMutation = useMutation({
    mutationFn: async () => {
      const meta = form.getValues()
      const payload = {
        liga_id: meta.liga_id,
        numero_lote: meta.numero_lote,
        data_chegada: meta.data_chegada,
        colunas_grade: GRADE_ENTRADA_COLUNAS,
        linhas_grade: GRADE_ENTRADA_LINHAS,
        celulas: celulasLista,
      }
      const parsed = criarEntradaSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      }
      return entradaClient.criar(ctx, parsed.data)
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      setLoteCriadoId(res.data?.lote.id ?? null)
      toast.success(res.message ?? 'Lote cadastrado!')
      queryClient.invalidateQueries({ queryKey: ['estoque'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const confirmarEntrada = useCallback(() => {
    if (celulasPreenchidas.length === 0) {
      toast.error('Preencha ao menos uma célula na grade.')
      return
    }
    criarMutation.mutate()
  }, [celulasPreenchidas.length, criarMutation])

  if (loteCriadoId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-ios-card bg-apple-green/10">
          <PackagePlus className="h-8 w-8 text-apple-green" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold">Lote cadastrado</h1>
        <p className="text-zinc-500">
          O material já aparece no estoque. Confira a grade na liga selecionada.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/estoque"
            className="apple-pressable bg-apple-blue text-white font-medium px-6 py-3 rounded-ios-btn min-h-[44px]"
            data-testid="btn-ir-estoque"
          >
            Ver no estoque
          </Link>
          <button
            type="button"
            onClick={() => {
              setLoteCriadoId(null)
              setPasso(1)
              setCelulas(new Map())
              form.reset({
                liga_id: '',
                numero_lote: '',
                data_chegada: '',
                data_chegada_ui: format(agoraLocal(), 'dd/MM/yyyy'),
              })
            }}
            className={`${modalBtnCancelClass} w-full px-6 py-3`}
          >
            Novo lote
          </button>
          <Link
            href="/"
            className="text-sm text-apple-blue font-medium min-h-[44px] flex items-center justify-center"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const larguraConteudo = passo === 2 ? 'max-w-6xl' : 'max-w-3xl'

  return (
    <div className={`flex flex-1 flex-col p-4 ${larguraConteudo} mx-auto w-full min-w-0 pb-8`}>
      <div className="flex flex-col gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Entrada de lote</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Passo {passo} de 2 —{' '}
            {passo === 1 ? 'Data, liga e lote' : 'Grade de montes'}
          </p>
        </div>
      </div>

      {passo === 1 && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void irParaGrade()
          }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Liga</label>
            <select
              {...form.register('liga_id')}
              className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
              disabled={carregandoLigas}
              data-testid="select-liga"
            >
              <option value="">Selecione a liga</option>
              {ligas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
            {form.formState.errors.liga_id && (
              <span className="text-[12px] text-apple-red">{form.formState.errors.liga_id.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Número do lote</label>
            <input
              {...form.register('numero_lote')}
              placeholder="Ex.: L-2026-01"
              className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]"
              data-testid="input-numero-lote"
            />
            {form.formState.errors.numero_lote && (
              <span className="text-[12px] text-apple-red">
                {form.formState.errors.numero_lote.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="data-chegada">
              Data de chegada
            </label>
            <Controller
              name="data_chegada_ui"
              control={form.control}
              render={({ field }) => (
                <DataInputPtBr
                  id="data-chegada"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  data-testid="input-data-chegada"
                  aria-invalid={Boolean(form.formState.errors.data_chegada_ui)}
                />
              )}
            />
            {form.formState.errors.data_chegada_ui && (
              <span className="text-[12px] text-apple-red">
                {form.formState.errors.data_chegada_ui.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="apple-pressable bg-apple-blue text-white font-medium px-6 py-3 rounded-ios-btn min-h-[44px] mt-2"
            data-testid="btn-passo-2"
          >
            Ir para a grade
          </button>
        </form>
      )}

      {passo === 2 && ligaSelecionada && (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="text-zinc-500">Liga:</span> {ligaSelecionada.nome}
            </span>
            <span>
              <span className="text-zinc-500">Lote:</span> {form.getValues('numero_lote')}
            </span>
            <span>
              <span className="text-zinc-500">Chegada:</span> {form.getValues('data_chegada_ui')}
            </span>
          </div>

          <EntradaGradeEditor
            colunas={GRADE_ENTRADA_COLUNAS}
            linhas={GRADE_ENTRADA_LINHAS}
            chaveCorLiga={ligaSelecionada.chave_cor as ChaveCorLiga}
            celulas={celulas}
            onCelulasChange={setCelulas}
          />

          <EntradaSomaGradePanel
            somaOperacional={somaOperacional}
            celulasPreenchidas={celulasPreenchidas.length}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPasso(1)}
              className={modalBtnCancelClass}
              data-testid="btn-voltar-entrada"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={criarMutation.isPending}
              onClick={confirmarEntrada}
              className={modalBtnPrimaryClass}
              data-testid="btn-confirmar-entrada"
            >
              {criarMutation.isPending ? 'Salvando...' : 'Confirmar entrada'}
            </button>
          </div>
        </div>
      )}

      {passo === 2 && !ligaSelecionada && (
        <p className="text-zinc-500 text-center py-8">Selecione uma liga no passo anterior.</p>
      )}
    </div>
  )
}

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import {
  POLARIDADE_LABELS,
  POLARIDADES_MODELO,
  type PolaridadeModelo,
} from '@/lib/types/polaridade-modelo'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { parseSortOrderInput } from '@/lib/utils/format-number'
import type { ModeloProduto } from '@/repositories/cadastro-repository'
import {
  criarModeloProdutoSchema,
  type CriarModeloProdutoInput,
} from '@/validations/cadastros/cadastro-schema'
import { CadastroPageHeader } from '@/components/features/cadastros/cadastro-page-header'

type Props = { userId: string; role: UsuarioRole }

export function ModelosPanel({ userId, role }: Props) {
  const ctx = { userId, role }
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<ModeloProduto | null>(null)

  const { data: modelos = [], isLoading } = useQuery({
    queryKey: ['cadastros', 'modelos'],
    queryFn: async () => {
      const res = await cadastroClient.listarModelosProduto(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const form = useForm<CriarModeloProdutoInput>({
    resolver: zodResolver(criarModeloProdutoSchema),
    defaultValues: {
      nome: '',
      polaridade: 'positiva',
      placas_por_grade: 4,
      sort_order: undefined,
    },
  })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['cadastros', 'modelos'] })

  const salvarMutation = useMutation({
    mutationFn: async (values: CriarModeloProdutoInput) => {
      if (editando) {
        return cadastroClient.atualizarModeloProduto(ctx, {
          id: editando.id,
          nome: values.nome,
          polaridade: values.polaridade,
          placas_por_grade: values.placas_por_grade,
          sort_order: values.sort_order,
          updated_at: editando.updated_at,
        })
      }
      return cadastroClient.criarModeloProduto(ctx, values)
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success(res.message ?? 'Salvo!')
      setModalAberto(false)
      setEditando(null)
      form.reset()
      invalidar()
    },
  })

  const excluirMutation = useMutation({
    mutationFn: (id: string) => cadastroClient.excluirModeloProduto(ctx, id),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message)
      else {
        toast.success(res.message)
        invalidar()
      }
    },
  })

  const reativar = useMutation({
    mutationFn: (modelo: ModeloProduto) =>
      cadastroClient.atualizarModeloProduto(ctx, {
        id: modelo.id,
        is_active: true,
        updated_at: modelo.updated_at,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Reativado!')
        invalidar()
      }
    },
  })

  const abrirNovo = useCallback(() => {
    setEditando(null)
    form.reset({
      nome: '',
      polaridade: 'positiva',
      placas_por_grade: 4,
      sort_order: undefined,
    })
    setModalAberto(true)
  }, [form])

  const abrirEditar = useCallback(
    (modelo: ModeloProduto) => {
      setEditando(modelo)
      form.reset({
        nome: modelo.nome,
        polaridade: modelo.polaridade as PolaridadeModelo,
        placas_por_grade: modelo.placas_por_grade,
        sort_order: modelo.sort_order,
      })
      setModalAberto(true)
    },
    [form]
  )

  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <CadastroPageHeader
        titulo="Modelos de grade"
        descricao="Saída da teleira — polaridade e placas por grade (MVP chumbo)"
      />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={abrirNovo}
          className="apple-pressable inline-flex items-center gap-2 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
          data-testid="btn-novo-modelo"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          Novo modelo
        </button>
      </div>

      {isLoading ? (
        <p className="text-zinc-500 text-center py-8">Carregando...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {modelos.map((modelo) => (
            <li
              key={modelo.id}
              className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card flex items-center justify-between gap-3 ${
                !modelo.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="min-w-0">
                <span className="font-medium block truncate">{modelo.nome}</span>
                <span className="text-xs text-zinc-500 block">
                  {POLARIDADE_LABELS[modelo.polaridade as PolaridadeModelo] ?? modelo.polaridade}
                  {' · '}
                  {modelo.placas_por_grade} placas/grade
                  {' · '}
                  ordem {modelo.sort_order}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {modelo.is_active ? (
                  <>
                    <button
                      type="button"
                      onClick={() => abrirEditar(modelo)}
                      className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      data-testid={`btn-editar-modelo-${modelo.id}`}
                    >
                      <Pencil className="h-5 w-5 text-apple-blue" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Desativar modelo "${modelo.nome}"?`)) {
                          excluirMutation.mutate(modelo.id)
                        }
                      }}
                      className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="h-5 w-5 text-apple-red" strokeWidth={1.5} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => reativar.mutate(modelo)}
                    className="text-sm text-apple-blue font-medium px-3 min-h-[44px]"
                  >
                    Reativar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 w-full sm:w-96 rounded-t-ios-modal sm:rounded-ios-card p-6 pb-safe">
            <h2 className="text-xl font-semibold mb-4">
              {editando ? 'Editar modelo' : 'Novo modelo de grade'}
            </h2>
            <form
              onSubmit={form.handleSubmit((v) => salvarMutation.mutate(v))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Nome</label>
                <input
                  {...form.register('nome')}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]"
                  data-testid="input-modelo-nome"
                />
                {form.formState.errors.nome && (
                  <span className="text-[12px] text-apple-red">
                    {form.formState.errors.nome.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Polaridade</label>
                <select
                  {...form.register('polaridade')}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
                  data-testid="select-modelo-polaridade"
                >
                  {POLARIDADES_MODELO.map((p) => (
                    <option key={p} value={p}>
                      {POLARIDADE_LABELS[p]}
                    </option>
                  ))}
                </select>
                {form.formState.errors.polaridade && (
                  <span className="text-[12px] text-apple-red">
                    {form.formState.errors.polaridade.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Placas por grade</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  {...form.register('placas_por_grade', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]"
                  data-testid="input-modelo-placas"
                />
                {form.formState.errors.placas_por_grade && (
                  <span className="text-[12px] text-apple-red">
                    {form.formState.errors.placas_por_grade.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Ordem (opcional)</label>
                <input
                  type="number"
                  min={0}
                  {...form.register('sort_order', { setValueAs: parseSortOrderInput })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]"
                  placeholder="Automática se vazio"
                  data-testid="input-modelo-ordem"
                />
              </div>

              <div className="flex gap-2 modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false)
                    setEditando(null)
                  }}
                  className="flex-1 bg-zinc-100 font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvarMutation.isPending}
                  className="flex-1 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
                  data-testid="btn-salvar-modelo"
                >
                  {salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

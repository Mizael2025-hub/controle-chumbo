'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import {
  CHAVE_COR_CLASSES,
  CHAVE_COR_LABELS,
  CHAVES_COR_LIGA,
  type ChaveCorLiga,
} from '@/lib/types/chave-cor-liga'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { Liga } from '@/repositories/cadastro-repository'
import { criarLigaSchema, type CriarLigaInput } from '@/validations/cadastros/cadastro-schema'
import { CadastroPageHeader } from '@/components/features/cadastros/cadastro-page-header'

type Props = { userId: string; role: UsuarioRole }

export function LigasPanel({ userId, role }: Props) {
  const ctx = { userId, role }
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Liga | null>(null)

  const { data: ligas = [], isLoading } = useQuery({
    queryKey: ['cadastros', 'ligas'],
    queryFn: async () => {
      const res = await cadastroClient.listarLigas(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const form = useForm<CriarLigaInput>({
    resolver: zodResolver(criarLigaSchema),
    defaultValues: { nome: '', chave_cor: 'cinza' },
  })

  const chaveCor = useWatch({ control: form.control, name: 'chave_cor' })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['cadastros', 'ligas'] })

  const salvarMutation = useMutation({
    mutationFn: async (values: CriarLigaInput) => {
      if (editando) {
        return cadastroClient.atualizarLiga(ctx, {
          id: editando.id,
          nome: values.nome,
          chave_cor: values.chave_cor,
          updated_at: editando.updated_at,
        })
      }
      return cadastroClient.criarLiga(ctx, values)
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
    mutationFn: (id: string) => cadastroClient.excluirLiga(ctx, id),
    onSuccess: (res) => {
      if (!res.success) toast.error(res.message)
      else {
        toast.success(res.message)
        invalidar()
      }
    },
  })

  const reativar = useMutation({
    mutationFn: (liga: Liga) =>
      cadastroClient.atualizarLiga(ctx, {
        id: liga.id,
        is_active: true,
        updated_at: liga.updated_at,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Reativada!')
        invalidar()
      }
    },
  })

  const abrirNovo = useCallback(() => {
    setEditando(null)
    form.reset({ nome: '', chave_cor: 'cinza' })
    setModalAberto(true)
  }, [form])

  const abrirEditar = useCallback(
    (liga: Liga) => {
      setEditando(liga)
      form.reset({ nome: liga.nome, chave_cor: liga.chave_cor as ChaveCorLiga })
      setModalAberto(true)
    },
    [form]
  )

  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <CadastroPageHeader
        titulo="Ligas"
        descricao="Tipos de liga de chumbo e cores na grade"
      />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={abrirNovo}
          className="apple-pressable inline-flex items-center gap-2 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
          data-testid="btn-nova-liga"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          Nova liga
        </button>
      </div>

      {isLoading ? (
        <p className="text-zinc-500 text-center py-8">Carregando...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ligas.map((liga) => (
            <li
              key={liga.id}
              className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card flex items-center justify-between gap-3 ${
                !liga.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-8 w-8 rounded-full shrink-0 ${CHAVE_COR_CLASSES[liga.chave_cor as ChaveCorLiga] ?? 'bg-zinc-300'}`}
                  aria-hidden
                />
                <div className="min-w-0">
                  <span className="font-medium block truncate">{liga.nome}</span>
                  <span className="text-xs text-zinc-500">
                    {CHAVE_COR_LABELS[liga.chave_cor as ChaveCorLiga] ?? liga.chave_cor}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {liga.is_active ? (
                  <>
                    <button
                      type="button"
                      onClick={() => abrirEditar(liga)}
                      className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Pencil className="h-5 w-5 text-apple-blue" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Desativar liga "${liga.nome}"?`)) {
                          excluirMutation.mutate(liga.id)
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
                    onClick={() => reativar.mutate(liga)}
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
              {editando ? 'Editar liga' : 'Nova liga'}
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
                  data-testid="input-liga-nome"
                />
                {form.formState.errors.nome && (
                  <span className="text-[12px] text-apple-red">
                    {form.formState.errors.nome.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Cor na grade</label>
                <div className="grid grid-cols-4 gap-2">
                  {CHAVES_COR_LIGA.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => form.setValue('chave_cor', cor)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-ios-btn border-2 min-h-[44px] ${
                        chaveCor === cor ? 'border-apple-blue' : 'border-transparent'
                      }`}
                      data-testid={`cor-${cor}`}
                    >
                      <span className={`h-6 w-6 rounded-full ${CHAVE_COR_CLASSES[cor]}`} />
                      <span className="text-[10px] text-zinc-500">{CHAVE_COR_LABELS[cor]}</span>
                    </button>
                  ))}
                </div>
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
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

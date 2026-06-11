'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import { SETOR_TIPO_LABELS, SETOR_TIPOS, type SetorTipo } from '@/lib/types/setor-tipo'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { Setor } from '@/repositories/cadastro-repository'
import {
  criarSetorFormSchema,
  type CriarSetorFormInput,
} from '@/validations/cadastros/cadastro-schema'
import { CadastroPageHeader } from '@/components/features/cadastros/cadastro-page-header'
import { ModalOverlay } from '@/components/ui/modal-overlay'
import { normalizeSortOrderInput, parseSortOrderInput } from '@/lib/utils/format-number'

type Props = { userId: string; role: UsuarioRole }

export function SetoresPanel({ userId, role }: Props) {
  const ctx = { userId, role }
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Setor | null>(null)

  const { data: setores = [], isLoading } = useQuery({
    queryKey: ['cadastros', 'setores'],
    queryFn: async () => {
      const res = await cadastroClient.listarSetores(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const form = useForm<CriarSetorFormInput>({
    resolver: zodResolver(criarSetorFormSchema),
    defaultValues: { nome: '', tipo: 'producao', sort_order: undefined },
  })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['cadastros', 'setores'] })

  const salvarMutation = useMutation({
    mutationFn: async (values: CriarSetorFormInput) => {
      const sortOrder = normalizeSortOrderInput(values.sort_order)
      if (editando) {
        return cadastroClient.atualizarSetor(ctx, {
          id: editando.id,
          nome: values.nome,
          tipo: values.tipo,
          ...(sortOrder !== undefined ? { sort_order: sortOrder } : {}),
          updated_at: editando.updated_at,
        })
      }
      const dadosSetor = { ...values }
      delete dadosSetor.sort_order
      return cadastroClient.criarSetor(ctx, {
        ...dadosSetor,
        ...(sortOrder !== undefined ? { sort_order: sortOrder } : {}),
      })
    },
    onSuccess: (res) => {
      if (!res.success) {
        const primeiroErro = res.errors
          ? Object.values(res.errors).flat()[0]
          : undefined
        toast.error(primeiroErro ?? res.message)
        return
      }
      toast.success(res.message ?? 'Salvo!')
      setModalAberto(false)
      setEditando(null)
      form.reset()
      invalidar()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar setor.')
    },
  })

  const excluirMutation = useMutation({
    mutationFn: (id: string) => cadastroClient.excluirSetor(ctx, id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        invalidar()
      } else toast.error(res.message)
    },
  })

  const reativar = useMutation({
    mutationFn: async (setor: Setor) => {
      const res = await cadastroClient.atualizarSetor(ctx, {
        id: setor.id,
        is_active: true,
        updated_at: setor.updated_at,
      })
      if (!res.success) {
        throw new Error(res.message)
      }
      return res
    },
    onSuccess: () => {
      toast.success('Reativado!')
      invalidar()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao reativar setor.')
    },
  })

  const abrirNovo = useCallback(() => {
    setEditando(null)
    form.reset({ nome: '', tipo: 'producao' })
    setModalAberto(true)
  }, [form])

  const abrirEditar = useCallback(
    (setor: Setor) => {
      setEditando(setor)
      form.reset({
        nome: setor.nome,
        tipo: setor.tipo as SetorTipo,
        sort_order: setor.sort_order,
      })
      setModalAberto(true)
    },
    [form]
  )

  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <CadastroPageHeader titulo="Setores" descricao="Setores da fábrica e tipos de produção" />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={abrirNovo}
          className="apple-pressable inline-flex items-center gap-2 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          Novo setor
        </button>
      </div>

      {isLoading ? (
        <p className="text-zinc-500 text-center py-8">Carregando...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {setores.map((setor) => (
            <li
              key={setor.id}
              className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card flex items-center justify-between gap-3 ${
                !setor.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="min-w-0">
                <span className="font-medium block truncate">{setor.nome}</span>
                <span className="text-xs text-zinc-500">
                  {setor.slug} · {SETOR_TIPO_LABELS[setor.tipo as SetorTipo] ?? setor.tipo} · Ordem{' '}
                  {setor.sort_order}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {setor.is_active ? (
                  <>
                    <button
                      type="button"
                      onClick={() => abrirEditar(setor)}
                      className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Pencil className="h-5 w-5 text-apple-blue" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Desativar setor "${setor.nome}"?`)) {
                          excluirMutation.mutate(setor.id)
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
                    onClick={() => reativar.mutate(setor)}
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

      <ModalOverlay aberto={modalAberto}>
          <div className="modal-card max-h-[min(90dvh,calc(100dvh-var(--dock-reserva)-2rem))] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editando ? 'Editar setor' : 'Novo setor'}
            </h2>
            <form
              onSubmit={form.handleSubmit((v) => salvarMutation.mutate(v))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Nome</label>
                <input {...form.register('nome')} className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]" />
                {form.formState.errors.nome && (
                  <span className="text-[12px] text-apple-red">
                    {form.formState.errors.nome.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Tipo</label>
                <select
                  {...form.register('tipo')}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
                >
                  {SETOR_TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {SETOR_TIPO_LABELS[t]}
                    </option>
                  ))}
                </select>
                {form.formState.errors.tipo && (
                  <span className="text-[12px] text-apple-red">
                    {form.formState.errors.tipo.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Ordem (opcional)</label>
                <input
                  type="number"
                  {...form.register('sort_order', { setValueAs: parseSortOrderInput })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]"
                />
                {form.formState.errors.sort_order && (
                  <span className="text-[12px] text-apple-red">
                    {form.formState.errors.sort_order.message}
                  </span>
                )}
              </div>
              <div className="flex gap-2 modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false)
                    setEditando(null)
                  }}
                  className="btn-modal-cancel"
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
      </ModalOverlay>
    </div>
  )
}

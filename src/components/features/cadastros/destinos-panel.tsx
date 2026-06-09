'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { DestinoSaida } from '@/repositories/cadastro-repository'
import {
  criarDestinoFormSchema,
  type CriarDestinoFormInput,
} from '@/validations/cadastros/cadastro-schema'
import { CadastroPageHeader } from '@/components/features/cadastros/cadastro-page-header'
import { ModalOverlay } from '@/components/ui/modal-overlay'

type Props = { userId: string; role: UsuarioRole }

export function DestinosPanel({ userId, role }: Props) {
  const ctx = { userId, role }
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<DestinoSaida | null>(null)

  const { data: destinos = [], isLoading } = useQuery({
    queryKey: ['cadastros', 'destinos'],
    queryFn: async () => {
      const res = await cadastroClient.listarDestinos(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const form = useForm<CriarDestinoFormInput>({
    resolver: zodResolver(criarDestinoFormSchema),
    defaultValues: { nome: '', sort_order: undefined },
  })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['cadastros', 'destinos'] })

  const salvarMutation = useMutation({
    mutationFn: async (values: CriarDestinoFormInput) => {
      if (editando) {
        return cadastroClient.atualizarDestino(ctx, {
          id: editando.id,
          nome: values.nome,
          sort_order: values.sort_order,
          updated_at: editando.updated_at,
        })
      }
      return cadastroClient.criarDestino(ctx, values)
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
    mutationFn: (id: string) => cadastroClient.excluirDestino(ctx, id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        invalidar()
      } else toast.error(res.message)
    },
  })

  const reativar = useMutation({
    mutationFn: (destino: DestinoSaida) =>
      cadastroClient.atualizarDestino(ctx, {
        id: destino.id,
        is_active: true,
        updated_at: destino.updated_at,
      }),
    onSuccess: () => {
      toast.success('Reativado!')
      invalidar()
    },
  })

  const abrirNovo = useCallback(() => {
    setEditando(null)
    form.reset({ nome: '' })
    setModalAberto(true)
  }, [form])

  const abrirEditar = useCallback(
    (destino: DestinoSaida) => {
      setEditando(destino)
      form.reset({
        nome: destino.nome,
        sort_order: destino.sort_order,
      })
      setModalAberto(true)
    },
    [form]
  )

  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <CadastroPageHeader
        titulo="Destinos de saída"
        descricao="Destinos para liberação e baixa de montes"
      />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={abrirNovo}
          className="apple-pressable inline-flex items-center gap-2 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          Novo destino
        </button>
      </div>

      {isLoading ? (
        <p className="text-zinc-500 text-center py-8">Carregando...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {destinos.map((destino) => (
            <li
              key={destino.id}
              className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card flex items-center justify-between gap-3 ${
                !destino.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="min-w-0">
                <span className="font-medium block truncate">{destino.nome}</span>
                <span className="text-xs text-zinc-500">
                  {destino.slug} · Ordem {destino.sort_order}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {destino.is_active ? (
                  <>
                    <button
                      type="button"
                      onClick={() => abrirEditar(destino)}
                      className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Pencil className="h-5 w-5 text-apple-blue" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Desativar destino "${destino.nome}"?`)) {
                          excluirMutation.mutate(destino.id)
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
                    onClick={() => reativar.mutate(destino)}
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
          <div className="modal-card">
            <h2 className="text-xl font-semibold mb-4">
              {editando ? 'Editar destino' : 'Novo destino'}
            </h2>
            <form
              onSubmit={form.handleSubmit((v) => salvarMutation.mutate(v))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Nome</label>
                <input {...form.register('nome')} className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px]" />
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

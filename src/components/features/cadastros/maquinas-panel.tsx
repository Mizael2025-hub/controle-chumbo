'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { Maquina } from '@/repositories/cadastro-repository'
import {
  criarMaquinaSchema,
  type CriarMaquinaInput,
} from '@/validations/cadastros/cadastro-schema'
import { CadastroPageHeader } from '@/components/features/cadastros/cadastro-page-header'
import { ModalOverlay } from '@/components/ui/modal-overlay'

type Props = { userId: string; role: UsuarioRole }

export function MaquinasPanel({ userId, role }: Props) {
  const ctx = { userId, role }
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Maquina | null>(null)

  const { data: maquinas = [], isLoading } = useQuery({
    queryKey: ['cadastros', 'maquinas'],
    queryFn: async () => {
      const res = await cadastroClient.listarMaquinas(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const { data: setores = [] } = useQuery({
    queryKey: ['cadastros', 'setores'],
    queryFn: async () => {
      const res = await cadastroClient.listarSetores(ctx)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  /** Só ativos no select; cache compartilhado com setores-panel traz inativos também. */
  const setoresAtivos = useMemo(() => setores.filter((s) => s.is_active), [setores])

  const setorMap = new Map(setores.map((s) => [s.id, s.nome]))

  const form = useForm<CriarMaquinaInput>({
    resolver: zodResolver(criarMaquinaSchema),
    defaultValues: { nome: '', setor_id: '', sort_order: undefined },
  })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['cadastros', 'maquinas'] })

  const salvarMutation = useMutation({
    mutationFn: async (values: CriarMaquinaInput) => {
      if (editando) {
        return cadastroClient.atualizarMaquina(ctx, {
          id: editando.id,
          setor_id: values.setor_id,
          nome: values.nome,
          sort_order: values.sort_order,
          updated_at: editando.updated_at,
        })
      }
      return cadastroClient.criarMaquina(ctx, values)
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
    mutationFn: (id: string) => cadastroClient.excluirMaquina(ctx, id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        invalidar()
      } else toast.error(res.message)
    },
  })

  const reativar = useMutation({
    mutationFn: (maquina: Maquina) =>
      cadastroClient.atualizarMaquina(ctx, {
        id: maquina.id,
        is_active: true,
        updated_at: maquina.updated_at,
      }),
    onSuccess: () => {
      toast.success('Reativada!')
      invalidar()
    },
  })

  const abrirNovo = useCallback(() => {
    setEditando(null)
    form.reset({
      nome: '',
      setor_id: setoresAtivos[0]?.id ?? '',
      sort_order: undefined,
    })
    setModalAberto(true)
  }, [form, setoresAtivos])

  const abrirEditar = useCallback(
    (maquina: Maquina) => {
      setEditando(maquina)
      form.reset({
        nome: maquina.nome,
        setor_id: maquina.setor_id,
        sort_order: maquina.sort_order,
      })
      setModalAberto(true)
    },
    [form]
  )

  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <CadastroPageHeader
        titulo="Máquinas"
        descricao="Máquinas vinculadas aos setores"
      />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={abrirNovo}
          disabled={setoresAtivos.length === 0}
          className="apple-pressable inline-flex items-center gap-2 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px] disabled:opacity-50"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          Nova máquina
        </button>
      </div>

      {setoresAtivos.length === 0 && (
        <p className="text-amber-600 text-sm mb-4">
          Cadastre ao menos um setor ativo antes de adicionar máquinas.
        </p>
      )}

      {isLoading ? (
        <p className="text-zinc-500 text-center py-8">Carregando...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {maquinas.map((maquina) => (
            <li
              key={maquina.id}
              className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card flex items-center justify-between gap-3 ${
                !maquina.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="min-w-0">
                <span className="font-medium block truncate">{maquina.nome}</span>
                <span className="text-xs text-zinc-500">
                  {setorMap.get(maquina.setor_id) ?? 'Setor desconhecido'} · Ordem{' '}
                  {maquina.sort_order}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {maquina.is_active ? (
                  <>
                    <button
                      type="button"
                      onClick={() => abrirEditar(maquina)}
                      className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Pencil className="h-5 w-5 text-apple-blue" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Desativar máquina "${maquina.nome}"?`)) {
                          excluirMutation.mutate(maquina.id)
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
                    onClick={() => reativar.mutate(maquina)}
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
              {editando ? 'Editar máquina' : 'Nova máquina'}
            </h2>
            <form
              onSubmit={form.handleSubmit((v) => salvarMutation.mutate(v))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Setor</label>
                <select
                  {...form.register('setor_id')}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn text-[16px] min-h-[44px]"
                >
                  {setoresAtivos.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome}
                    </option>
                  ))}
                </select>
              </div>
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

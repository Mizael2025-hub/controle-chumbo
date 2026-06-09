'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cadastroClient } from '@/lib/cadastros/cadastro-client'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import type { ActionResponse } from '@/lib/types/action-response'
import type { CadastroBase } from '@/repositories/cadastro-repository'
import {
  criarCadastroSimplesSchema,
  type CriarCadastroSimplesInput,
} from '@/validations/cadastros/cadastro-schema'
import { CadastroPageHeader } from '@/components/features/cadastros/cadastro-page-header'
import { ModalOverlay } from '@/components/ui/modal-overlay'
import { parseSortOrderInput } from '@/lib/utils/format-number'

type ContextoClient = { userId: string; role: UsuarioRole }

type CadastroSimplesPanelProps = {
  titulo: string
  descricao: string
  entidadeLabel: string
  queryKey: string
  ctx: ContextoClient
  listar: (ctx: ContextoClient) => Promise<ActionResponse<CadastroBase[]>>
  criar: (ctx: ContextoClient, input: CriarCadastroSimplesInput) => Promise<ActionResponse<CadastroBase>>
  atualizar: (
    ctx: ContextoClient,
    input: { id: string; nome?: string; sort_order?: number; is_active?: boolean; updated_at: string }
  ) => Promise<ActionResponse<CadastroBase>>
  excluir: (ctx: ContextoClient, id: string) => Promise<ActionResponse>
}

export function CadastroSimplesPanel({
  titulo,
  descricao,
  entidadeLabel,
  queryKey,
  ctx,
  listar,
  criar,
  atualizar,
  excluir,
}: CadastroSimplesPanelProps) {
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<CadastroBase | null>(null)

  const { data: registros = [], isLoading, isError, error } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await listar(ctx)
      if (!res.success) throw new Error(res.message ?? 'Erro ao carregar')
      return res.data ?? []
    },
  })

  const form = useForm<CriarCadastroSimplesInput>({
    resolver: zodResolver(criarCadastroSimplesSchema),
    defaultValues: { nome: '', sort_order: undefined },
  })

  const abrirNovo = useCallback(() => {
    setEditando(null)
    form.reset({ nome: '', sort_order: undefined })
    setModalAberto(true)
  }, [form])

  const abrirEditar = useCallback(
    (item: CadastroBase) => {
      setEditando(item)
      form.reset({ nome: item.nome, sort_order: item.sort_order })
      setModalAberto(true)
    },
    [form]
  )

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setEditando(null)
    form.reset()
  }, [form])

  const invalidar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [queryKey] })
  }, [queryClient, queryKey])

  const salvarMutation = useMutation({
    mutationFn: async (values: CriarCadastroSimplesInput) => {
      if (editando) {
        return atualizar(ctx, {
          id: editando.id,
          nome: values.nome,
          sort_order: values.sort_order,
          updated_at: editando.updated_at,
        })
      }
      return criar(ctx, values)
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message ?? 'Erro ao salvar')
        return
      }
      toast.success(res.message ?? 'Salvo com sucesso!')
      fecharModal()
      invalidar()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const excluirMutation = useMutation({
    mutationFn: (id: string) => excluir(ctx, id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message ?? 'Erro ao desativar')
        return
      }
      toast.success(res.message ?? 'Desativado com sucesso!')
      invalidar()
    },
  })

  const reativarMutation = useMutation({
    mutationFn: (item: CadastroBase) =>
      atualizar(ctx, { id: item.id, is_active: true, updated_at: item.updated_at }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message ?? 'Erro ao reativar')
        return
      }
      toast.success('Reativado com sucesso!')
      invalidar()
    },
  })

  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <CadastroPageHeader titulo={titulo} descricao={descricao} />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={abrirNovo}
          className="apple-pressable inline-flex items-center gap-2 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px]"
          data-testid="btn-novo-cadastro"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          Novo
        </button>
      </div>

      {isLoading ? (
        <p className="text-zinc-500 text-center py-8">Carregando...</p>
      ) : isError ? (
        <p className="text-apple-red text-center py-8">
          Erro ao carregar: {error instanceof Error ? error.message : 'desconhecido'}
        </p>
      ) : registros.length === 0 ? (
        <p className="text-zinc-500 text-center py-8">Nenhum registro cadastrado.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {registros.map((item) => (
            <li
              key={item.id}
              className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card flex items-center justify-between gap-3 ${
                !item.is_active ? 'opacity-60' : ''
              }`}
              data-testid={`cadastro-item-${item.id}`}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium truncate">{item.nome}</span>
                <span className="text-xs text-zinc-500">Ordem: {item.sort_order}</span>
                {!item.is_active && (
                  <span className="text-xs text-apple-red">Inativo</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {item.is_active ? (
                  <>
                    <button
                      type="button"
                      onClick={() => abrirEditar(item)}
                      className="apple-pressable p-2 rounded-ios-btn min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={`Editar ${item.nome}`}
                      data-testid={`btn-editar-${item.id}`}
                    >
                      <Pencil className="h-5 w-5 text-apple-blue" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Desativar ${entidadeLabel} "${item.nome}"?`)) {
                          excluirMutation.mutate(item.id)
                        }
                      }}
                      className="apple-pressable p-2 rounded-ios-btn min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={`Desativar ${item.nome}`}
                      data-testid={`btn-excluir-${item.id}`}
                    >
                      <Trash2 className="h-5 w-5 text-apple-red" strokeWidth={1.5} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => reativarMutation.mutate(item)}
                    className="apple-pressable text-sm text-apple-blue font-medium px-3 py-2 min-h-[44px]"
                    data-testid={`btn-reativar-${item.id}`}
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
          <div className="modal-card animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-4 sm:hidden" />
            <h2 className="text-xl font-semibold mb-4">
              {editando ? `Editar ${entidadeLabel}` : `Novo ${entidadeLabel}`}
            </h2>
            <form
              onSubmit={form.handleSubmit((values) => salvarMutation.mutate(values))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nome
                </label>
                <input
                  {...form.register('nome')}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-ios-btn focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[16px] bg-transparent"
                  data-testid="input-nome"
                />
                {form.formState.errors.nome && (
                  <span className="text-[12px] text-apple-red">
                    {form.formState.errors.nome.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ordem (opcional)
                </label>
                <input
                  type="number"
                  {...form.register('sort_order', { setValueAs: parseSortOrderInput })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-ios-btn focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[16px] tabular-nums bg-transparent"
                  data-testid="input-sort-order"
                />
              </div>
              <div className="flex gap-2 pt-2 modal-actions">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="btn-modal-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvarMutation.isPending}
                  className="apple-pressable flex-1 bg-apple-blue text-white font-medium px-4 py-2 rounded-ios-btn min-h-[44px] disabled:opacity-50"
                  data-testid="btn-salvar-cadastro"
                >
                  {salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
    </div>
  )
}

/** Atalho para cadastros simples via cadastroClient (modo local). */
export function CadastroSimplesLocalPanel(props: Omit<CadastroSimplesPanelProps, 'listar' | 'criar' | 'atualizar' | 'excluir'> & {
  tipo: 'operadores' | 'turnos'
}) {
  const handlers = {
    operadores: {
      listar: cadastroClient.listarOperadores,
      criar: cadastroClient.criarOperador,
      atualizar: cadastroClient.atualizarOperador,
      excluir: cadastroClient.excluirOperador,
    },
    turnos: {
      listar: cadastroClient.listarTurnos,
      criar: cadastroClient.criarTurno,
      atualizar: cadastroClient.atualizarTurno,
      excluir: cadastroClient.excluirTurno,
    },
  }[props.tipo]

  return (
    <CadastroSimplesPanel
      {...props}
      listar={handlers.listar}
      criar={handlers.criar}
      atualizar={handlers.atualizar}
      excluir={handlers.excluir}
    />
  )
}

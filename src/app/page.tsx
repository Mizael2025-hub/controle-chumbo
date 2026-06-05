import Link from 'next/link'
import {
  ClipboardList,
  FileBarChart,
  Flame,
  Package,
  PackagePlus,
  Settings,
  User,
} from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { getDataSource } from '@/lib/data-source'
import { formatarDataHora, getAppTimezone } from '@/lib/utils/date-time'
import { MockUserSwitcher } from '@/components/features/auth/mock-user-switcher'

export default async function HomePage() {
  const usuario = await getAuthenticatedUser()
  const role = await getUserRole()
  const dataSource = getDataSource()
  const agora = formatarDataHora(new Date())

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <main className="w-full max-w-[720px] flex flex-col items-center gap-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-ios-card bg-apple-blue/10">
          <Package className="h-10 w-10 text-apple-blue" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Controle de Chumbo
          </h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto">
            Espelho do estoque em grade 2D por liga e lote.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-ios-card shadow-sm w-full text-left space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-apple-blue" strokeWidth={1.5} />
            Status da infra
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-zinc-500">Usuário</dt>
              <dd className="font-medium" data-testid="infra-usuario">
                {usuario.nome}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">E-mail</dt>
              <dd className="font-medium">{usuario.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Perfil (role)</dt>
              <dd className="font-medium capitalize" data-testid="infra-role">
                {role ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">DATA_SOURCE</dt>
              <dd className="font-medium" data-testid="infra-data-source">
                {dataSource}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Data/hora ({getAppTimezone()})</dt>
              <dd className="font-medium tabular-nums" data-testid="infra-data-hora">
                {agora}
              </dd>
            </div>
          </dl>

          {dataSource === 'local' && (
            <MockUserSwitcher usuarioAtualId={usuario.id} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          {(role === 'admin' || role === 'operador') && (
            <>
              <Link
                href="/estoque"
                className="apple-pressable inline-flex items-center justify-center gap-2 bg-apple-blue text-white font-medium px-6 py-3 rounded-ios-btn min-h-[44px] flex-1"
                data-testid="btn-estoque"
              >
                <Package className="h-5 w-5" strokeWidth={1.5} />
                Estoque
              </Link>
              <Link
                href="/estoque/contagem"
                className="apple-pressable inline-flex items-center justify-center gap-2 bg-violet-600 text-white font-medium px-6 py-3 rounded-ios-btn min-h-[44px] flex-1"
                data-testid="btn-contagem-operador"
              >
                <ClipboardList className="h-5 w-5" strokeWidth={1.5} />
                Contagem
              </Link>
              <Link
                href="/consumo"
                className="apple-pressable inline-flex items-center justify-center gap-2 bg-amber-600 text-white font-medium px-6 py-3 rounded-ios-btn min-h-[44px] flex-1"
                data-testid="btn-consumo"
              >
                <Flame className="h-5 w-5" strokeWidth={1.5} />
                Consumo
              </Link>
              <Link
                href="/relatorios"
                className="apple-pressable inline-flex items-center justify-center gap-2 bg-slate-700 text-white font-medium px-6 py-3 rounded-ios-btn min-h-[44px] flex-1"
                data-testid="btn-relatorios"
              >
                <FileBarChart className="h-5 w-5" strokeWidth={1.5} />
                Relatórios
              </Link>
            </>
          )}
          {role === 'admin' && (
            <>
              <Link
                href="/entrada"
                className="apple-pressable inline-flex items-center justify-center gap-2 bg-apple-green text-white font-medium px-6 py-3 rounded-ios-btn min-h-[44px] flex-1"
                data-testid="btn-entrada"
              >
                <PackagePlus className="h-5 w-5" strokeWidth={1.5} />
                Entrada
              </Link>
              <Link
                href="/configuracoes/cadastros"
                className="apple-pressable inline-flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-800 text-foreground font-medium px-6 py-3 rounded-ios-btn min-h-[44px] flex-1"
                data-testid="btn-cadastros"
              >
                <Settings className="h-5 w-5" strokeWidth={1.5} />
                Cadastros
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

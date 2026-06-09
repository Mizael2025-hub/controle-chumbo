import { Package, User } from 'lucide-react'
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
    <div className="flex min-h-0 flex-col items-center p-6 max-lg:justify-start max-lg:pt-4 lg:min-h-full lg:justify-center">
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

        <div className="mobile-page-card p-6 rounded-ios-card shadow-sm w-full text-left space-y-4">
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

        {(role === 'admin' || role === 'operador') && (
          <p className="text-sm text-zinc-500 max-w-md">
            Use a barra lateral (desktop) ou o menu inferior (celular) para navegar entre os módulos.
          </p>
        )}
      </main>
    </div>
  )
}

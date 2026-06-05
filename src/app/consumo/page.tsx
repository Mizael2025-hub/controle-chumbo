import Link from 'next/link'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { ConsumoForm } from '@/components/features/consumo/consumo-form'
import { InicioLink } from '@/components/layout/inicio-link'

export default async function ConsumoPage() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()

  if (role !== 'admin' && role !== 'operador') {
    return (
      <div className="p-6 text-center">
        <p className="text-zinc-500">Acesso restrito a operadores e administradores.</p>
        <Link href="/" className="text-apple-blue mt-4 inline-block">
          Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-2 mb-4">
        <InicioLink />
        <div>
          <h1 className="text-2xl font-semibold">Consumo de chumbo</h1>
          <p className="text-zinc-500 text-sm mt-1">Apontamento no setor de produção</p>
        </div>
      </div>
      <ConsumoForm ctx={{ userId: user.id, role }} />
    </div>
  )
}

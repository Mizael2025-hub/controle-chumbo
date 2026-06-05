import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AcessoNegadoEntrada } from '@/components/features/entrada/acesso-negado-entrada'
import { EntradaView } from '@/components/features/entrada/entrada-view'

export default async function EntradaPage() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()

  if (role !== 'admin') {
    return <AcessoNegadoEntrada role={role} />
  }

  return <EntradaView userId={user.id} role={role} />
}

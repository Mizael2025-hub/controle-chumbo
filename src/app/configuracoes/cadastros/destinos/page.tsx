import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AcessoNegadoCadastros } from '@/components/features/cadastros/acesso-negado-cadastros'
import { DestinosPanel } from '@/components/features/cadastros/destinos-panel'

export default async function DestinosPage() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()

  if (role !== 'admin') {
    return <AcessoNegadoCadastros role={role} />
  }

  return <DestinosPanel userId={user.id} role={role} />
}

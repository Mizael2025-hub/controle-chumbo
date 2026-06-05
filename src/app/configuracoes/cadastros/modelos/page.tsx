import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AcessoNegadoCadastros } from '@/components/features/cadastros/acesso-negado-cadastros'
import { ModelosPanel } from '@/components/features/cadastros/modelos-panel'

export default async function ModelosPage() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()

  if (role !== 'admin') {
    return <AcessoNegadoCadastros role={role} />
  }

  return <ModelosPanel userId={user.id} role={role} />
}

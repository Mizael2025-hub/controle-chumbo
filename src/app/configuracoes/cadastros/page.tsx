import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AcessoNegadoCadastros } from '@/components/features/cadastros/acesso-negado-cadastros'
import { CadastrosHub } from '@/components/features/cadastros/cadastros-hub'

export default async function CadastrosPage() {
  await getAuthenticatedUser()
  const role = await getUserRole()

  if (role !== 'admin') {
    return <AcessoNegadoCadastros role={role} />
  }

  return <CadastrosHub />
}

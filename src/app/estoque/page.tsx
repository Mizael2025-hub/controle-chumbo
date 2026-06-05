import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { EstoqueView } from '@/components/features/estoque/estoque-view'

export default async function EstoquePage() {
  const usuario = await getAuthenticatedUser()
  const role = await getUserRole()

  if (!role || (role !== 'admin' && role !== 'operador')) {
    redirect('/')
  }

  return <EstoqueView userId={usuario.id} role={role} />
}

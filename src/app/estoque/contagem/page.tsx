import { redirect } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { ContagemEstoqueView } from '@/components/features/contagem-estoque/contagem-estoque-view'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'

export default async function ContagemEstoquePage() {
  const usuario = await getAuthenticatedUser()
  const role = await getUserRole()

  if (!role || (role !== 'admin' && role !== 'operador')) {
    redirect('/')
  }

  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-violet-600" strokeWidth={1.5} />
            Contagem de estoque
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Auditoria física diária — rascunho local</p>
        </div>
      </div>
      <ContagemEstoqueView userId={usuario.id} role={role} />
    </div>
  )
}

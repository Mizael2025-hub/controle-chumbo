import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { RelatoriosView } from '@/components/features/relatorios/relatorios-view'
import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'

function RelatoriosFallback() {
  return <p className="text-zinc-500 text-center py-8 p-4">Carregando relatórios...</p>
}

export default async function RelatoriosPage() {
  const usuario = await getAuthenticatedUser()
  const role = await getUserRole()

  if (role !== 'admin' && role !== 'operador') {
    redirect('/')
  }

  return (
    <Suspense fallback={<RelatoriosFallback />}>
      <RelatoriosView ctx={{ userId: usuario.id, role }} />
    </Suspense>
  )
}

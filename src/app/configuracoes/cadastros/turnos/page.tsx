import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AcessoNegadoCadastros } from '@/components/features/cadastros/acesso-negado-cadastros'
import { CadastroSimplesLocalPanel } from '@/components/features/cadastros/cadastro-simples-panel'

export default async function TurnosPage() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()

  if (role !== 'admin') {
    return <AcessoNegadoCadastros role={role} />
  }

  return (
    <CadastroSimplesLocalPanel
      tipo="turnos"
      titulo="Turnos"
      descricao="Turnos de trabalho para apontamento de consumo"
      entidadeLabel="turno"
      queryKey="cadastros-turnos"
      ctx={{ userId: user.id, role }}
    />
  )
}

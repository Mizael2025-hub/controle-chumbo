import { getAuthenticatedUser } from '@/lib/auth/get-user'
import { getUserRole } from '@/lib/auth/get-user-role'
import { AcessoNegadoCadastros } from '@/components/features/cadastros/acesso-negado-cadastros'
import { CadastroSimplesLocalPanel } from '@/components/features/cadastros/cadastro-simples-panel'

export default async function OperadoresPage() {
  const user = await getAuthenticatedUser()
  const role = await getUserRole()

  if (role !== 'admin') {
    return <AcessoNegadoCadastros role={role} />
  }

  return (
    <CadastroSimplesLocalPanel
      tipo="operadores"
      titulo="Operadores"
      descricao="Operadores de produção para apontamento de consumo"
      entidadeLabel="operador"
      queryKey="cadastros-operadores"
      ctx={{ userId: user.id, role }}
    />
  )
}

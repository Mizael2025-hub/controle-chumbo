import Link from 'next/link'

type Props = { role: string | null }

export function AcessoNegadoSaida({ role }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center gap-4">
      <h1 className="text-xl font-semibold">Acesso restrito</h1>
      <p className="text-zinc-500 max-w-sm">
        Liberações e estornos são exclusivos do perfil PCP (admin).
        {role ? ` Seu perfil atual: ${role}.` : ''}
      </p>
      <Link
        href="/"
        className="apple-pressable text-apple-blue font-medium min-h-[44px] px-4 py-2"
      >
        Voltar ao início
      </Link>
    </div>
  )
}

import Link from 'next/link'

type Props = {
  role: string | null
}

export function AcessoNegadoEntrada({ role }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center gap-4">
      <h1 className="text-xl font-semibold">Acesso negado</h1>
      <p className="text-zinc-500 max-w-md">
        Entrada de lotes é exclusiva do perfil administrador (PCP). Seu perfil atual:{' '}
        <span className="font-medium capitalize">{role ?? 'desconhecido'}</span>.
      </p>
      <Link
        href="/"
        className="apple-pressable bg-apple-blue text-white font-medium px-6 py-3 rounded-ios-btn min-h-[44px]"
      >
        Voltar ao início
      </Link>
    </div>
  )
}

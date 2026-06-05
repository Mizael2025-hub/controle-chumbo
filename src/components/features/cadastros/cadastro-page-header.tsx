'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type CadastroPageHeaderProps = {
  titulo: string
  descricao?: string
  voltarHref?: string
}

export function CadastroPageHeader({
  titulo,
  descricao,
  voltarHref = '/configuracoes/cadastros',
}: CadastroPageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <Link
        href={voltarHref}
        className="inline-flex items-center gap-1 text-sm text-apple-blue min-h-[44px] w-fit"
        data-testid="btn-voltar-cadastros"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Cadastros
      </Link>
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      {descricao && <p className="text-zinc-500 text-sm">{descricao}</p>}
    </div>
  )
}

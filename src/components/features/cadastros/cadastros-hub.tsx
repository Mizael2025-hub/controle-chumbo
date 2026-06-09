'use client'

import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { CADASTROS_META } from '@/lib/cadastros/cadastros-meta'
import { ResetDadosOperacionaisPanel } from '@/components/features/configuracoes/reset-dados-operacionais-panel'

export function CadastrosHub() {
  return (
    <div className="flex flex-1 flex-col p-4 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-2 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-apple-blue min-h-[44px] w-fit lg:hidden"
          data-testid="btn-voltar-inicio-cadastros"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Início
        </Link>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6 text-apple-blue" strokeWidth={1.5} />
          Cadastros base
        </h1>
        <p className="text-zinc-500 text-sm">
          Gerencie ligas, setores, destinos, máquinas e dados de consumo.
        </p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CADASTROS_META.map((item) => (
          <li key={item.tipo}>
            <Link
              href={item.href}
              className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card shadow-sm apple-pressable min-h-[88px]"
              data-testid={item.testId}
            >
              <h2 className="font-semibold text-lg">{item.titulo}</h2>
              <p className="text-zinc-500 text-sm mt-1">{item.descricao}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <ResetDadosOperacionaisPanel />
      </div>
    </div>
  )
}

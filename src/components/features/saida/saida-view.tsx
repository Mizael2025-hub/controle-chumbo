'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { UsuarioRole } from '@/lib/types/usuario-role'
import { SaidaHistorico } from '@/components/features/saida/saida-historico'
import { SaidaNovaLiberacao } from '@/components/features/saida/saida-nova-liberacao'

type Aba = 'nova' | 'historico'

type Props = {
  userId: string
  role: UsuarioRole
}

export function SaidaView({ userId, role }: Props) {
  const ctx = { userId, role }
  const [aba, setAba] = useState<Aba>('nova')

  return (
    <div className="flex flex-1 flex-col p-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/"
          className="apple-pressable p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Saída / Liberação</h1>
          <p className="text-sm text-zinc-500">Selecione montes na grade e aplique a operação</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-ios-btn">
        <button
          type="button"
          onClick={() => setAba('nova')}
          className={`flex-1 min-h-[44px] rounded-ios-btn text-sm font-medium ${
            aba === 'nova' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''
          }`}
          data-testid="aba-saida-nova"
        >
          Nova liberação
        </button>
        <button
          type="button"
          onClick={() => setAba('historico')}
          className={`flex-1 min-h-[44px] rounded-ios-btn text-sm font-medium ${
            aba === 'historico' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''
          }`}
          data-testid="aba-saida-historico"
        >
          Histórico
        </button>
      </div>

      {aba === 'nova' ? (
        <SaidaNovaLiberacao ctx={ctx} />
      ) : (
        <SaidaHistorico ctx={ctx} />
      )}
    </div>
  )
}

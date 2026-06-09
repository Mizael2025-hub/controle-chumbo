'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'
import { loginAction } from '@/actions/auth-actions'
import { handleActionResponse } from '@/lib/utils/handle-action-response'

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const result = await loginAction(email, senha)
      handleActionResponse(result)
      if (result.success) {
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="mobile-page-card w-full max-w-md p-6 rounded-ios-card shadow-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-ios-card bg-apple-blue/10">
            <Package className="h-8 w-8 text-apple-blue" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Controle de Chumbo</h1>
          <p className="text-sm text-zinc-500">Entre com seu e-mail e senha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-ios-btn border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              data-testid="input-login-email"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="senha" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-ios-btn border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              data-testid="input-login-senha"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="apple-pressable w-full min-h-[44px] rounded-ios-btn bg-apple-blue text-white font-medium text-sm disabled:opacity-50"
            data-testid="btn-login-submit"
          >
            {isPending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

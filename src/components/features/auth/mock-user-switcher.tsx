'use client'

import { useTransition } from 'react'
import { trocarMockUsuarioAction } from '@/actions/auth-actions'
import { listMockUsers, type AuthUser } from '@/lib/auth/mock-users'
import { handleActionResponse } from '@/lib/utils/handle-action-response'
import { cn } from '@/lib/utils/cn'

type MockUserSwitcherProps = {
  usuarioAtualId: string
}

export function MockUserSwitcher({ usuarioAtualId }: MockUserSwitcherProps) {
  const [isPending, startTransition] = useTransition()
  const mockUsers = listMockUsers()

  function handleTrocar(userId: string) {
    if (userId === usuarioAtualId) return

    startTransition(async () => {
      const result = await trocarMockUsuarioAction(userId)
      handleActionResponse(result)
    })
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Trocar perfil (dev)
      </p>
      <div className="flex flex-wrap gap-2">
        {mockUsers.map((user: AuthUser) => (
          <button
            key={user.id}
            type="button"
            disabled={isPending}
            onClick={() => handleTrocar(user.id)}
            data-testid={`btn-mock-${user.role}`}
            className={cn(
              'apple-pressable font-medium px-4 py-2 rounded-ios-btn min-h-[44px] text-sm transition-all duration-300',
              usuarioAtualId === user.id
                ? 'bg-apple-blue text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            )}
          >
            {user.nome} ({user.role})
          </button>
        ))}
      </div>
    </div>
  )
}

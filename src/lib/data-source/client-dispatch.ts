'use client'

import { isLocalDataSourceClient } from '@/lib/data-source/client'
import type { ActionResponse } from '@/lib/types/action-response'

/** Dexie no browser (local) ou server action (supabase). */
export async function dispatchLocalOrAction<T>(
  local: () => Promise<ActionResponse<T>>,
  action: () => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  if (isLocalDataSourceClient()) {
    return local()
  }
  return action()
}

export async function dispatchLocalOrActionVoid(
  local: () => Promise<ActionResponse>,
  action: () => Promise<ActionResponse>
): Promise<ActionResponse> {
  if (isLocalDataSourceClient()) {
    return local()
  }
  return action()
}

import { toast } from 'sonner'
import type { ActionResponse } from '@/lib/types/action-response'

export function handleActionResponse<T>(
  response: ActionResponse<T>,
  options?: { onSuccess?: (data?: T) => void; successMessage?: string }
) {
  if (response.success) {
    toast.success(options?.successMessage ?? response.message ?? 'Operação realizada com sucesso!')
    options?.onSuccess?.(response.data)
  } else {
    toast.error(response.message ?? 'Erro ao processar a solicitação.')
  }
}

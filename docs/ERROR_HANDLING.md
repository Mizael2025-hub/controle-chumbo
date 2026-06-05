# ERROR_HANDLING.md — Padrão de Tratamento de Erros

> O Cursor consulta aqui ao escrever try/catch, toasts ou logs de erro.

---

## Tipo Padrão de Resposta

```typescript
// src/lib/types/action-response.ts
export type ActionResponse<T = void> = {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>  // erros de campo (validação Zod)
}
```

---

## Padrão de Catch (NUNCA catch vazio)

```typescript
async function minhaFuncao() {
  try {
    // lógica
  } catch (error) {
    console.error('[minhaFuncao]', error)
    return {
      success: false,
      message: 'Erro interno ao processar a solicitação.',
    }
  }
}
```

---

## AppError — Erros com Semântica

```typescript
// src/lib/errors/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }

  static notFound(entity: string): AppError {
    return new AppError(`${entity} não encontrado.`, 'NOT_FOUND', 404)
  }

  static unauthorized(): AppError {
    return new AppError('Acesso negado.', 'UNAUTHORIZED', 403)
  }

  static conflict(message: string): AppError {
    return new AppError(message, 'CONFLICT', 409)
  }

  static validation(message: string): AppError {
    return new AppError(message, 'VALIDATION', 422)
  }

  static offlineRequired(): AppError {
    return new AppError('Conecte-se à internet para continuar.', 'OFFLINE_REQUIRED', 503)
  }
}
```

### Service

```typescript
// [EXEMPLO — substituir pela entidade do projeto]
export async function atualizarRegistro(id: string, data: AtualizarRegistroInput) {
  try {
    const repo = getRegistroRepository()
    const atual = await repo.findById(id)

    if (!atual) throw AppError.notFound('Registro')

    if (atual.updated_at !== data.updated_at) {
      throw AppError.conflict(
        'Este registro foi alterado por outro usuário. Recarregue e tente novamente.'
      )
    }

    return await repo.update(id, data)
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error('[registroService.atualizar]', error)
    throw new AppError('Erro ao atualizar registro.', 'INTERNAL', 500)
  }
}
```

### Action

```typescript
// [EXEMPLO]
export async function atualizarRegistroAction(
  id: string,
  data: AtualizarRegistroInput
): Promise<ActionResponse> {
  try {
    await registroService.atualizarRegistro(id, data)
    return { success: true, message: 'Registro atualizado com sucesso!' }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, message: error.message }
    }
    console.error('[atualizarRegistroAction]', error)
    return { success: false, message: 'Erro interno. Tente novamente.' }
  }
}
```

---

## Tratamento no Frontend — Sonner

```typescript
// src/lib/utils/handle-action-response.ts
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
```

---

## Erros de Validação Zod no Formulário

```typescript
async function onSubmit(data: CriarRegistroInput) {
  const result = await criarRegistroAction(data)

  if (!result.success) {
    if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        form.setError(field as keyof CriarRegistroInput, { message: messages[0] })
      })
    } else {
      toast.error(result.message ?? 'Erro ao salvar.')
    }
    return
  }

  toast.success('Registro salvo com sucesso!')
}
```

---

## Erros de Rede e Offline

```typescript
// Erro de rede durante sync — manter na fila para retry
catch (error) {
  console.error('[outboxExecutor] Erro de rede — tentando novamente:', error)
}
```

---

## Logging

```typescript
// CORRETO
console.error('[registroService.criar]', error)
console.warn('[registroRepository.findById]', 'Não encontrado:', id)

// ERRADO
// console.error(error)

// NUNCA logar
// console.log('token:', session.access_token)
```

---

## Checklist

- [ ] Todo `try` tem `catch` com `console.error('[funcao]', error)`
- [ ] Nenhum `catch {}` vazio
- [ ] Erros técnicos nunca chegam ao usuário
- [ ] Toasts em PT-BR
- [ ] `AppError` para erros de negócio esperados
- [ ] Erros Zod mapeados para campos do formulário

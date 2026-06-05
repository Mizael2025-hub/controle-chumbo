# SECURITY.md — Segurança do Sistema

> Auth, autorização, RLS, secrets. Gate offline: `docs/OFFLINE.md`.

---

## Princípios Fundamentais

1. **Nunca confiar no client.** Todo dado do browser é revalidado no server.
2. **RLS é a última linha de defesa** (quando `DATA_SOURCE=supabase`).
3. **Secrets nunca vazam para o client.** Nenhuma chave sensível com `NEXT_PUBLIC_`.
4. **Validação dupla:** client (UX) + server (segurança).
5. **`DATA_SOURCE=local` não substitui validação** — simular permissões no service.

---

## Auth — Estrutura de Arquivos

```
src/lib/auth/
  get-user.ts          ← getAuthenticatedUser()
  get-user-role.ts     ← getUserRole()
```

---

## Autenticação

### Supabase (`DATA_SOURCE=supabase`)

```typescript
// src/lib/auth/get-user.ts
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { getDataSource } from '@/lib/data-source'

export async function getAuthenticatedUser() {
  if (getDataSource() === 'local') {
    // Mock — somente fase local. NUNCA em produção com Supabase.
    return { id: 'dev-user-id', email: 'dev@local.test' }
  }

  const supabase = await createServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()

  // ✅ getUser() — valida JWT no server
  // ❌ getSession() — pode ser falsificado, não usar no server

  if (error || !user) redirect('/login')
  return user
}
```

### Modo local (`DATA_SOURCE=local`)

- Usuário mock fixo (ex: `{ id: 'dev-user-id', role: 'admin' }`).
- Sem Supabase Auth real.
- Permissões simuladas no service quando necessário.

### Gate de login — internet obrigatória

Quando Offline/PWA = sim, bloquear login/abertura sem internet. Ver `docs/OFFLINE.md` (`LoginGate`).

---

## Autorização por Role

```typescript
// src/lib/auth/get-user-role.ts — [EXEMPLO]
export async function getUserRole(): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('usuarios')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return data?.role ?? null
}
```

### [EXEMPLO] Roles típicos — adaptar em `docs/BUSINESS_RULES.md`

| Role | Descrição |
|---|---|
| `admin` | Acesso total + limpeza de dados locais |
| `gerente` | Leitura total + edição ampliada |
| `operador` | Criar registros + editar próprios |

---

## RLS — Row Level Security

```sql
ALTER TABLE [tabela] ENABLE ROW LEVEL SECURITY;

-- [EXEMPLO] CORRETO — verificar auth.uid()
CREATE POLICY "usuario_ve_proprio" ON registros
  FOR SELECT USING (created_by = auth.uid());

-- ERRADO — nunca fazer
-- CREATE POLICY "all_access" ON tabela FOR ALL USING (true);
```

Detalhes e políticas por role: `docs/DATABASE.md`.

---

## Variáveis de Ambiente

### Seguras no client (`NEXT_PUBLIC_`)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=    # antes: anon key
NEXT_PUBLIC_APP_TIMEZONE=America/Sao_Paulo
```

### Somente no server (sem `NEXT_PUBLIC_`)

```bash
DATA_SOURCE=local|supabase
SUPABASE_SECRET_KEY=                     # antes: service_role key
```

### Checklist

- [ ] Nenhum secret com `NEXT_PUBLIC_`
- [ ] `.env.local` no `.gitignore`
- [ ] `SUPABASE_SECRET_KEY` apenas server-side
- [ ] `DATA_SOURCE=local` nunca em produção **com Supabase** (ok para apps 100% locais sem backend)

---

## Limpeza de Dados Locais

- Somente role `admin` (`docs/LOCAL_DATA.md`)
- Confirmação explícita obrigatória
- Não afeta dados no Supabase

---

## Proteções Anti-IDOR

```typescript
// [EXEMPLO] CORRETO — dupla proteção além do RLS
const { data } = await supabase
  .from('registros')
  .select()
  .eq('id', id)
  .eq('created_by', user.id)
  .single()
```

---

## Proteções de Formulário

```typescript
// CORRETO — user_id da sessão server-side, nunca do formData
export async function minhaAction(formData: FormData) {
  const user = await getAuthenticatedUser()
  // usar user.id aqui — nunca confiar em campo hidden do client
}
```

---

## Checklist por Feature

- [ ] Action valida com Zod no server
- [ ] `getAuthenticatedUser()` com `getUser()` (não session)
- [ ] Role verificado quando necessário
- [ ] RLS ativado (quando supabase)
- [ ] Nenhum secret em `NEXT_PUBLIC_`
- [ ] Logs não expõem dados sensíveis

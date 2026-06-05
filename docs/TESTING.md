# TESTING.md — Padrão de Testes

> O Cursor consulta este arquivo ao escrever ou rodar testes.

---

## Stack de Testes

| Ferramenta | Uso |
|---|---|
| **Vitest** | Unitários — services, validações, utilitários |
| **Playwright** | E2E — fluxos completos no browser |
| **Testing Library** | Render de componentes React |

---

## Comandos

```bash
npm test                    # Vitest — todos os unitários
npm test -- --watch         # Vitest em modo watch
npm test -- src/services/   # Pasta específica
npm run test:e2e            # Playwright — todos os E2E
npm run test:e2e -- --ui    # Playwright com interface visual
```

---

## Vitest — Testes Unitários

### O que testar

- **Services:** regras de negócio, cálculos
- **Schemas Zod:** casos válidos e inválidos
- **Utilitários:** `src/lib/utils/` (incluindo `date-time.ts`)
- **NÃO testar:** repositories (acessam banco), componentes complexos (use Playwright)

### Estrutura

```
src/services/registro-service.ts
src/services/registro-service.test.ts

src/validations/registro/registro-schema.ts
src/validations/registro/registro-schema.test.ts

src/lib/utils/date-time.ts
src/lib/utils/date-time.test.ts
```

### Template — Service

```typescript
// [EXEMPLO]
import { describe, it, expect } from 'vitest'
import { validarDataEvento } from './registro-service'

describe('validarDataEvento', () => {
  it('aceita data de hoje', () => {
    expect(validarDataEvento(new Date())).toBe(true)
  })

  it('rejeita data futura', () => {
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    expect(validarDataEvento(amanha)).toBe(false)
  })
})
```

### Template — Schema Zod

```typescript
// [EXEMPLO]
import { describe, it, expect } from 'vitest'
import { criarRegistroSchema } from './registro-schema'

describe('criarRegistroSchema', () => {
  const dadosValidos = {
    titulo: 'Teste',
    data_real_evento: '31/05/2026',
    categoria_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  }

  it('aceita dados válidos', () => {
    expect(criarRegistroSchema.safeParse(dadosValidos).success).toBe(true)
  })

  it('rejeita data em formato ISO', () => {
    expect(criarRegistroSchema.safeParse({
      ...dadosValidos,
      data_real_evento: '2026-05-31',
    }).success).toBe(false)
  })

  it('rejeita data em formato americano', () => {
    expect(criarRegistroSchema.safeParse({
      ...dadosValidos,
      data_real_evento: '05/31/2026',
    }).success).toBe(false)
  })
})
```

### Template — date-time utils

```typescript
import { describe, it, expect } from 'vitest'
import { formatarData, parseDataPtBr } from './date-time'

describe('formatarData', () => {
  it('formata em dd/MM/yyyy', () => {
    const result = formatarData('2026-05-31T12:00:00Z')
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})

describe('parseDataPtBr', () => {
  it('parseia dd/MM/yyyy corretamente', () => {
    const result = parseDataPtBr('31/05/2026')
    expect(result).not.toBeNull()
    expect(result!.getDate()).toBe(31)
    expect(result!.getMonth()).toBe(4)
  })
})
```

---

## Playwright — Testes E2E

### O que testar

- Fluxos críticos: login, criar registro, salvar configuração
- Offline: queda de rede, fila, reconexão (se aplicável)
- Login gate: bloqueio sem internet na abertura
- Limpeza de dados locais (admin)
- Responsividade mobile

### Estrutura

```
tests/e2e/
  auth/login.spec.ts
  modulo/registro.spec.ts
  modulo/registro-offline.spec.ts
  configuracoes/limpar-dados.spec.ts
```

### Template — Happy path

```typescript
import { test, expect } from '@playwright/test'

test.describe('Registro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@teste.com')
    await page.fill('[name="password"]', 'senha123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('cria registro com sucesso', async ({ page }) => {
    await page.goto('/modulo/registros')
    await page.fill('[data-testid="input-nome"]', 'Teste')
    await page.fill('[data-testid="input-data"]', '31/05/2026')
    await page.click('[data-testid="btn-salvar"]')
    await expect(page.getByText('Registro salvo')).toBeVisible()
  })
})
```

### Template — Login gate (sem internet)

```typescript
test('bloqueia login sem internet', async ({ page, context }) => {
  await context.setOffline(true)
  await page.goto('/login')
  await expect(page.getByText('Sem conexão com a internet')).toBeVisible()
})
```

### Template — Offline durante uso

```typescript
test('salva localmente quando offline durante uso', async ({ page, context }) => {
  await page.goto('/modulo/registros')
  await context.setOffline(true)
  await page.fill('[data-testid="input-nome"]', 'Teste offline')
  await page.click('[data-testid="btn-salvar"]')
  await expect(page.getByText('Salvo no dispositivo')).toBeVisible()
  await expect(page.getByTestId('sync-status')).toContainText('Offline')
})
```

---

## Atributos `data-testid`

```typescript
// <button data-testid="btn-salvar">Salvar</button>
// <div data-testid="sync-status">...</div>
// <input data-testid="input-data" />
```

---

## Cobertura Mínima

| Camada | Cobertura |
|---|---|
| Services | 80% |
| Schemas Zod | 100% casos críticos |
| date-time utils | 90% |
| Fluxos E2E críticos | 100% happy paths |

---

## Checklist por Feature

- [ ] Testes unitários do service passando
- [ ] Schema Zod testado (incluindo formato dd/MM/yyyy)
- [ ] date-time utils testados
- [ ] E2E happy path passando
- [ ] E2E offline passando (se aplicável)
- [ ] `npm test` e `npm run test:e2e` — zero falhas

# DATE_TIME.md — Data e Hora (PT-BR / Brasília)

> O Cursor consulta este arquivo ao formatar, validar ou exibir qualquer data ou hora na UI.

---

## Regras Obrigatórias

| Contexto | Formato | Exemplo |
|---|---|---|
| **UI — data** | `dd/MM/yyyy` | 31/05/2026 |
| **UI — hora** | `HH:mm` (24h, horário local) | 14:30 |
| **UI — data + hora** | `dd/MM/yyyy HH:mm` | 31/05/2026 14:30 |
| **Banco — timestamp** | `TIMESTAMPTZ` em UTC | armazenado em UTC |
| **Banco — só data** | `DATE` | 2026-05-31 |
| **API / Zod interno** | ISO 8601 (`yyyy-MM-dd` ou ISO datetime) | validação interna |
| **Fuso horário da UI** | `America/Sao_Paulo` | horário de Brasília |

### Proibido na UI

- Formato americano: `05/31/2026`
- Formato ISO visível: `2026-05-31`
- Horário UTC exibido ao usuário: `2026-05-31T17:30:00Z`

---

## Princípio: Armazenar UTC, Exibir Brasília

```
Usuário digita/vê  →  dd/MM/yyyy HH:mm (Brasília)
        ↓
Service/Action      →  converte para UTC antes de salvar
        ↓
PostgreSQL          →  TIMESTAMPTZ (UTC)
        ↓
Leitura             →  converte UTC → Brasília → dd/MM/yyyy HH:mm
```

---

## Variável de Ambiente

```bash
NEXT_PUBLIC_APP_TIMEZONE=America/Sao_Paulo
```

Usar em todos os formatadores. Se um projeto futuro precisar de outro fuso, altere apenas esta variável.

---

## Utilitários Obrigatórios

Criar em `src/lib/utils/date-time.ts`:

```typescript
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE ?? 'America/Sao_Paulo'

// Exibir data do banco (UTC ou DATE) na UI
export function formatarData(valor: string | Date): string {
  const date = typeof valor === 'string' ? new Date(valor) : valor
  const local = toZonedTime(date, TIMEZONE)
  return format(local, 'dd/MM/yyyy', { locale: ptBR })
}

// Exibir hora do banco na UI
export function formatarHora(valor: string | Date): string {
  const date = typeof valor === 'string' ? new Date(valor) : valor
  const local = toZonedTime(date, TIMEZONE)
  return format(local, 'HH:mm', { locale: ptBR })
}

// Exibir data + hora
export function formatarDataHora(valor: string | Date): string {
  const date = typeof valor === 'string' ? new Date(valor) : valor
  const local = toZonedTime(date, TIMEZONE)
  return format(local, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

// Converter input do usuário (dd/MM/yyyy) para DATE do banco
export function parseDataPtBr(valor: string): Date | null {
  const parsed = parse(valor, 'dd/MM/yyyy', new Date())
  return isValid(parsed) ? parsed : null
}

// Converter datetime local Brasília → UTC para salvar
export function localParaUtc(dataLocal: Date): Date {
  return fromZonedTime(dataLocal, TIMEZONE)
}

// Obter "agora" em Brasília
export function agoraLocal(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}
```

---

## Campos de Data no Banco

### Dois tipos de campo de data (quando aplicável)

| Campo | Tipo | Editável | Significado |
|---|---|---|---|
| `data_real_evento` | `DATE` | Sim | Quando o evento ocorreu de fato |
| `created_at` | `TIMESTAMPTZ` | Não | Quando foi salvo no sistema |

> Documente os nomes reais dos campos em `docs/DATABASE.md` para cada projeto.

---

## Validação Zod

```typescript
import { z } from 'zod'

// Aceita dd/MM/yyyy na UI, converte internamente
export const dataPtBrSchema = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data inválida. Use dd/MM/aaaa')
  .refine((val) => {
    const [dia, mes, ano] = val.split('/').map(Number)
    const date = new Date(ano, mes - 1, dia)
    return date.getDate() === dia && date.getMonth() === mes - 1
  }, 'Data inválida')

// Para validação server-side após parse
export const dataIsoSchema = z.string().date('Data inválida')
```

---

## Inputs de Data na UI

- Usar máscara `dd/MM/aaaa` ou date picker configurado para PT-BR.
- `type="date"` nativo do HTML exibe conforme locale do SO — preferir componente customizado ou máscara para garantir `dd/MM/yyyy`.
- Font-size mínimo 16px em inputs (previne zoom no iOS).

---

## Checklist por Feature

- [ ] Todas as datas na UI usam `formatarData()` ou equivalente
- [ ] Todas as horas na UI usam `formatarHora()` ou equivalente
- [ ] Nenhuma data ISO visível ao usuário
- [ ] Conversão UTC ↔ Brasília feita no service, não no componente
- [ ] Campo editável de data documentado em DATABASE.md e BUSINESS_RULES.md

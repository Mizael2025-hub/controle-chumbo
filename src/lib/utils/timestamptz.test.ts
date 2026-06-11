import { describe, expect, it } from 'vitest'
import { isValidTimestamptz, timestamptzIguais } from '@/lib/utils/timestamptz'
import { updatedAtSchema } from '@/validations/shared/updated-at-schema'
import { moverMonteSetorSchema } from '@/validations/monte/monte-schema'
import { baixaAgrupadaSchema } from '@/validations/saida/saida-schema'

describe('timestamptz', () => {
  const postgres = '2026-06-11 14:26:34.917717+00'
  const isoZ = '2026-06-11T14:26:34.917Z'

  it('aceita formato Postgres do Supabase', () => {
    expect(isValidTimestamptz(postgres)).toBe(true)
    expect(updatedAtSchema.safeParse(postgres).success).toBe(true)
  })

  it('compara timestamps equivalentes', () => {
    expect(timestamptzIguais(postgres, isoZ)).toBe(true)
  })

  it('valida operacoes de monte com updated_at Postgres', () => {
    const payload = {
      monte_id: '8789d0fd-6fb5-4dcb-83c1-fb1ee095c4fb',
      setor_id: 'a01d977f-12fb-4b4f-9e83-fb1765e5c82e',
      barras_movidas: 5,
      updated_at: postgres,
    }
    expect(moverMonteSetorSchema.safeParse(payload).success).toBe(true)
  })

  it('valida baixa agrupada com updated_at Postgres', () => {
    const payload = {
      destino_saida_id: '8789d0fd-6fb5-4dcb-83c1-fb1ee095c4fb',
      setor_id: 'a01d977f-12fb-4b4f-9e83-fb1765e5c82e',
      linhas: [
        {
          monte_id: '8789d0fd-6fb5-4dcb-83c1-fb1ee095c4fb',
          barras_baixadas: 5,
          updated_at: postgres,
        },
      ],
    }
    expect(baixaAgrupadaSchema.safeParse(payload).success).toBe(true)
  })
})

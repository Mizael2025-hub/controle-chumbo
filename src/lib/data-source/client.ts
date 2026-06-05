import type { DataSource } from '@/lib/data-source'

/** Espelho client-side de DATA_SOURCE — deve ser igual em .env.local */
export function getClientDataSource(): DataSource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE
  if (source === 'supabase') return 'supabase'
  return 'local'
}

export function isSupabaseDataSourceClient(): boolean {
  return getClientDataSource() === 'supabase'
}

export function isLocalDataSourceClient(): boolean {
  return getClientDataSource() === 'local'
}

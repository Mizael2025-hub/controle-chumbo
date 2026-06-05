export type DataSource = 'local' | 'supabase'

export function getDataSource(): DataSource {
  const source = process.env.DATA_SOURCE
  if (source === 'supabase') return 'supabase'
  return 'local'
}

export function isLocalDataSource(): boolean {
  return getDataSource() === 'local'
}

export function isSupabaseDataSource(): boolean {
  return getDataSource() === 'supabase'
}

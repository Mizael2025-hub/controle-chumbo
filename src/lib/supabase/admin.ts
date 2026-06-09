import { createClient } from '@supabase/supabase-js'

function getAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase admin não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY.'
    )
  }

  return { url, key }
}

/** Cliente service role — apenas server-side (sync/admin). */
export function createAdminSupabase() {
  const { url, key } = getAdminEnv()
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

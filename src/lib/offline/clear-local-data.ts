import { db, DB_NAME } from './db'

export async function clearAllLocalData(): Promise<void> {
  await db.delete()
  await db.open()

  if (typeof window === 'undefined') return

  localStorage.clear()
  sessionStorage.clear()

  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((reg) => reg.unregister()))
  }

  console.warn(`[clearAllLocalData] Dados locais removidos (${DB_NAME})`)
}

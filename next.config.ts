import { createRequire } from 'node:module'
import type { NextConfig } from 'next'

const require = createRequire(import.meta.url)

const isDev = process.env.NODE_ENV === 'development'

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
})

const nextConfig: NextConfig = {
  // Tablet alvo 1200×1920 px — layout responsivo via Tailwind
  allowedDevOrigins: ['192.168.3.182'],
}

export default isDev ? nextConfig : withPWA(nextConfig)

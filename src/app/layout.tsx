import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { AppProviders } from '@/components/providers/app-providers'
import { AppTabBar } from '@/components/layout/app-tab-bar'
import { MobileDebugProbe } from '@/components/layout/mobile-debug-probe'
import { getUserRole } from '@/lib/auth/get-user-role'
import { podeUsarNavegacao } from '@/lib/navigation/nav-config'
import './globals.css'

export const metadata: Metadata = {
  title: 'Controle de Chumbo',
  description: 'Sistema offline-first para controle de estoque e consumo de chumbo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Controle de Chumbo',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#007AFF',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const role = await getUserRole()

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body
        className="h-dvh flex flex-col bg-background text-foreground"
        data-dock-visible={podeUsarNavegacao(role) ? 'true' : undefined}
      >
        <div className="app-viewport-shell flex-1 min-h-0 overflow-hidden">
          <AppProviders role={role}>{children}</AppProviders>
        </div>
        <div id="app-dock-root">
          {podeUsarNavegacao(role) && <AppTabBar role={role} />}
          {process.env.NODE_ENV === 'development' && podeUsarNavegacao(role) && (
            <MobileDebugProbe />
          )}
        </div>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}

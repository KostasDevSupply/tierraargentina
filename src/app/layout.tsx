import { Providers } from '@/providers/Providers'
import { ClientProviders } from '@/providers/ClientProviders'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import './globals.css'

export const metadata = {
  title: 'Tierra Argentina',
  description: 'Catálogo de productos de Tierra Argentina',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ErrorBoundary>
          <Providers>
            <ClientProviders>
              {children}
            </ClientProviders>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
import './globals.css'

export const metadata = {
  title: 'Tierra Argentina',
  description: 'Lencería de Calidad',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
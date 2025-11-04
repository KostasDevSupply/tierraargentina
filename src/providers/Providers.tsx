'use client'

import { SessionProvider } from './SessionProvider'
import { ToastProvider } from './ToastProvider'
import { QueryProvider } from './QueryProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <ToastProvider />
        {children}
      </SessionProvider>
    </QueryProvider>
  )
}
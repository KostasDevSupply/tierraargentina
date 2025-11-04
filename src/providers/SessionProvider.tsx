'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

interface SessionContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  
  // Flag para evitar múltiples inicializaciones
  const initialized = useRef(false)

  // Verificar si estamos en una ruta de admin
  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    // Evitar múltiples ejecuciones
    if (initialized.current) {
      console.log('⚠️ SessionProvider ya inicializado, saltando...')
      return
    }

    initialized.current = true
    console.log('🚀 Inicializando SessionProvider...')

    // Obtener sesión inicial
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          setUser(null)
        } else {
          console.log('✅ Sesión inicial obtenida:', session?.user?.email)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('💥 Exception getting session:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Escuchar cambios de autenticación
    console.log('👂 Configurando listener de auth...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔐 Auth event:', event)
        
        setUser(session?.user ?? null)
        setIsLoading(false)

        // Redirigir según el evento
        if (event === 'SIGNED_OUT') {
          toast.error('Sesión cerrada')
          router.push('/login')
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refrescado')
        } else if (event === 'USER_UPDATED') {
          console.log('👤 Usuario actualizado')
        }
      }
    )

    // Auto-refresh del token cada 50 minutos
    console.log('⏰ Configurando auto-refresh (cada 50 min)...')
    const refreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refreshing session...')
      
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('❌ Error refreshing session:', error)
        if (pathname?.startsWith('/admin')) {
          toast.error('Tu sesión expiró. Por favor inicia sesión nuevamente.')
          router.push('/login')
        }
      } else if (session) {
        console.log('✅ Session auto-refreshed')
        setUser(session.user)
      }
    }, 50 * 60 * 1000) // 50 minutos

    // Warning 5 minutos antes de expirar (55 minutos)
    const warningInterval = setInterval(() => {
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/admin')) {
        console.log('⏰ Mostrando warning de expiración')
        toast('⏰ Tu sesión expirará en 5 minutos. Guarda tu trabajo.', {
          duration: 10000,
          icon: '⚠️',
        })
      }
    }, 55 * 60 * 1000) // 55 minutos

    // Cleanup function
    return () => {
      console.log('🧹 Limpiando SessionProvider...')
      subscription.unsubscribe()
      clearInterval(refreshInterval)
      clearInterval(warningInterval)
      initialized.current = false
    }
  }, []) // ← SIN DEPENDENCIAS - solo se ejecuta una vez

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        toast.error('Error al cerrar sesión')
      } else {
        setUser(null)
        toast.success('Sesión cerrada correctamente')
        router.push('/login')
      }
    } catch (error) {
      console.error('Exception signing out:', error)
      toast.error('Error inesperado al cerrar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SessionContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
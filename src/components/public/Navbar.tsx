'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, ShoppingBag, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useCategories } from '@/lib/queries/products'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useCart } from '@/contexts/CartContext'
import CartButton from '@/components/cart/CartButton'
import AdvancedSearch from './AdvancedSearch'
import type { Category } from '@/types'

// Constantes
const WHATSAPP_LINK = 'https://wa.me/5491112345678?text=Hola%2C%20vengo%20de%20la%20secci%C3%B3n%20mayorista%20y%20quisiera%20saber%20m%C3%A1s%20sobre%20compras%20al%20por%20mayor'

const NAV_LINKS = [
  { href: '/inicio', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/contacto', label: 'Contacto' },
] as const

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { cart } = useCart()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Verificar autenticación
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }, [])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    const loadingToast = toast.loading('Cerrando sesión...')
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setIsAuthenticated(false)
      toast.success('Sesión cerrada correctamente', { id: loadingToast })
      router.push('/inicio')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error al cerrar sesión', { id: loadingToast })
    } finally {
      setIsLoggingOut(false)
      setShowUserMenu(false)
    }
  }, [router])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const closeUserMenu = useCallback(() => {
    setShowUserMenu(false)
  }, [])

  // Verificar si un link está activo
  const isLinkActive = useCallback((href: string) => {
    return pathname === href
  }, [pathname])

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/inicio" className="flex items-center gap-2 group">
            <ShoppingBag className="w-8 h-8 text-blue-600 transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold text-gray-900">
              Tierra <span className="text-red-300">Argentina</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav
            links={NAV_LINKS}
            categories={categories}
            categoriesLoading={categoriesLoading}
            isLinkActive={isLinkActive}
          />

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-4">
            <AdvancedSearch />
            <CartButton />
            
            {isAuthenticated && (
              <UserMenu
                showMenu={showUserMenu}
                onToggle={() => setShowUserMenu(!showUserMenu)}
                onClose={closeUserMenu}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-pink-600 transition"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        links={NAV_LINKS}
        categories={categories}
        cartItemCount={cart.itemCount}
        isAuthenticated={isAuthenticated}
        isLoggingOut={isLoggingOut}
        onClose={closeMobileMenu}
        onLogout={handleLogout}
        isLinkActive={isLinkActive}
      />
    </nav>
  )
}

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

interface DesktopNavProps {
  links: readonly { href: string; label: string }[]
  categories?: Category[]
  categoriesLoading: boolean
  isLinkActive: (href: string) => boolean
}

function DesktopNav({ links, categories, categoriesLoading, isLinkActive }: DesktopNavProps) {
  return (
    <div className="hidden md:flex items-center gap-8">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`font-medium transition ${
            isLinkActive(link.href)
              ? 'text-pink-600'
              : 'text-gray-700 hover:text-pink-600'
          }`}
        >
          {link.label}
        </Link>
      ))}
      
      {/* Categorías dropdown */}
      <div className="relative group">
        <button 
          className="text-gray-700 hover:text-pink-600 transition flex items-center gap-1 font-medium"
          aria-label="Categorías"
        >
          Categorías
          <ChevronDown className="w-4 h-4" />
        </button>
        
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 -translate-y-2">
          <div className="p-2">
            {categoriesLoading ? (
              <div className="px-4 py-3 text-gray-500 text-sm">
                Cargando categorías...
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categorias/${cat.slug}`}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">
                No hay categorías disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link mayorista */}
      <Link 
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-700 hover:text-pink-600 transition flex items-center gap-2 font-medium"
      >
        <span className="text-lg">🏪</span>
        Mayorista
      </Link>
    </div>
  )
}

// ============================================================================

interface UserMenuProps {
  showMenu: boolean
  onToggle: () => void
  onClose: () => void
  onLogout: () => void
  isLoggingOut: boolean
}

function UserMenu({ showMenu, onToggle, onClose, onLogout, isLoggingOut }: UserMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 text-gray-600 hover:text-pink-600 transition rounded-lg hover:bg-gray-100"
        aria-label="Menú de usuario"
        aria-expanded={showMenu}
      >
        <User className="w-5 h-5" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-2">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
                onClick={onClose}
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Panel Admin</span>
              </Link>
              <button
                onClick={onLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">
                  {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================

interface MobileMenuProps {
  isOpen: boolean
  links: readonly { href: string; label: string }[]
  categories?: Category[]
  cartItemCount: number
  isAuthenticated: boolean
  isLoggingOut: boolean
  onClose: () => void
  onLogout: () => void
  isLinkActive: (href: string) => boolean
}

function MobileMenu({
  isOpen,
  links,
  categories,
  cartItemCount,
  isAuthenticated,
  isLoggingOut,
  onClose,
  onLogout,
  isLinkActive
}: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="md:hidden border-t border-gray-200 bg-white">
      <div className="px-4 py-4 space-y-1">
        {/* Main links */}
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-3 rounded-lg font-medium transition ${
              isLinkActive(link.href)
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}

        {/* Mayorista */}
        <Link 
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
          onClick={onClose}
        >
          <span className="text-lg">🏪</span>
          Mayorista
        </Link>
        
        {/* Categorías */}
        {categories && categories.length > 0 && (
          <div className="pt-2 mt-2 border-t border-gray-200">
            <p className="px-4 py-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
              Categorías
            </p>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorias/${cat.slug}`}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={onClose}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Carrito */}
        <Link
          href="/carrito"
          className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
          onClick={onClose}
        >
          <span>Carrito</span>
          {cartItemCount > 0 && (
            <span className="px-2.5 py-0.5 bg-pink-600 text-white text-xs font-bold rounded-full">
              {cartItemCount}
            </span>
          )}
        </Link>

        {/* Auth actions */}
        {isAuthenticated && (
          <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-pink-600 hover:bg-pink-50 rounded-lg font-semibold transition"
              onClick={onClose}
            >
              <Settings className="w-5 h-5" />
              Panel de Administración
            </Link>
            <button
              onClick={() => {
                onLogout()
                onClose()
              }}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
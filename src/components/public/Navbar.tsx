'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Search, ShoppingBag, User, LogOut, Shield, Settings } from 'lucide-react'
import { useCategories } from '@/lib/queries/products'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useCart } from '@/contexts/CartContext'
import CartButton from '@/components/cart/CartButton'

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { data: categories } = useCategories()
  const { items } = useCart()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
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
  }

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <p className="hidden md:block">📞 Consultá por WhatsApp tu talle y modelo</p>
          <p className="md:hidden">📞 Consultá por WhatsApp</p>
          <div className="flex gap-4 items-center">
            {isAuthenticated && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Shield className="w-4 h-4" />
                <span className="font-semibold text-xs">SuperAdmin</span>
              </div>
            )}
            <a href="https://www.instagram.com/tierraargentina_" className="hover:underline">Instagram</a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/inicio" className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-blue-600 shadow-lg"  />
            <span className="text-2xl font-bold text-gray-900">
              Tierra <span className="text-red-300">Argentina</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/inicio" className="text-gray-700 hover:text-pink-600 transition">
              Inicio
            </Link>
            <Link href="/productos" className="text-gray-700 hover:text-pink-600 transition">
              Productos
            </Link>
            
            {/* Categorías dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-pink-600 transition flex items-center gap-1">
                Categorías
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  {categories && categories.length > 0 ? (
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categorias/${cat.slug}`}
                          className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
                        >
                          <span className="mr-2">{cat.icon}</span>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Cargando categorías...</p>
                  )}
                </div>
              </div>
            </div>

            <Link href="/contacto" className="text-gray-700 hover:text-pink-600 transition">
              Contacto
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-pink-600 transition">
              <Search className="w-5 h-5" />
            </button>
            
            {/* Carrito */}
              <CartButton />
              {/* {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartItemCount}
                </span>
              )} */}

            {/* User menu */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 text-gray-600 hover:text-pink-600 transition"
                  title="Menú de usuario"
                >
                  <User className="w-5 h-5" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                      <div className="p-2">
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Panel Admin</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/inicio"
              className="block py-2 text-gray-700 hover:text-pink-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className="block py-2 text-gray-700 hover:text-pink-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Productos
            </Link>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900 py-2">Categorías</p>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorias/${cat.slug}`}
                  className="block py-2 pl-4 text-gray-700 hover:text-pink-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </div>

            <Link
              href="/contacto"
              className="block py-2 text-gray-700 hover:text-pink-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </Link>

            <Link
              href="/carrito"
              className="block py-2 text-gray-700 hover:text-pink-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Carrito ({cartItemCount})
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/admin"
                  className="block py-2 text-pink-600 hover:text-pink-700 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Panel de Administración
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                >
                  {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
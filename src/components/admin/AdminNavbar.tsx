'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Package, FolderTree, Home } from 'lucide-react'

interface AdminNavbarProps {
  userEmail: string
}

export default function AdminNavbar({ userEmail }: AdminNavbarProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-2xl">🎉</span>
              <span className="font-bold text-xl text-gray-900">
                Tierra Argentina
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex space-x-1">
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/productos"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                <Package className="w-4 h-4" />
                <span>Productos</span>
              </Link>
              <Link
                href="/admin/categorias"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                <FolderTree className="w-4 h-4" />
                <span>Categorías</span>
              </Link>
            </div>
          </div>

          {/* User info y logout */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              {userEmail}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
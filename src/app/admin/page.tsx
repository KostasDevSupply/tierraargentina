import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, FolderTree, Image, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Obtener estadísticas
  const [
    { count: productsCount },
    { count: categoriesCount },
    { count: imagesCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('product_images').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      name: 'Productos',
      value: productsCount || 0,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
      href: '/admin/productos',
    },
    {
      name: 'Categorías',
      value: categoriesCount || 0,
      icon: FolderTree,
      color: 'bg-green-100 text-green-600',
      href: '/admin/categorias',
    },
    {
      name: 'Imágenes',
      value: imagesCount || 0,
      icon: Image,
      color: 'bg-purple-100 text-purple-600',
      href: '/admin/productos',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-600">
          Gestiona tu catálogo de productos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/productos/nuevo"
            target='_blank'
            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <Package className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Nuevo Producto</p>
              <p className="text-sm text-gray-600">Agregar producto al catálogo</p>
            </div>
          </Link>
          
          <Link
            href="/admin/productos"
            target='_blank'
            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Ver Productos</p>
              <p className="text-sm text-gray-600">Gestionar catálogo completo</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Link al sitio público */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Ver sitio público
        </Link>
      </div>
    </div>
  )
}
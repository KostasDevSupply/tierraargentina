import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, FolderTree, Image, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient() // ← Agregar await aquí

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
      href: '/admin/productos',
    },
    {
      name: 'Categorías',
      value: categoriesCount || 0,
      icon: FolderTree,
      href: '/admin/categorias',
    },
    {
      name: 'Imágenes',
      value: imagesCount || 0,
      icon: Image,
      href: '/admin/productos',
    },
  ]

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 bg-gray-50">
      {/* Header */}
      <header className="mb-14 text-center flex w-full flex-col">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-600 tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-gray-500 mt-3 text-base md:text-lg">
          Gestioná tu catálogo de productos con una experiencia fluida y moderna
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="group relative bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.name}</p>
                <div className="p-3 rounded-2xl bg-[#023e8a]/10 group-hover:bg-[#023e8a]/20 transition-all duration-300">
                  <stat.icon className="w-5 h-5 text-[#023e8a]" />
                </div>
              </div>
              <p className="text-5xl font-semibold text-[#023e8a]">
                {stat.value}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
        <h2 className="text-2xl font-medium text-[#023e8a] mb-6">
          Acciones rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center space-x-4 p-5 rounded-2xl border border-gray-200 hover:border-[#023e8a] bg-white hover:bg-[#023e8a]/5 transition-all duration-300"
          >
            <div className="p-3 rounded-xl bg-[#023e8a]/10">
              <Package className="w-5 h-5 text-[#023e8a]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Nuevo producto</p>
              <p className="text-sm text-gray-500">Agregar al catálogo</p>
            </div>
          </Link>

          <Link
            href="/admin/productos"
            className="flex items-center space-x-4 p-5 rounded-2xl border border-gray-200 hover:border-[#023e8a] bg-white hover:bg-[#023e8a]/5 transition-all duration-300"
          >
            <div className="p-3 rounded-xl bg-[#023e8a]/10">
              <TrendingUp className="w-5 h-5 text-[#023e8a]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Ver productos</p>
              <p className="text-sm text-gray-500">Gestionar catálogo</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer Link */}
      <footer className="mt-14 text-center">
        <Link
          href="/"
          className="text-[#023e8a] font-medium hover:text-[#0353a4] transition-colors duration-200"
        >
          ← Ver sitio público
        </Link>
      </footer>
    </div>
  )
}
'use client'

import Link from 'next/link'
import { Package, LayoutGrid, Image as ImageIcon, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductModal from './productos/ProductModal'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    images: 0,
  })
  const [showProductModal, setShowProductModal] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()

    const [products, categories, images] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('product_images').select('*', { count: 'exact', head: true }),
    ])

    setStats({
      products: products.count || 0,
      categories: categories.count || 0,
      images: images.count || 0,
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-600">
          Gestioná tu catálogo de productos con una experiencia fluida y moderna
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Productos</p>
              <p className="text-4xl font-bold text-blue-600">{stats.products}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Categorías</p>
              <p className="text-4xl font-bold text-purple-600">{stats.categories}</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Imágenes</p>
              <p className="text-4xl font-bold text-pink-600">{stats.images}</p>
            </div>
            <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowProductModal(true)}
            className="group flex items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors">
              <Package className="w-6 h-6 text-blue-600 group-hover:text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 group-hover:text-blue-600">
                Nuevo producto
              </p>
              <p className="text-sm text-gray-600">Agregar al catálogo</p>
            </div>
          </button>

          <Link
            href="/admin/productos"
            className="group flex items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-500 rounded-xl flex items-center justify-center transition-colors">
              <TrendingUp className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 group-hover:text-purple-600">
                Ver productos
              </p>
              <p className="text-sm text-gray-600">Gestionar catálogo</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Link al sitio público */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Ver sitio público
        </Link>
      </div>

      {/* Modal de Nuevo Producto */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false)
            loadStats() // Recargar stats después de crear
          }}
        />
      )}
    </div>
  )
}
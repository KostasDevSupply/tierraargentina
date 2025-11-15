'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  Star,
  Package,
  TrendingUp,
  Camera,
  Palette,
  Plus,
  AlertTriangle,
  X,
  Grid3x3,
  List,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import ToggleProductButton from './ToggleProductButton'

interface ProductsClientProps {
  products: any[]
}

type ViewMode = 'grid' | 'list'
type GridColumns = 2 | 3 | 4 | 5 | 6

export default function ProductsClient({ products: initialProducts }: ProductsClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  // ✅ Estados para vista
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [gridColumns, setGridColumns] = useState<GridColumns>(3)
  const [showFilters, setShowFilters] = useState(false)

  // Estadísticas
  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.is_active).length,
    featured: products.filter(p => p.is_featured).length,
    noImages: products.filter(p => !p.images || p.images.length === 0).length,
  }), [products])

  // Filtrado mejorado
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.slug?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || product.category?.id === categoryFilter
      
      let matchesStatus = true
      if (statusFilter === 'active') matchesStatus = product.is_active
      if (statusFilter === 'inactive') matchesStatus = !product.is_active
      if (statusFilter === 'featured') matchesStatus = product.is_featured
      if (statusFilter === 'no-images') matchesStatus = !product.images || product.images.length === 0
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, searchQuery, categoryFilter, statusFilter])

  // Categorías únicas
  const categories = useMemo(() => {
    const cats = new Map()
    products.forEach(p => {
      if (p.category) {
        cats.set(p.category.id, p.category)
      }
    })
    return Array.from(cats.values())
  }, [products])

  const handleDelete = async () => {
    if (!productToDelete) return
    setDeleting(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
      toast.success('Producto eliminado exitosamente')
      setShowDeleteModal(false)
      setProductToDelete(null)
      router.refresh()
    } catch (error: any) {
      console.error('Error al eliminar:', error)
      toast.error(error.message || 'Error al eliminar el producto')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleFeatured = async (product: any) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !product.is_featured })
        .eq('id', product.id)

      if (error) throw error

      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, is_featured: !p.is_featured } : p
      ))

      toast.success(product.is_featured ? 'Producto quitado de destacados' : 'Producto destacado')
      router.refresh()
    } catch (error: any) {
      toast.error('Error al actualizar el producto')
    }
  }

  // ✅ Clases para grid dinámico
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Productos</h1>
              <p className="text-gray-600">Gestiona tu catálogo de productos</p>
            </div>
            <Link href="/admin/productos/nuevo">
              <button className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all">
                <Plus className="w-5 h-5" />
                Nuevo Producto
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setStatusFilter(statusFilter === 'all' ? 'all' : 'all')}
              className={`bg-white rounded-2xl p-6 border-2 transition-all text-left ${
                statusFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Productos</p>
                  <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
              className={`bg-white rounded-2xl p-6 border-2 transition-all text-left ${
                statusFilter === 'active' ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Activos</p>
                  <p className="text-3xl font-semibold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'featured' ? 'all' : 'featured')}
              className={`bg-white rounded-2xl p-6 border-2 transition-all text-left ${
                statusFilter === 'featured' ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Destacados</p>
                  <p className="text-3xl font-semibold text-yellow-600">{stats.featured}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'no-images' ? 'all' : 'no-images')}
              className={`bg-white rounded-2xl p-6 border-2 transition-all text-left ${
                statusFilter === 'no-images' ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sin Imágenes</p>
                  <p className="text-3xl font-semibold text-orange-600">{stats.noImages}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </button>
          </div>

          {/* Toolbar mejorado */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre o slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative lg:w-64">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {/* View Controls */}
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                  {/* Grid/List Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-white shadow-sm text-pink-600' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Vista en cuadrícula"
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'list' 
                          ? 'bg-white shadow-sm text-pink-600' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Vista en lista"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Columns Selector (solo en modo grid) */}
                  {viewMode === 'grid' && (
                    <div className="relative">
                      <select
                        value={gridColumns}
                        onChange={(e) => setGridColumns(Number(e.target.value) as GridColumns)}
                        className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition appearance-none bg-white cursor-pointer text-sm font-medium"
                      >
                        <option value={2}>2 columnas</option>
                        <option value={3}>3 columnas</option>
                        <option value={4}>4 columnas</option>
                        <option value={5}>5 columnas</option>
                        <option value={6}>6 columnas</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Filtros activos:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                      Búsqueda: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="hover:text-pink-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Categoría
                      <button onClick={() => setCategoryFilter('all')} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Estado: {statusFilter}
                      <button onClick={() => setStatusFilter('all')} className="hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setCategoryFilter('all')
                      setStatusFilter('all')
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 underline ml-2"
                  >
                    Limpiar todos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'No se encontraron productos con esos filtros'
                : 'Comienza agregando tu primer producto'}
            </p>
            <Link href="/admin/productos/nuevo">
              <button className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition">
                Crear Producto
              </button>
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          // ✅ VISTA GRID
          <div className={`grid ${gridClasses[gridColumns]} gap-6`}>
            {filteredProducts.map((product) => {
              const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {primaryImage?.url ? (
                      <img
                        src={primaryImage.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_featured && (
                        <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3" />
                          Destacado
                        </span>
                      )}
                      {!product.is_active && (
                        <span className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full shadow-md">
                          Inactivo
                        </span>
                      )}
                    </div>

                    {/* Actions Dropdown */}
                    <div className="absolute top-3 right-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                          className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-700" />
                        </button>

                        {openDropdown === product.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                              <Link href={`/productos/${product.slug}`} target="_blank">
                                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                                  <Eye className="w-4 h-4" />
                                  Ver producto
                                </button>
                              </Link>
                              <Link href={`/admin/productos/${product.id}`}>
                                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                                  <Edit2 className="w-4 h-4" />
                                  Editar
                                </button>
                              </Link>
                              <button
                                onClick={() => {
                                  handleToggleFeatured(product)
                                  setOpenDropdown(null)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                              >
                                <Star className={`w-4 h-4 ${product.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                {product.is_featured ? 'Quitar destacado' : 'Destacar'}
                              </button>
                              <div className="border-t border-gray-200 my-2" />
                              <button
                                onClick={() => {
                                  setProductToDelete(product)
                                  setShowDeleteModal(true)
                                  setOpenDropdown(null)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Image Counter */}
                    {product.images && product.images.length > 0 && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {product.images.length}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category */}
                    {product.category && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-md mb-2">
                        <span>{product.category.icon}</span>
                        {product.category.name}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[3rem] leading-tight">
                      {product.name}
                    </h3>

                    {/* Type */}
                    {product.type && (
                      <p className="text-sm text-gray-500 mb-2">{product.type.name}</p>
                    )}

                    {/* Price */}
                    <p className="text-2xl font-semibold text-pink-600 mb-3">
                      {product.price > 0 ? `$${product.price.toLocaleString('es-AR')}` : 'Consultar'}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
                      {product.sizes && product.sizes.length > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {product.sizes.length} talles
                        </span>
                      )}
                      {product.colors && product.colors.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Palette className="w-4 h-4 text-purple-500" />
                          {product.colors.length}
                        </span>
                      )}
                    </div>

                    {/* Colors Preview */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Colores:</span>
                        <div className="flex gap-1">
                          {product.colors.slice(0, 5).map((color: any) => (
                            <div
                              key={color.id}
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                              style={{ backgroundColor: color.hex_code }}
                              title={color.name}
                            />
                          ))}
                          {product.colors.length > 5 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] text-gray-600 font-medium">
                              +{product.colors.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Toggle Active */}
                    <ToggleProductButton
                      productId={product.id}
                      isActive={product.is_active}
                      isFeatured={product.is_featured}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // ✅ VISTA LISTA
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Talles
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Colores
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Fotos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {primaryImage?.url ? (
                                <img
                                  src={primaryImage.url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{product.name}</p>
                              {product.type && (
                                <p className="text-sm text-gray-500">{product.type.name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.category && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-md">
                              <span>{product.category.icon}</span>
                              {product.category.name}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-lg font-semibold text-pink-600">
                            {product.price > 0 ? `$${product.price.toLocaleString('es-AR')}` : 'Consultar'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {product.sizes?.length || 0} talles
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.colors && product.colors.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {product.colors.slice(0, 3).map((color: any) => (
                                <div
                                  key={color.id}
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                                  style={{ backgroundColor: color.hex_code }}
                                  title={color.name}
                                />
                              ))}
                              {product.colors.length > 3 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  +{product.colors.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Camera className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {product.images?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ToggleProductButton
                            productId={product.id}
                            isActive={product.is_active}
                            isFeatured={product.is_featured}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/productos/${product.slug}`} target="_blank">
                              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link href={`/admin/productos/${product.id}`}>
                              <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => {
                                setProductToDelete(product)
                                setShowDeleteModal(true)
                              }}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        ¿Eliminar producto?
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Esta acción no se puede deshacer
                      </p>
                    </div>
                  </div>
                  {!deleting && (
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-2">
                  Estás a punto de eliminar el producto:
                </p>
                <p className="font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
                  {productToDelete?.name}
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Se eliminarán todas las imágenes, talles y colores asociados a este producto.
                </p>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
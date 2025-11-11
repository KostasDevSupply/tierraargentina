'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Image as ImageIcon,
  Tag,
  Ruler,
  X,
  Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import ImageManager from '../../ImageManager'

interface ProductEditClientProps {
  product: any
  categories: any[]
  types: any[]
}

interface FormData {
  name: string
  slug: string
  short_description: string
  price: number
  category_id: string
  type_id: string
  is_active: boolean
  is_featured: boolean
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '1', '2', '3', '4', '85', '90', '95', '100'] as const

export default function ProductEditClient({ product, categories, types }: ProductEditClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  const [loading, setLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState(product.images || [])
  const [sizes, setSizes] = useState<string[]>(
    product.sizes?.map((s: any) => s.size) || []
  )
  const [newSize, setNewSize] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    name: product.name || '',
    slug: product.slug || '',
    short_description: product.short_description || '',
    price: product.price || 0,
    category_id: product.category_id || '',
    type_id: product.type_id || '',
    is_active: product.is_active ?? true,
    is_featured: product.is_featured ?? false,
  })

  // Utilidades
  const generateSlug = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }, [])

  // Handlers
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }, [generateSlug])

  const handleAddSize = useCallback((size: string) => {
    if (size && !sizes.includes(size)) {
      setSizes(prev => [...prev, size])
      setNewSize('')
    }
  }, [sizes])

  const handleRemoveSize = useCallback((size: string) => {
    setSizes(prev => prev.filter(s => s !== size))
  }, [])

  const handleImagesChange = useCallback((images: any[]) => {
    setUploadedImages(images)
  }, [])

  const handleSizeKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSize(newSize)
    }
  }, [newSize, handleAddSize])

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    
    if (!formData.category_id) {
      toast.error('La categoría es requerida')
      return
    }

    setLoading(true)

    try {
      // Actualizar producto
      const { error: updateError } = await supabase
        .from('products')
        .update(formData)
        .eq('id', product.id)

      if (updateError) throw updateError

      // Actualizar talles
      await supabase
        .from('product_sizes')
        .delete()
        .eq('product_id', product.id)

      if (sizes.length > 0) {
        const sizesData = sizes.map((size, index) => ({
          product_id: product.id,
          size,
          in_stock: true,
          order_index: index,
        }))

        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(sizesData)

        if (sizesError) throw sizesError
      }

      toast.success('Producto actualizado exitosamente')
      router.push('/admin/productos')
      router.refresh()
    } catch (error: any) {
      console.error('Error al actualizar producto:', error)
      toast.error(error.message || 'Error al actualizar el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver a productos</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Editar Producto
            </h1>
            <p className="text-lg text-gray-600 mt-2">{product.name}</p>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border-2">
            {product.is_active ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Activo</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">Inactivo</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Creado</p>
              <p className="text-lg font-bold text-blue-900 mt-0.5">
                {formatDate(product.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Actualizado</p>
              <p className="text-lg font-bold text-purple-900 mt-0.5">
                {formatDate(product.updated_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Imágenes</p>
              <p className="text-lg font-bold text-amber-900 mt-0.5">
                {uploadedImages.length} {uploadedImages.length === 1 ? 'imagen' : 'imágenes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Manager */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Imágenes del Producto
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Arrastra para reordenar, máximo 5MB por imagen
            </p>
          </div>
        </div>
        
        <ImageManager
          productId={product.id}
          onImagesChange={handleImagesChange}
          initialImages={uploadedImages}
        />
      </div>

      {/* Product Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Información del Producto
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Actualiza los detalles y características
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre y Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="product-slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                id="product-slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción corta
            </label>
            <textarea
              id="product-description"
              value={formData.short_description}
              onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
              rows={3}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
            />
          </div>

          {/* Categoría, Tipo y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="product-category" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="product-category"
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Seleccionar...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="product-type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                id="product-type"
                value={formData.type_id}
                onChange={(e) => setFormData(prev => ({ ...prev, type_id: e.target.value }))}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Sin tipo</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio
              </label>
              <input
                id="product-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                disabled={loading}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          {/* Talles */}
          <section>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Ruler className="w-4 h-4" />
              Talles disponibles
            </label>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Talles comunes:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleAddSize(size)}
                    disabled={sizes.includes(size) || loading}
                    className={`px-3 py-1 text-sm rounded-full border-2 transition-all ${
                      sizes.includes(size)
                        ? 'border-green-500 bg-green-50 text-green-700 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {size}
                    {sizes.includes(size) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                onKeyPress={handleSizeKeyPress}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Talle personalizado..."
              />
              <button
                type="button"
                onClick={() => handleAddSize(newSize)}
                disabled={loading || !newSize.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm font-medium"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Switches */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                disabled={loading}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm font-medium text-gray-700">Producto activo</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                disabled={loading}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm font-medium text-gray-700">Producto destacado</span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
            <Link
              href="/admin/productos"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
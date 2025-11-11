'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X, Save, Image as ImageIcon, Tag, Ruler, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import ImageManager from '../ImageManager'
import QuickAddModal from './QuickAddModal'
import type { ProductImage } from '@/types'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: any
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

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  // Estados
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [newSize, setNewSize] = useState('')
  const [showQuickAddCategory, setShowQuickAddCategory] = useState(false)
  const [showQuickAddType, setShowQuickAddType] = useState(false)
  
  // Form data inicial
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    short_description: '',
    price: 0,
    category_id: '',
    type_id: '',
    is_active: true,
    is_featured: false,
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  // Actualizar form cuando cambia product
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        short_description: product.short_description || '',
        price: product.price || 0,
        category_id: product.category_id || '',
        type_id: product.type_id || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
      })
      setSizes(product.sizes?.map((s: any) => s.size) || [])
      setUploadedImages(product.images || [])
    } else {
      resetForm()
    }
  }, [product])

  // Funciones de carga
  const loadInitialData = async () => {
    await Promise.all([
      loadCategories(),
      loadTypes()
    ])
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    setCategories(data || [])
  }

  const loadTypes = async () => {
    const { data } = await supabase
      .from('types')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    setTypes(data || [])
  }

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

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      price: 0,
      category_id: '',
      type_id: '',
      is_active: true,
      is_featured: false,
    })
    setSizes([])
    setUploadedImages([])
    setNewSize('')
  }

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

  const handleImagesChange = useCallback((images: ProductImage[]) => {
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
    
    // Validaciones
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión activa')

      let productId: string | undefined = product?.id

      // Crear o actualizar producto
      if (product?.id) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id)

        if (error) throw error
        productId = product.id
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(formData)
          .select()
          .single()

        if (error) throw error
        productId = newProduct?.id
      }

      if (!productId) throw new Error('No se pudo obtener el ID del producto')

      // Guardar talles
      await saveSizes(productId)

      // Guardar imágenes nuevas
      await saveImages(productId)

      toast.success(product ? 'Producto actualizado' : 'Producto creado')
      router.refresh()
      onClose()
    } catch (error: any) {
      console.error('Error al guardar producto:', error)
      toast.error(error.message || 'Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  const saveSizes = async (productId: string) => {
    if (sizes.length === 0) return

    // Eliminar talles existentes
    await supabase
      .from('product_sizes')
      .delete()
      .eq('product_id', productId)

    // Insertar nuevos talles
    const sizesData = sizes.map((size, index) => ({
      product_id: productId,
      size,
      in_stock: true,
      order_index: index,
    }))

    const { error } = await supabase
      .from('product_sizes')
      .insert(sizesData)

    if (error) throw error
  }

  const saveImages = async (productId: string) => {
    const newImages = uploadedImages.filter((img: any) => !img.id)
    if (newImages.length === 0) return

    const imagesData = newImages.map((img: any, index: number) => ({
      product_id: productId,
      url: typeof img === 'string' ? img : img.url,
      storage_path: img.storage_path || '',
      filename: img.filename || '',
      is_primary: index === 0 && !product,
      order_index: uploadedImages.length + index,
    }))

    const { error } = await supabase
      .from('product_images')
      .insert(imagesData)

    if (error) throw error
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-start justify-center min-h-screen px-4 pt-4 pb-20">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={handleClose}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Imágenes */}
              <section>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <ImageIcon className="w-4 h-4" />
                  Imágenes del producto
                </label>
                <ImageManager
                  productId={product?.id || null}
                  onImagesChange={handleImagesChange}
                  initialImages={uploadedImages}
                />
              </section>

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
                    placeholder="Bombacha elastizada"
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
                  placeholder="Describe el producto..."
                />
              </div>

              {/* Categoría, Tipo y Precio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categoría */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="product-category" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Tag className="w-4 h-4" />
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddCategory(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Nueva
                    </button>
                  </div>
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

                {/* Tipo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="product-type" className="block text-sm font-medium text-gray-700">
                      Tipo
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddType(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Nuevo
                    </button>
                  </div>
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

                {/* Precio */}
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
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Talles */}
              <section>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Ruler className="w-4 h-4" />
                  Talles disponibles
                </label>

                {/* Talles comunes */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Talles comunes (click para agregar):
                  </p>
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

                {/* Input personalizado */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                    onKeyPress={handleSizeKeyPress}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="O escribe un talle personalizado..."
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSize(newSize)}
                    disabled={loading || !newSize.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Agregar
                  </button>
                </div>

                {/* Talles seleccionados */}
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
                          aria-label={`Eliminar talle ${size}`}
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
              <div className="flex justify-end space-x-4 pt-6 border-t sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modales Quick Add */}
      <QuickAddModal
        isOpen={showQuickAddCategory}
        onClose={() => setShowQuickAddCategory(false)}
        type="category"
        onSuccess={loadCategories}
      />

      <QuickAddModal
        isOpen={showQuickAddType}
        onClose={() => setShowQuickAddType(false)}
        type="type"
        onSuccess={loadTypes}
      />
    </>
  )
}
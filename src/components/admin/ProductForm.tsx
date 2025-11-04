'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Type, Product } from '@/types'
import toast from 'react-hot-toast'

import { createProduct, updateProduct } from '@/lib/actions/products'
import type { Category, Type, Product } from '@/types'

interface ProductFormProps {
  categories: Category[]
  types: Type[]
  product?: Product
  isEdit?: boolean
}

export default function ProductForm({ 
  categories, 
  types, 
  product,
  isEdit = false 
}: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state - VERIFICAR QUE ESTA PARTE ESTÉ BIEN
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price || 0,
    category_id: product?.category_id || '',
    type_id: product?.type_id || '',
    notes: product?.notes || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  })

  const [sizes, setSizes] = useState<string[]>(
    product?.sizes?.sort((a, b) => a.order_index - b.order_index).map(s => s.size) || []
  )
  const [newSize, setNewSize] = useState('')

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes([...sizes, newSize.trim()])
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error('El nombre es obligatorio')
      }

      if (!formData.category_id) {
        throw new Error('Debes seleccionar una categoría')
      }

      if (sizes.length === 0) {
        throw new Error('Debes agregar al menos un talle')
      }

      const supabase = createClient()

      // Verificar sesión
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Tu sesión expiró. Redirigiendo...')
      }

      console.log('Operación:', isEdit ? 'UPDATE' : 'CREATE')
      console.log('Datos:', { formData, sizes })

      if (isEdit && product) {
        // ============================================
        // ACTUALIZAR PRODUCTO EXISTENTE
        // ============================================
        console.log('Actualizando producto:', product.id)

        // 1. Actualizar producto
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            short_description: formData.short_description || null,
            price: Number(formData.price) || 0,
            category_id: formData.category_id,
            type_id: formData.type_id || null,
            notes: formData.notes || null,
            is_active: formData.is_active,
            is_featured: formData.is_featured,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id)

        if (updateError) {
          throw new Error(`Error al actualizar: ${updateError.message}`)
        }

        // 2. Eliminar talles viejos
        const { error: deleteSizesError } = await supabase
          .from('product_sizes')
          .delete()
          .eq('product_id', product.id)

        if (deleteSizesError) {
          console.warn('Error al eliminar talles:', deleteSizesError)
        }

        // 3. Crear nuevos talles
        const sizesData = sizes.map((size, index) => ({
          product_id: product.id,
          size: size,
          order_index: index,
        }))

        const { error: insertSizesError } = await supabase
          .from('product_sizes')
          .insert(sizesData)

        if (insertSizesError) {
          throw new Error(`Error al actualizar talles: ${insertSizesError.message}`)
        }

        console.log('✅ Producto actualizado exitosamente')

      } else {
        // ============================================
        // CREAR PRODUCTO NUEVO
        // ============================================
        console.log('Creando nuevo producto')

        // 1. Verificar slug único
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('slug', formData.slug)
          .maybeSingle()

        if (existingProduct) {
          throw new Error('Ya existe un producto con ese nombre. Usa otro.')
        }

        // 2. Crear producto
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            short_description: formData.short_description || null,
            price: Number(formData.price) || 0,
            category_id: formData.category_id,
            type_id: formData.type_id || null,
            notes: formData.notes || null,
            is_active: formData.is_active,
            is_featured: formData.is_featured,
          })
          .select()
          .single()

        if (createError || !newProduct) {
          throw new Error(`Error al crear: ${createError?.message || 'Error desconocido'}`)
        }

        console.log('Producto creado:', newProduct.id)

        // 3. Crear talles
        const sizesData = sizes.map((size, index) => ({
          product_id: newProduct.id,
          size: size,
          order_index: index,
        }))

        const { error: insertSizesError } = await supabase
          .from('product_sizes')
          .insert(sizesData)

        if (insertSizesError) {
          // Rollback: eliminar producto
          console.error('Error al crear talles, haciendo rollback')
          await supabase.from('products').delete().eq('id', newProduct.id)
          throw new Error(`Error al crear talles: ${insertSizesError.message}`)
        }

        console.log('✅ Producto creado exitosamente')
      }

      // Éxito - Mostrar mensaje y redirigir
     toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/productos')
      router.refresh()

    } catch (err: any) {
      console.error('❌ Error:', err)
      toast.error(err.message || 'Error inesperado')
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      const productData = {
        ...formData,
        price: Number(formData.price),
      }

      let result
      if (isEdit && product) {
        result = await updateProduct(product.id, productData, sizes)
      } else {
        result = await createProduct(productData, sizes)
      }

      if (result.success) {
        router.push('/admin/productos')
        router.refresh()
      } else {
        setError(result.error || 'Error al guardar el producto')
        setLoading(false)
      }
    } catch (err) {
      setError('Error inesperado al guardar')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">{error}</p>
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Producto *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Bombacha gabardina elastizada dama"
        />
      </div>

      {/* Slug */}
      {/* Slug (auto-generado) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL (Slug)
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:opacity-50"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          placeholder="bombacha-gabardina-elastizada-dama"
        />
        <p className="text-xs text-gray-500 mt-1">
          Se genera automáticamente del nombre
        </p>
      </div>

      {/* Categoría y Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            required
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo (opcional)
          </label>
          <select
            value={formData.type_id}
            onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sin tipo</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Precio *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
            required
            min="0"
            step="1"
            disabled={loading}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
            min="0"
            step="1"
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="35000"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Usa 0 para mostrar "Consultar"
        </p>
      </div>

      {/* Descripción corta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Corta (opcional)
        </label>
        <input
          type="text"
          value={formData.short_description}
          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          placeholder="Ej: Gabardina elastizada premium"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Gabardina elastizada premium con bordado exclusivo"
          maxLength={150}
        />
      </div>

      {/* Descripción larga */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Completa (opcional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          placeholder="Descripción detallada..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Descripción detallada del producto..."
        />
      </div>

      {/* Talles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Talles / Medidas *
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSize()
              }
            }}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            placeholder="Ej: 38, M, XL"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 38, M, XL, 32cm"
          />
          <button
            type="button"
            onClick={addSize}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Agregar
          </button>
        </div>
        
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                <span>{size}</span>
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        {sizes.length === 0 && (
          <p className="text-sm text-gray-500">Agrega al menos un talle</p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas (opcional)
        </label>
        <input
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Los bordados pueden cambiar"
        />
      </div>

      {/* Checkboxes */}
      <div className="flex space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            disabled={loading}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Producto activo</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_featured}
            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            disabled={loading}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Destacado</span>
        </label>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || sizes.length === 0}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>
            {loading ? '⏳ Guardando...' : (isEdit ? 'Actualizar Producto' : 'Crear Producto')}
          </span>
          <span>{loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Producto')}</span>
        </button>
      </div>
    </form>
  )
}
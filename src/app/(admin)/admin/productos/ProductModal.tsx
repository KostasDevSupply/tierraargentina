'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X, Save, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import ImageManager from '../ImageManager'
import QuickAddModal from './QuickAddModal'
import QuickAddColorModal from './QuickAddColorModal'
import SizeSelector from './SizeSelector'
import ColorSelector from '@/components/ui/ColorSelector'
import PriceInput from '@/components/ui/PriceInput'
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

// Toggle Switch Component
function Toggle({ checked, onChange, label, description, disabled }: any) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-blue-600' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  // States
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [colors, setColors] = useState<any[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [colorIds, setColorIds] = useState<string[]>([])
  
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

  const [modals, setModals] = useState({ category: false, type: false, color: false })

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadTypes()
      loadColors()
    }
  }, [isOpen])

  // Populate form when editing
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
      setImages(product.images || [])
      
      // Load colors
      if (product.product_colors?.length > 0) {
        setColorIds(product.product_colors.map((pc: any) => pc.color_id))
      } else if (product.colors?.length > 0) {
        setColorIds(product.colors.map((c: any) => c.id))
      } else {
        setColorIds([])
      }
    } else {
      resetForm()
    }
  }, [product])

  // Load functions
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

  const loadColors = async () => {
    const { data } = await supabase
      .from('colors')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setColors(data || [])
  }

  // Utility functions
  const generateSlug = useCallback((name: string) => {
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
    setImages([])
    setColorIds([])
  }

  // Handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }))
  }

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const openModal = (type: 'category' | 'type' | 'color') => {
    setModals(prev => ({ ...prev, [type]: true }))
  }

  const closeModal = (type: 'category' | 'type' | 'color') => {
    setModals(prev => ({ ...prev, [type]: false }))
  }

  // Quick Add Success Handler
  const handleQuickAddSuccess = useCallback(async (type: 'category' | 'type' | 'color', createdId?: string) => {
    closeModal(type)
    
    console.log(`Quick Add Success - Type: ${type}, ID: ${createdId}`)
    
    // CRITICAL: Set ID first, then reload
    if (createdId) {
      if (type === 'category') {
        setFormData(prev => ({ ...prev, category_id: createdId }))
        console.log('Category ID set:', createdId)
        await new Promise(resolve => setTimeout(resolve, 100))
        await loadCategories()
      } else if (type === 'type') {
        setFormData(prev => ({ ...prev, type_id: createdId }))
        console.log('Type ID set:', createdId)
        await new Promise(resolve => setTimeout(resolve, 100))
        await loadTypes()
      } else if (type === 'color') {
        setColorIds(prev => {
          const newIds = [...prev, createdId]
          console.log('Color IDs updated:', newIds)
          return newIds
        })
        await loadColors()
      }
    } else {
      // No ID returned, just reload
      if (type === 'category') await loadCategories()
      else if (type === 'type') await loadTypes()
      else if (type === 'color') await loadColors()
    }
  }, [])

  // Submit Handler
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión activa')

      let productId = product?.id

      // Create or update product
      if (productId) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', productId)
        
        if (error) throw error
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(formData)
          .select('id')
          .single()
        
        if (error) throw error
        
        if (!newProduct?.id) {
          throw new Error('No se recibió el ID del producto')
        }
        
        productId = newProduct.id
      }

      if (!productId) throw new Error('ID de producto inválido')

      // Save relations
      await Promise.all([
        saveSizes(productId),
        saveImages(productId),
        saveColors(productId)
      ])

      toast.success(product ? 'Producto actualizado ✓' : 'Producto creado ✓')
      router.refresh()
      onClose()
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  // Save Relations
  const saveSizes = async (productId: string) => {
    if (!sizes.length) return
    
    await supabase.from('product_sizes').delete().eq('product_id', productId)
    
    const data = sizes.map((size, i) => ({ 
      product_id: productId, 
      size, 
      in_stock: true, 
      order_index: i 
    }))
    
    const { error } = await supabase.from('product_sizes').insert(data)
    if (error) throw error
  }

  const saveImages = async (productId: string) => {
    const newImages = images.filter((img: any) => !img.id)
    if (!newImages.length) return
    
    const data = newImages.map((img: any, i: number) => ({
      product_id: productId,
      url: typeof img === 'string' ? img : img.url,
      storage_path: img.storage_path || '',
      filename: img.filename || '',
      is_primary: i === 0 && !product,
      order_index: images.length + i,
    }))
    
    const { error } = await supabase.from('product_images').insert(data)
    if (error) throw error
  }

  const saveColors = async (productId: string) => {
    await supabase.from('product_colors').delete().eq('product_id', productId)
    
    if (!colorIds.length) return
    
    const data = colorIds.map((colorId, i) => ({ 
      product_id: productId, 
      color_id: colorId, 
      order_index: i 
    }))
    
    const { error } = await supabase.from('product_colors').insert(data)
    if (error) throw error
  }

  const isFormValid = formData.name.trim() && formData.category_id

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
        <div className="flex min-h-screen items-start justify-center p-4 pt-[5vh]">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
            
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {product ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={loading}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-h-[calc(100vh-180px)] overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Images */}
                <ImageManager
                  productId={product?.id || null}
                  onImagesChange={setImages}
                  initialImages={images}
                />

                <Separator />

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder="Bombacha elastizada"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL)</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => updateField('slug', e.target.value)}
                        placeholder="bombacha-elastizada"
                        disabled={loading}
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción corta</Label>
                    <Textarea
                      id="description"
                      value={formData.short_description}
                      onChange={(e) => updateField('short_description', e.target.value)}
                      placeholder="Describe el producto..."
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Separator />

                {/* Classification */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Category - ✅ FIX: Agregar key prop */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Categoría <span className="text-red-500">*</span></Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal('category')}
                          className="h-7 text-xs"
                        >
                          + Nueva
                        </Button>
                      </div>
                      <Select
                        key={formData.category_id || 'empty-category'}
                        value={formData.category_id}
                        onValueChange={(value) => updateField('category_id', value)}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type - ✅ FIX: Agregar key prop */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Tipo</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal('type')}
                          className="h-7 text-xs"
                        >
                          + Nuevo
                        </Button>
                      </div>
                      <Select
                        key={formData.type_id || 'empty-type'}
                        value={formData.type_id}
                        onValueChange={(value) => updateField('type_id', value)}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sin tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price */}
                    <PriceInput
                      label="Precio"
                      value={formData.price}
                      onChange={(value) => updateField('price', value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Separator />

                {/* Colors */}
                <ColorSelector
                  colors={colors}
                  selectedColorIds={colorIds}
                  onChange={(ids) => {
                    console.log('ColorSelector onChange called:', ids)
                    setColorIds(ids)
                  }}
                  onAddNew={() => openModal('color')}
                  disabled={loading}
                />

                <Separator />

                {/* Sizes */}
                <SizeSelector
                  selectedSizes={sizes}
                  onChange={setSizes}
                  disabled={loading}
                />

                <Separator />

                {/* Status */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                  <Toggle
                    checked={formData.is_active}
                    onChange={(checked: boolean) => updateField('is_active', checked)}
                    disabled={loading}
                    label="Producto activo"
                    description="Visible en el catálogo"
                  />
                  <Toggle
                    checked={formData.is_featured}
                    onChange={(checked: boolean) => updateField('is_featured', checked)}
                    disabled={loading}
                    label="Producto destacado"
                    description="Aparece en destacados"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t rounded-b-2xl">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={
                    isFormValid 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                      : 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-60'
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuickAddModal
        isOpen={modals.category}
        onClose={() => closeModal('category')}
        type="category"
        onSuccess={(id) => handleQuickAddSuccess('category', id)}
      />

      <QuickAddModal
        isOpen={modals.type}
        onClose={() => closeModal('type')}
        type="type"
        onSuccess={(id) => handleQuickAddSuccess('type', id)}
      />

      <QuickAddColorModal
        isOpen={modals.color}
        onClose={() => closeModal('color')}
        onSuccess={(id) => handleQuickAddSuccess('color', id)}
      />
    </>
  )
}
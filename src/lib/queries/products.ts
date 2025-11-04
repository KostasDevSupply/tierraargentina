import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Product, Category, Type } from '@/types'

// ============================================
// QUERY KEYS
// ============================================
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
}

export const typeKeys = {
  all: ['types'] as const,
  lists: () => [...typeKeys.all, 'list'] as const,
}

// ============================================
// FETCH FUNCTIONS
// ============================================

// Obtener todos los productos
async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      type:types(*),
      sizes:product_sizes(*),
      images:product_images(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Product[]
}

// Obtener un producto por ID
async function fetchProductById(id: string): Promise<Product> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      type:types(*),
      sizes:product_sizes(*),
      images:product_images(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Product
}

// Obtener categorías
async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index')

  if (error) throw error
  return data as Category[]
}

// Obtener tipos
async function fetchTypes(): Promise<Type[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('types')
    .select('*')
    .eq('is_active', true)
    .order('order_index')

  if (error) throw error
  return data as Type[]
}

// ============================================
// HOOKS - QUERIES
// ============================================

/**
 * Hook para obtener la lista de productos
 * Incluye relaciones: category, type, sizes, images
 */
export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: fetchProducts,
    staleTime: 30 * 1000, // 30 segundos
  })
}

/**
 * Hook para obtener un producto específico por ID
 * @param id - ID del producto
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener categorías activas
 * Cache largo porque raramente cambian
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener tipos activos
 * Cache largo porque raramente cambian
 */
export function useTypes() {
  return useQuery({
    queryKey: typeKeys.lists(),
    queryFn: fetchTypes,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// ============================================
// HOOKS - MUTATIONS
// ============================================

/**
 * Hook para eliminar un producto
 * Incluye optimistic update y limpieza de imágenes
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      // 1. Obtener imágenes del producto
      const { data: images } = await supabase
        .from('product_images')
        .select('storage_path')
        .eq('product_id', productId)

      // 2. Eliminar imágenes del storage
      if (images && images.length > 0) {
        const paths = images.map((img: { storage_path: string }) => img.storage_path)
        await supabase.storage.from('product-images').remove(paths)
      }

      // 3. Eliminar producto (cascade eliminará sizes e images de DB)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      
      return productId
    },
    
    // Optimistic update - actualizar UI inmediatamente
    onMutate: async (productId) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })

      // Snapshot del estado previo para rollback
      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists())

      // Actualizar cache optimistically
      queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
        old ? old.filter((p) => p.id !== productId) : []
      )

      return { previousProducts }
    },
    
    // Si falla, hacer rollback
    onError: (err, productId, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts)
      }
      toast.error('Error al eliminar el producto')
      console.error('Delete error:', err)
    },
    
    // Al completar exitosamente
    onSuccess: () => {
      toast.success('Producto eliminado correctamente')
    },
    
    // Siempre refetch después de la mutación
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

/**
 * Hook para activar/desactivar un producto
 * Incluye optimistic update
 */
export function useToggleProductActive() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      return { id, isActive }
    },
    
    // Optimistic update
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })
      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists())

      // Actualizar cache
      queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
        old ? old.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)) : []
      )

      return { previousProducts }
    },
    
    // Rollback si falla
    onError: (err, vars, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts)
      }
      toast.error('Error al actualizar el producto')
      console.error('Toggle error:', err)
    },
    
    // Feedback de éxito
    onSuccess: (data) => {
      toast.success(data.isActive ? 'Producto activado' : 'Producto desactivado')
    },
    
    // Refetch
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

/**
 * Hook para marcar/desmarcar un producto como destacado
 */
export function useToggleProductFeatured() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_featured: isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      return { id, isFeatured }
    },
    
    onMutate: async ({ id, isFeatured }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })
      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists())

      queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
        old ? old.map((p) => (p.id === id ? { ...p, is_featured: isFeatured } : p)) : []
      )

      return { previousProducts }
    },
    
    onError: (err, vars, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts)
      }
      toast.error('Error al actualizar el producto')
    },
    
    onSuccess: (data) => {
      toast.success(data.isFeatured ? 'Producto marcado como destacado' : 'Producto desmarcado como destacado')
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
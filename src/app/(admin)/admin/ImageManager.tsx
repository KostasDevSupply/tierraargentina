'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { ProductImage } from '@/types'

interface ImageManagerProps {
  productId: string | null
  initialImages?: ProductImage[]
  onImagesChange?: (images: ProductImage[]) => void
}

interface UploadingFile {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  tempId: string
  retries?: number
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = {
  'image/*': ['.jpeg', '.jpg', '.png', '.webp']
}
const UPLOAD_DELAY_MS = 500
const SUCCESS_MESSAGE_DELAY_MS = 2000
const MAX_RETRIES = 3
const SESSION_REFRESH_INTERVAL = 5 // Refrescar cada 5 uploads

export default function ImageManager({
  productId,
  initialImages = [],
  onImagesChange
}: ImageManagerProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [images, setImages] = useState<ProductImage[]>(initialImages)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ✅ FIX: Sincronizar con initialImages
  useEffect(() => {
    setImages(initialImages)
  }, [initialImages])

  // ✅ FIX: Notificar cambios FUERA del render usando useEffect
  useEffect(() => {
    onImagesChange?.(images)
  }, [images, onImagesChange])

  // Estadísticas
  const uploadStats = useMemo(() => ({
    isUploading: uploadingFiles.length > 0,
    uploadedCount: uploadingFiles.filter(f => f.status === 'success').length,
    errorCount: uploadingFiles.filter(f => f.status === 'error').length,
    totalCount: uploadingFiles.length,
    progress: uploadingFiles.length > 0
      ? (uploadingFiles.filter(f => f.status === 'success').length / uploadingFiles.length) * 100
      : 0
  }), [uploadingFiles])

  // Imágenes ordenadas
  const sortedImages = useMemo(() =>
    [...images].sort((a, b) => a.order_index - b.order_index),
    [images]
  )

  // ✅ Refrescar sesión con control de timing
  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) throw error
      console.log('✅ Sesión refrescada')
      return true
    } catch (error) {
      console.error('❌ Error refrescando sesión:', error)
      return false
    }
  }, [supabase])

  // ✅ Upload con retry automático
  const handleUpload = useCallback(async (
    file: File, 
    tempId: string, 
    retryCount = 0
  ): Promise<ProductImage> => {
    try {
      if (retryCount > 0) {
        setUploadingFiles(prev => prev.map(f =>
          f.tempId === tempId ? { ...f, retries: retryCount } : f
        ))
      }

      const formData = new FormData()
      formData.append('file', file)
      if (productId) formData.append('productId', productId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      // Token expirado
      if (response.status === 401) {
        if (retryCount < MAX_RETRIES) {
          console.log(`🔄 Token expirado. Refrescando... (${retryCount + 1}/${MAX_RETRIES})`)
          const refreshed = await refreshSession()
          if (refreshed) {
            await new Promise(r => setTimeout(r, 1000))
            return handleUpload(file, tempId, retryCount + 1)
          }
        }
        throw new Error('Sesión expirada. Recarga la página.')
      }

      // Rate limit
      if (response.status === 429) {
        if (retryCount < MAX_RETRIES) {
          const wait = 2000 * Math.pow(1.5, retryCount)
          console.log(`⏳ Rate limit. Esperando ${Math.round(wait)}ms...`)
          await new Promise(r => setTimeout(r, wait))
          return handleUpload(file, tempId, retryCount + 1)
        }
        throw new Error('Servidor ocupado. Intenta más tarde.')
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al subir')
      }

      return {
        id: result.image?.id,
        url: result.image?.url || result.url,
        filename: result.image?.filename || file.name,
        order_index: images.length,
        is_primary: images.length === 0,
      } as ProductImage
    } catch (error: any) {
      if (retryCount < MAX_RETRIES && !error.message.includes('Recarga')) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
        return handleUpload(file, tempId, retryCount + 1)
      }
      throw error
    }
  }, [productId, images.length, refreshSession])

  // ✅ Drop handler SIN límites
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    console.log('📦 Iniciando subida de', acceptedFiles.length, 'archivos')
    
    // Refrescar sesión al inicio
    await refreshSession()

    const filesWithStatus: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      status: 'pending',
      tempId: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      retries: 0
    }))

    setUploadingFiles(filesWithStatus)

    let successCount = 0

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      const tempId = filesWithStatus[i].tempId

      setUploadingFiles(prev => prev.map(f =>
        f.tempId === tempId ? { ...f, status: 'uploading' } : f
      ))

      try {
        const newImage = await handleUpload(file, tempId)

        setUploadingFiles(prev => prev.map(f =>
          f.tempId === tempId ? { ...f, status: 'success' } : f
        ))

        // ✅ Actualizar sin llamar callback directamente
        setImages(prev => [...prev, newImage])
        
        successCount++
        console.log(`✅ ${successCount}/${acceptedFiles.length}: ${file.name}`)
      } catch (error: any) {
        console.error(`❌ ${file.name}:`, error)

        setUploadingFiles(prev => prev.map(f =>
          f.tempId === tempId
            ? { ...f, status: 'error', error: error.message }
            : f
        ))

        toast.error(`Error: ${file.name}`, { duration: 3000 })
      }

      // Delay entre uploads
      if (i < acceptedFiles.length - 1) {
        await new Promise(r => setTimeout(r, UPLOAD_DELAY_MS))
      }

      // ✅ Refrescar sesión preventivamente cada N uploads
      if ((i + 1) % SESSION_REFRESH_INTERVAL === 0 && i < acceptedFiles.length - 1) {
        console.log('🔄 Refrescando sesión preventiva...')
        await refreshSession()
      }
    }

    // Mensaje final
    setTimeout(() => {
      const errorCount = uploadingFiles.filter(f => f.status === 'error').length
      if (errorCount === 0) {
        toast.success(`✅ ${successCount} imágenes subidas`, { duration: 4000 })
      } else {
        toast.error(`⚠️ ${successCount} ok, ${errorCount} errores`, { duration: 5000 })
      }
      
      setUploadingFiles([])
      if (productId) router.refresh()
    }, SUCCESS_MESSAGE_DELAY_MS)

  }, [handleUpload, productId, router, refreshSession, uploadingFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    disabled: uploadStats.isUploading,
    multiple: true
  })

  // ✅ Eliminar imagen
  const handleDelete = useCallback(async (imageId: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return

    setDeletingId(imageId)

    try {
      if (!productId) {
        setImages(prev => prev.filter(img => img.id !== imageId))
        return
      }

      const { data: imageData } = await supabase
        .from('product_images')
        .select('storage_path')
        .eq('id', imageId)
        .single()

      if (imageData?.storage_path) {
        await supabase.storage
          .from('product-images')
          .remove([imageData.storage_path])
      }

      await supabase.from('product_images').delete().eq('id', imageId)

      setImages(prev => prev.filter(img => img.id !== imageId))

      toast.success('Imagen eliminada')
      router.refresh()
    } catch (error: any) {
      console.error('Error al eliminar:', error)
      toast.error('Error al eliminar imagen')
    } finally {
      setDeletingId(null)
    }
  }, [productId, supabase, router])

  // ✅ Mover imagen
  const handleMove = useCallback(async (imageId: string, direction: 'left' | 'right') => {
    const currentIndex = images.findIndex(img => img.id === imageId)
    if (currentIndex === -1) return

    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const reordered = [...images]
    const [movedImage] = reordered.splice(currentIndex, 1)
    reordered.splice(newIndex, 0, movedImage)

    const updated = reordered.map((img, idx) => ({ ...img, order_index: idx }))

    setImages(updated)

    if (!productId) return

    try {
      await Promise.all(
        updated
          .filter(img => img.id)
          .map(img =>
            supabase
              .from('product_images')
              .update({ order_index: img.order_index })
              .eq('id', img.id!)
          )
      )
      toast.success('Orden actualizado')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al reordenar')
      setImages(images)
    }
  }, [images, productId, supabase])

  // ✅ Marcar principal
  const handleSetPrimary = useCallback(async (imageId: string) => {
    const updated = images.map(img => ({
      ...img,
      is_primary: img.id === imageId
    }))

    setImages(updated)

    if (!productId) return

    try {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)

      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId)

      toast.success('Imagen principal actualizada')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al marcar principal')
      setImages(images)
    }
  }, [images, productId, supabase, router])

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${uploadStats.isUploading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          {uploadStats.isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 mb-4 animate-spin" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Subiendo {uploadStats.uploadedCount} de {uploadStats.totalCount}
              </p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadStats.progress}%` }}
                />
              </div>
              {uploadStats.errorCount > 0 && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {uploadStats.errorCount} error(es)
                </p>
              )}
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full mb-4 transition-colors ${
                isDragActive ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <Upload className={`w-8 h-8 ${
                  isDragActive ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <p className="text-base font-semibold text-gray-700 mb-1">
                {isDragActive ? '¡Suelta las imágenes aquí!' : 'Arrastra imágenes o haz click'}
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG o WebP • Máximo 5MB por archivo
              </p>
            </>
          )}
        </div>
      </div>

      {/* Archivos subiendo */}
      {uploadingFiles.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            ⏳ Subiendo ({uploadStats.uploadedCount}/{uploadStats.totalCount})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadingFiles.map((file) => (
              <div
                key={file.tempId}
                className="relative bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {file.status === 'pending' && (
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Esperando...</p>
                    </div>
                  )}

                  {file.status === 'uploading' && (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-600 font-medium">Subiendo...</p>
                      {file.retries && file.retries > 0 && (
                        <p className="text-xs text-amber-600 mt-1">Intento {file.retries}/{MAX_RETRIES}</p>
                      )}
                    </div>
                  )}

                  {file.status === 'success' && (
                    <div className="text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-xs text-green-600 font-medium">¡Listo!</p>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className="text-center px-4">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                      <p className="text-xs text-red-600 font-medium">Error</p>
                      <p className="text-xs text-red-500 mt-1 line-clamp-2">{file.error}</p>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2 bg-gray-50 border-t">
                  <p className="text-xs text-gray-600 truncate" title={file.file.name}>
                    {file.file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grid de imágenes */}
      {sortedImages.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Imágenes ({sortedImages.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedImages.map((image, index) => (
              <article
                key={image.id || `temp-${index}`}
                className={`
                  group relative bg-white border-2 rounded-xl overflow-hidden transition-all
                  ${deletingId === image.id
                    ? 'opacity-50 scale-95'
                    : 'hover:border-blue-400 hover:shadow-lg'
                  }
                `}
              >
                <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={image.url}
                    alt={image.filename || `Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {image.is_primary && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Principal</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-gray-900/80 text-white text-xs font-semibold w-7 h-7 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>

                <div className="px-3 py-2.5 bg-gray-50 border-t">
                  <p className="text-xs text-gray-600 truncate font-medium" title={image.filename}>
                    {image.filename || `imagen-${index + 1}`}
                  </p>
                </div>

                <div className="p-2 bg-white border-t">
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => image.id && handleMove(image.id, 'left')}
                      disabled={index === 0 || deletingId === image.id || !image.id}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Mover izquierda"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700 mx-auto" />
                    </button>

                    <button
                      type="button"
                      onClick={() => image.id && handleSetPrimary(image.id)}
                      disabled={image.is_primary || deletingId === image.id || !image.id}
                      className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Marcar como principal"
                    >
                      <Star className={`w-4 h-4 mx-auto ${
                        image.is_primary
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-yellow-600'
                      }`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => image.id && handleDelete(image.id)}
                      disabled={deletingId === image.id || !image.id}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Eliminar imagen"
                    >
                      {deletingId === image.id ? (
                        <Loader2 className="w-4 h-4 text-red-600 mx-auto animate-spin" />
                      ) : (
                        <X className="w-4 h-4 text-red-600 mx-auto" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => image.id && handleMove(image.id, 'right')}
                      disabled={index === sortedImages.length - 1 || deletingId === image.id || !image.id}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Mover derecha"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700 mx-auto" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {sortedImages.length === 0 && uploadingFiles.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <div className="inline-flex p-4 bg-gray-200 rounded-full mb-4">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Sin imágenes todavía
          </h3>
          <p className="text-sm text-gray-500">
            Arrastra o selecciona archivos para empezar
          </p>
        </div>
      )}
    </div>
  )
}
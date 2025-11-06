'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, Image as ImageIcon, Star, ChevronLeft, ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProductImage {
  id: string
  url: string
  filename: string
  order_index: number
  is_primary: boolean
}

interface ImageManagerProps {
  productId: string
  initialImages?: ProductImage[]
  onImagesChange?: (images: ProductImage[]) => void
}

interface UploadingFile {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
  tempId: string
}

export default function ImageManager({ 
  productId, 
  initialImages = [],
  onImagesChange 
}: ImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Drag & drop con progreso mejorado
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('📦 Uploading', acceptedFiles.length, 'files')
    
    if (acceptedFiles.length === 0) return

    // Crear lista de archivos en proceso
    const filesWithStatus: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      status: 'pending',
      tempId: `temp-${Date.now()}-${Math.random()}`
    }))

    setUploadingFiles(filesWithStatus)

    // Subir archivos uno por uno
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      const tempId = filesWithStatus[i].tempId

      // Marcar como "uploading"
      setUploadingFiles(prev => prev.map(f => 
        f.tempId === tempId ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('productId', productId)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (response.status === 401) {
          setUploadingFiles(prev => prev.map(f => 
            f.tempId === tempId ? { ...f, status: 'error', error: 'Sesión expirada' } : f
          ))
          alert('Tu sesión expiró. Por favor recarga la página.')
          return
        }

        const result = await response.json()

        if (response.ok && result.success) {
          // Marcar como éxito
          setUploadingFiles(prev => prev.map(f => 
            f.tempId === tempId ? { ...f, status: 'success', progress: 100 } : f
          ))

          // Agregar a la lista de imágenes
          setImages(prev => {
            const newImages = [...prev, result.image]
            onImagesChange?.(newImages)
            return newImages
          })

          console.log('✅ Uploaded:', file.name)
        } else {
          // Marcar como error
          setUploadingFiles(prev => prev.map(f => 
            f.tempId === tempId ? { ...f, status: 'error', error: result.error } : f
          ))
          console.error('❌ Error:', result.error)
        }
      } catch (error) {
        setUploadingFiles(prev => prev.map(f => 
          f.tempId === tempId ? { ...f, status: 'error', error: 'Error de conexión' } : f
        ))
        console.error('💥 Exception:', error)
      }

      // Pequeña pausa entre archivos para no saturar
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    // Limpiar lista después de 3 segundos
    setTimeout(() => {
      setUploadingFiles([])
      router.refresh()
    }, 3000)

  }, [productId, router, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    disabled: uploadingFiles.length > 0
  })

  // Eliminar imagen
  const handleDelete = async (imageId: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return

    setDeletingId(imageId)
    
    try {
      const { data: image } = await supabase
        .from('product_images')
        .select('storage_path, product_id')
        .eq('id', imageId)
        .single()

      if (!image) {
        alert('Imagen no encontrada')
        setDeletingId(null)
        return
      }

      // Eliminar de Storage
      await supabase.storage
        .from('product-images')
        .remove([image.storage_path])

      // Eliminar de DB
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (error) {
        alert(`Error: ${error.message}`)
        setDeletingId(null)
        return
      }

      const newImages = images.filter(img => img.id !== imageId)
      setImages(newImages)
      onImagesChange?.(newImages)
      router.refresh()
      
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error al eliminar')
    }
    
    setDeletingId(null)
  }

  // Mover imagen
  const moveImage = async (imageId: string, direction: 'left' | 'right') => {
    const currentIndex = images.findIndex(img => img.id === imageId)
    if (currentIndex === -1) return

    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const newImages = [...images]
    const [movedImage] = newImages.splice(currentIndex, 1)
    newImages.splice(newIndex, 0, movedImage)

    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      order_index: idx
    }))

    setImages(updatedImages)
    onImagesChange?.(updatedImages)

    try {
      const updates = updatedImages.map((img) => 
        supabase
          .from('product_images')
          .update({ order_index: img.order_index })
          .eq('id', img.id)
      )
      await Promise.all(updates)
    } catch (error) {
      console.error('Error reordering:', error)
      setImages(images)
    }
  }

  // Marcar como principal
  const handleSetPrimary = async (imageId: string) => {
    try {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)

      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId)

      if (error) {
        alert(`Error: ${error.message}`)
        return
      }

      const updatedImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))
      
      setImages(updatedImages)
      onImagesChange?.(updatedImages)
      router.refresh()
      
    } catch (error) {
      console.error('Error setting primary:', error)
    }
  }

  const sortedImages = [...images].sort((a, b) => a.order_index - b.order_index)
  const isUploading = uploadingFiles.length > 0
  const uploadedCount = uploadingFiles.filter(f => f.status === 'success').length
  const totalCount = uploadingFiles.length

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
          ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 mb-4 animate-spin" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Subiendo {uploadedCount} de {totalCount}
              </p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(uploadedCount / totalCount) * 100}%` }} 
                />
              </div>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full mb-4 transition-colors ${isDragActive ? 'bg-blue-500' : 'bg-gray-100'}`}>
                <Upload className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <p className="text-base font-semibold text-gray-700 mb-1">
                {isDragActive ? '¡Suelta las imágenes aquí!' : 'Arrastra imágenes o haz click'}
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG o WebP • Máximo 5MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Skeletons de archivos subiendo */}
      {uploadingFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            ⏳ Subiendo ({uploadedCount}/{totalCount})
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
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
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
        </div>
      )}

      {/* Grid de imágenes subidas */}
      {sortedImages.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            ✅ Imágenes ({sortedImages.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedImages.map((image, index) => (
              <div
                key={image.id}
                className={`
                  group relative bg-white border-2 rounded-xl overflow-hidden transition-all
                  ${deletingId === image.id ? 'opacity-50 scale-95' : 'hover:border-blue-400 hover:shadow-lg'}
                `}
              >
                <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
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
                    {image.filename}
                  </p>
                </div>

                <div className="p-2 bg-white border-t">
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveImage(image.id, 'left')}
                      disabled={index === 0 || deletingId === image.id}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover izquierda"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700 mx-auto" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetPrimary(image.id)}
                      disabled={image.is_primary || deletingId === image.id}
                      className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Marcar principal"
                    >
                      <Star className={`w-4 h-4 mx-auto ${image.is_primary ? 'fill-yellow-500 text-yellow-500' : 'text-yellow-600'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(image.id)}
                      disabled={deletingId === image.id}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 active:scale-95 disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === image.id ? (
                        <Loader2 className="w-4 h-4 text-red-600 mx-auto animate-spin" />
                      ) : (
                        <X className="w-4 h-4 text-red-600 mx-auto" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => moveImage(image.id, 'right')}
                      disabled={index === sortedImages.length - 1 || deletingId === image.id}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover derecha"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
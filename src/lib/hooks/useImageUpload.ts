/**
 * useImageUpload - Custom Hook para Upload Inteligente de Imágenes
 * 
 * Features:
 * - Upload paralelo controlado (3 simultáneos)
 * - Retry automático con exponential backoff
 * - Token refresh proactivo
 * - Cancelación de uploads en progreso
 * - Progress tracking detallado
 * - Rate limiting adaptativo
 * 
 * @author kostasDev
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { TokenManager } from '../TokenManager'
import type { ProductImage } from '@/types'

// ============================================
// TYPES & INTERFACES
// ============================================

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled'

export interface UploadingFile {
  file: File
  status: UploadStatus
  error?: string
  tempId: string
  retries: number
  progress: number
}

export interface UploadStats {
  isUploading: boolean
  uploadedCount: number
  errorCount: number
  cancelledCount: number
  totalCount: number
  progress: number
}

export interface UploadOptions {
  productId: string | null
  maxConcurrent?: number
  maxRetries?: number
  baseDelay?: number
  onSuccess?: (image: ProductImage) => void
  onError?: (filename: string, error: string) => void
  onComplete?: (stats: UploadStats) => void
}

// ============================================
// CONSTANTS
// ============================================

const MAX_CONCURRENT_UPLOADS = 3
const MAX_RETRIES = 3
const BASE_DELAY_MS = 500
const RATE_LIMIT_BACKOFF_MS = 2000
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// ============================================
// HOOK
// ============================================

export function useImageUpload(
  supabase: SupabaseClient,
  options: UploadOptions
) {
  const {
    productId,
    maxConcurrent = MAX_CONCURRENT_UPLOADS,
    maxRetries = MAX_RETRIES,
    baseDelay = BASE_DELAY_MS,
    onSuccess,
    onError,
    onComplete,
  } = options

  // State
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Refs para control
  const abortControllerRef = useRef<AbortController | null>(null)
  const tokenManagerRef = useRef<TokenManager | null>(null)
  const queueRef = useRef<UploadingFile[]>([])
  const activeUploadsRef = useRef<number>(0)

  // Inicializar Token Manager
  if (!tokenManagerRef.current) {
    tokenManagerRef.current = new TokenManager(supabase)
  }

  // ============================================
  // COMPUTED STATS
  // ============================================

  const stats = useMemo<UploadStats>(() => {
    const uploadedCount = uploadingFiles.filter(f => f.status === 'success').length
    const errorCount = uploadingFiles.filter(f => f.status === 'error').length
    const cancelledCount = uploadingFiles.filter(f => f.status === 'cancelled').length
    const totalCount = uploadingFiles.length

    return {
      isUploading,
      uploadedCount,
      errorCount,
      cancelledCount,
      totalCount,
      progress: totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0,
    }
  }, [uploadingFiles, isUploading])

  // ============================================
  // UPLOAD INDIVIDUAL FILE
  // ============================================

  const uploadSingleFile = useCallback(
    async (file: File, tempId: string, retryCount: number = 0): Promise<ProductImage> => {
      const tokenManager = tokenManagerRef.current!

      // Verificar sesión antes de subir
      const sessionValid = await tokenManager.ensureValidSession()
      if (!sessionValid) {
        throw new Error('Sesión expirada. Por favor recarga la página.')
      }

      // Actualizar estado a uploading
      setUploadingFiles(prev =>
        prev.map(f =>
          f.tempId === tempId
            ? { ...f, status: 'uploading', retries: retryCount, progress: 0 }
            : f
        )
      )

      try {
        const formData = new FormData()
        formData.append('file', file)
        if (productId) {
          formData.append('productId', productId)
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          signal: abortControllerRef.current?.signal,
        })

        // Manejo de errores HTTP
        if (!response.ok) {
          // Token expirado
          if (response.status === 401) {
            if (retryCount < maxRetries) {
              console.log(`🔄 Token expirado. Retry ${retryCount + 1}/${maxRetries}`)
              await tokenManager.forceRefresh()
              await new Promise(resolve => setTimeout(resolve, 1000))
              return uploadSingleFile(file, tempId, retryCount + 1)
            }
            throw new Error('Sesión expirada. Recarga la página.')
          }

          // Rate limit
          if (response.status === 429) {
            if (retryCount < maxRetries) {
              const waitTime = RATE_LIMIT_BACKOFF_MS * Math.pow(2, retryCount)
              console.log(`⏳ Rate limit. Esperando ${waitTime}ms...`)
              await new Promise(resolve => setTimeout(resolve, waitTime))
              return uploadSingleFile(file, tempId, retryCount + 1)
            }
            throw new Error('Servidor ocupado. Intenta más tarde.')
          }

          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Error al subir archivo')
        }

        // Actualizar progreso a 100%
        setUploadingFiles(prev =>
          prev.map(f =>
            f.tempId === tempId ? { ...f, progress: 100 } : f
          )
        )

        return {
          id: result.image?.id,
          product_id: productId || undefined,
          url: result.image?.url || result.url,
          filename: result.image?.filename || file.name,
          storage_path: result.image?.storage_path,
          order_index: result.image?.order_index || 0,
          is_primary: result.image?.is_primary || false,
          created_at: result.image?.created_at,
        } as ProductImage

      } catch (error: any) {
        // Si fue cancelado, no reintentar
        if (error.name === 'AbortError') {
          throw new Error('Upload cancelado')
        }

        // Retry para errores temporales
        if (retryCount < maxRetries && !error.message.includes('Recarga')) {
          const waitTime = BASE_DELAY_MS * Math.pow(2, retryCount)
          console.log(`🔄 Retry ${retryCount + 1}/${maxRetries} después de ${waitTime}ms`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          return uploadSingleFile(file, tempId, retryCount + 1)
        }

        throw error
      }
    },
    [productId, maxRetries, baseDelay]
  )

  // ============================================
  // PROCESS QUEUE (PARALLEL)
  // ============================================

  const processQueue = useCallback(async () => {
    const tokenManager = tokenManagerRef.current!

    while (queueRef.current.length > 0 && activeUploadsRef.current < maxConcurrent) {
      const fileToUpload = queueRef.current.shift()
      if (!fileToUpload) break

      activeUploadsRef.current++

      // Upload sin await (paralelo)
      uploadSingleFile(fileToUpload.file, fileToUpload.tempId)
        .then(async (newImage) => {
          // Success
          setUploadingFiles(prev =>
            prev.map(f =>
              f.tempId === fileToUpload.tempId
                ? { ...f, status: 'success', progress: 100 }
                : f
            )
          )

          onSuccess?.(newImage)

          console.log(`✅ Upload exitoso: ${fileToUpload.file.name}`)

          // Refresh token cada 3 uploads exitosos
          if (stats.uploadedCount > 0 && stats.uploadedCount % 3 === 0) {
            await tokenManager.refreshIfNeeded()
          }
        })
        .catch((error) => {
          // Error
          const errorMessage = error.message || 'Error desconocido'
          
          setUploadingFiles(prev =>
            prev.map(f =>
              f.tempId === fileToUpload.tempId
                ? { ...f, status: 'error', error: errorMessage }
                : f
            )
          )

          onError?.(fileToUpload.file.name, errorMessage)

          console.error(`❌ Upload fallido: ${fileToUpload.file.name}`, error)
        })
        .finally(() => {
          activeUploadsRef.current--
          // Continuar procesando queue
          processQueue()
        })

      // Delay entre lanzamiento de uploads
      await new Promise(resolve => setTimeout(resolve, BASE_DELAY_MS))
    }

    // Si no hay más archivos en cola y no hay uploads activos, terminar
    if (queueRef.current.length === 0 && activeUploadsRef.current === 0) {
      setIsUploading(false)
      onComplete?.(stats)
    }
  }, [maxConcurrent, uploadSingleFile, onSuccess, onError, onComplete, stats])

  // ============================================
  // START UPLOAD
  // ============================================

  const startUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return

      console.log(`📦 Iniciando upload de ${files.length} archivo(s)`)

      const tokenManager = tokenManagerRef.current!

      // Validar tamaños
      const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE)
      if (oversizedFiles.length > 0) {
        const names = oversizedFiles.map(f => f.name).join(', ')
        throw new Error(`Archivos muy grandes (máx 5MB): ${names}`)
      }

      // Refrescar sesión antes de empezar
      await tokenManager.ensureValidSession()

      // Crear AbortController para poder cancelar
      abortControllerRef.current = new AbortController()

      // Preparar archivos con metadata
      const filesWithStatus: UploadingFile[] = files.map(file => ({
        file,
        status: 'pending',
        tempId: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        retries: 0,
        progress: 0,
      }))

      setUploadingFiles(filesWithStatus)
      setIsUploading(true)

      // Agregar a la cola
      queueRef.current = [...filesWithStatus]

      // Comenzar procesamiento paralelo
      await processQueue()
    },
    [processQueue]
  )

  // ============================================
  // CANCEL UPLOAD
  // ============================================

  const cancelUpload = useCallback(() => {
    console.log('🛑 Cancelando uploads...')

    // Abortar requests HTTP en progreso
    abortControllerRef.current?.abort()

    // Limpiar cola
    queueRef.current = []
    activeUploadsRef.current = 0

    // Marcar archivos como cancelados
    setUploadingFiles(prev =>
      prev.map(f =>
        f.status === 'pending' || f.status === 'uploading'
          ? { ...f, status: 'cancelled' }
          : f
      )
    )

    setIsUploading(false)
  }, [])

  // ============================================
  // RETRY FAILED
  // ============================================

  const retryFailed = useCallback(() => {
    const failedFiles = uploadingFiles.filter(f => f.status === 'error')

    if (failedFiles.length === 0) return

    console.log(`🔄 Reintentando ${failedFiles.length} archivo(s) fallido(s)`)

    // Resetear estado de archivos fallidos
    setUploadingFiles(prev =>
      prev.map(f =>
        f.status === 'error'
          ? { ...f, status: 'pending', error: undefined, retries: 0 }
          : f
      )
    )

    // Agregar a la cola
    queueRef.current = failedFiles.map(f => ({ ...f, status: 'pending', retries: 0 }))

    setIsUploading(true)
    processQueue()
  }, [uploadingFiles, processQueue])

  // ============================================
  // CLEAR
  // ============================================

  const clearCompleted = useCallback(() => {
    setUploadingFiles(prev =>
      prev.filter(f => f.status !== 'success')
    )
  }, [])

  // ============================================
  // RETURN
  // ============================================

  return {
    uploadingFiles,
    stats,
    isUploading,
    startUpload,
    cancelUpload,
    retryFailed,
    clearCompleted,
  }
}
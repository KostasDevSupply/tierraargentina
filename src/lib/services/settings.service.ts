import { cache } from "react"
import { createClient } from "../supabase/server"

// ============================================
// SITE SETTINGS
// ============================================
export const getSiteSettings = cache(async () => {
  const supabase = await createClient()

  const { data } = await supabase
    .from('site_settings')
    .select('setting_key, setting_value')

  if (!data) return {}

  return data.reduce((acc, item) => {
    acc[item.setting_key] = item.setting_value
    return acc
  }, {} as Record<string, string>)
})

// ============================================
// ANNOUNCEMENT BAR
// ============================================

/**
 * Obtiene todos los anuncios activos (máximo 5)
 * Ordenados por order_index y fecha de creación
 */
export const getActiveAnnouncements = cache(async () => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching active announcements:', error)
    return { data: null, error }
  }

  return { data, error: null }
})

/**
 * Obtiene TODOS los anuncios (para admin)
 */
export const getAllAnnouncements = cache(async () => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all announcements:', error)
    return { data: null, error }
  }

  return { data, error: null }
})

/**
 * Obtiene UN SOLO anuncio activo (compatibilidad con código legacy)
 * DEPRECATED: Usar getActiveAnnouncements() para múltiples anuncios
 */
export const getAnnouncementBar = cache(async () => {
  const supabase = await createClient()

  return supabase
    .from('announcement_bar')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
})

/**
 * Obtiene un anuncio específico por ID
 */
export const getAnnouncementById = cache(async (id: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching announcement:', error)
    return { data: null, error }
  }

  return { data, error: null }
})

/**
 * Cuenta cuántos anuncios existen
 */
export const getAnnouncementsCount = cache(async () => {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('announcement_bar')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting announcements:', error)
    return { count: 0, error }
  }

  return { count: count || 0, error: null }
})
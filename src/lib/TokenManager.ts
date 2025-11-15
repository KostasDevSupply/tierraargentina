/**
 * Token Manager - Gestión Inteligente de Sesiones de Supabase
 * 
 * Responsabilidades:
 * - Verificar tiempo de expiración del token
 * - Refrescar sesión proactivamente antes de expirar
 * - Prevenir errores 401 durante operaciones largas
 * 
 * @author kostasDev
 * @version 1.0.0
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface TokenStatus {
  isValid: boolean
  expiresAt: number | null
  expiresInSeconds: number | null
  needsRefresh: boolean
}

/**
 * Clase para gestionar tokens de Supabase de forma inteligente
 */
export class TokenManager {
  private supabase: SupabaseClient
  private lastRefreshTime: number = 0
  private readonly MIN_REFRESH_INTERVAL = 5000 // 5 segundos entre refreshes
  private readonly TOKEN_EXPIRY_THRESHOLD = 300 // Refrescar si quedan menos de 5 minutos

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Obtiene el estado actual del token
   */
  async getTokenStatus(): Promise<TokenStatus> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()

      if (error || !session) {
        return {
          isValid: false,
          expiresAt: null,
          expiresInSeconds: null,
          needsRefresh: true,
        }
      }

      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      const expiresInSeconds = expiresAt - now

      return {
        isValid: expiresInSeconds > 0,
        expiresAt,
        expiresInSeconds,
        needsRefresh: expiresInSeconds < this.TOKEN_EXPIRY_THRESHOLD,
      }
    } catch (error) {
      console.error('❌ Error obteniendo estado del token:', error)
      return {
        isValid: false,
        expiresAt: null,
        expiresInSeconds: null,
        needsRefresh: true,
      }
    }
  }

  /**
   * Refresca la sesión si es necesario
   * Incluye throttling para evitar múltiples refreshes consecutivos
   */
  async refreshIfNeeded(): Promise<boolean> {
    const now = Date.now()

    // Throttling: no refrescar si ya se hizo hace poco
    if (now - this.lastRefreshTime < this.MIN_REFRESH_INTERVAL) {
      console.log('⏭️ Refresh omitido (throttled)')
      return true
    }

    const status = await this.getTokenStatus()

    if (!status.needsRefresh) {
      console.log(`✅ Token válido (expira en ${status.expiresInSeconds}s)`)
      return true
    }

    console.log('🔄 Token necesita refresh...')
    return await this.forceRefresh()
  }

  /**
   * Fuerza un refresh del token sin verificaciones previas
   */
  async forceRefresh(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()

      if (error) {
        console.error('❌ Error refrescando sesión:', error.message)
        return false
      }

      if (!data.session) {
        console.error('❌ No se obtuvo sesión después del refresh')
        return false
      }

      this.lastRefreshTime = Date.now()
      console.log('✅ Sesión refrescada exitosamente')
      return true
    } catch (error) {
      console.error('❌ Error inesperado al refrescar:', error)
      return false
    }
  }

  /**
   * Verifica si la sesión es válida antes de una operación importante
   * Si no es válida, intenta refrescarla
   */
  async ensureValidSession(): Promise<boolean> {
    const status = await this.getTokenStatus()

    if (status.isValid && !status.needsRefresh) {
      return true
    }

    console.log('⚠️ Sesión requiere refresh antes de continuar')
    return await this.forceRefresh()
  }

  /**
   * Verifica si quedan suficientes segundos antes de una operación larga
   * @param estimatedDurationSeconds - Duración estimada de la operación
   */
  async hasEnoughTime(estimatedDurationSeconds: number): Promise<boolean> {
    const status = await this.getTokenStatus()

    if (!status.expiresInSeconds) {
      return false
    }

    // Agregar margen de seguridad del 50%
    const requiredTime = estimatedDurationSeconds * 1.5

    return status.expiresInSeconds > requiredTime
  }
}

/**
 * Factory function para crear instancia de TokenManager
 */
export function createTokenManager(supabase: SupabaseClient): TokenManager {
  return new TokenManager(supabase)
}

/**
 * AuthService — Clase base para todas las peticiones al backend de Ona Nails.
 *
 * Gestiona:
 *  - Almacenamiento de token (15 min) y refresh token (30 días) en localStorage
 *  - Inyección automática del header Authorization en los endpoints protegidos
 *  - Detección de token próximo a caducar antes de cada petición
 *  - Refresco transparente de sesión ante un 401 (con deduplicación de llamadas concurrentes)
 *  - Logout automático cuando el refresh token caduca, redirigiendo al login
 */

// En desarrollo el proxy de Vite intercepta /v1.0/* y lo reenvía al backend
// (configurado en vite.config.js con VITE_API_URL). BASE_URL queda vacío para
// que las peticiones salgan al mismo origen y el proxy las capture.
// En producción se puede sobreescribir con VITE_PUBLIC_API_URL si el backend
// está en un dominio distinto al del frontend.
const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL ?? ''

const STORAGE_KEYS = {
  token: 'ona_token',
  tokenExpiry: 'ona_token_expiry',
  refreshToken: 'ona_refresh_token',
  refreshExpiry: 'ona_refresh_expiry',
  user: 'ona_user',
}

// Margen antes de la expiración del token en el que ya se considera caducado
const TOKEN_EXPIRY_BUFFER_MS = 30_000   // 30 segundos
const TOKEN_DURATION_MS      = 15 * 60 * 1000             // 15 minutos
const REFRESH_DURATION_MS    = 30 * 24 * 60 * 60 * 1000  // 30 días

export class AuthService {
  constructor() {
    /** Promesa de refresco en vuelo para evitar llamadas concurrentes */
    this._refreshPromise = null
  }

  // ─── Gestión de tokens ────────────────────────────────────────────────────

  setTokens(token, refreshToken) {
    const now = Date.now()
    localStorage.setItem(STORAGE_KEYS.token,         token)
    localStorage.setItem(STORAGE_KEYS.tokenExpiry,   now + TOKEN_DURATION_MS)
    localStorage.setItem(STORAGE_KEYS.refreshToken,  refreshToken)
    localStorage.setItem(STORAGE_KEYS.refreshExpiry, now + REFRESH_DURATION_MS)
  }

  clearTokens() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  }

  getToken()        { return localStorage.getItem(STORAGE_KEYS.token) }
  getRefreshToken() { return localStorage.getItem(STORAGE_KEYS.refreshToken) }

  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
  }

  getUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    return raw ? JSON.parse(raw) : null
  }

  /** El token es considerado expirado 30 s antes de su vencimiento real */
  isTokenExpired() {
    const expiry = localStorage.getItem(STORAGE_KEYS.tokenExpiry)
    if (!expiry) return true
    return Date.now() >= parseInt(expiry) - TOKEN_EXPIRY_BUFFER_MS
  }

  isRefreshTokenExpired() {
    const expiry = localStorage.getItem(STORAGE_KEYS.refreshExpiry)
    if (!expiry) return true
    return Date.now() >= parseInt(expiry)
  }

  isAuthenticated() {
    return !!this.getToken() && !this.isRefreshTokenExpired()
  }

  // ─── IP del cliente ───────────────────────────────────────────────────────

  async _getClientIp() {
    try {
      const res  = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      return data.ip
    } catch {
      return '127.0.0.1'
    }
  }

  // ─── Login / Logout / Refresh ─────────────────────────────────────────────

  /**
   * Inicia sesión. Obtiene la IP pública del cliente y el user-agent
   * automáticamente, tal como requiere la API.
   */
  async login(email, password) {
    const [ip_address] = await Promise.all([this._getClientIp()])
    const user_agent   = navigator.userAgent

    const res  = await fetch(`${BASE_URL}/v1.0/login/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password, ip_address, user_agent }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.detail ?? 'Error al iniciar sesión')

    this.setTokens(data.token, data.refresh_token)
    this.setUser(data.user)
    return data
  }

  /**
   * Cierra sesión. Llama a /logout para invalidar el refresh token en el
   * servidor y limpia el almacenamiento local. Redirige al login si
   * `redirect` es true.
   */
  async logout(redirect = true) {
    const refreshToken = this.getRefreshToken()

    if (refreshToken) {
      try {
        await fetch(`${BASE_URL}/v1.0/logout/`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ refresh_token: refreshToken }),
        })
      } catch {
        // Fallo silencioso: el token local se borra de todos modos
      }
    }

    this.clearTokens()

    if (redirect) {
      window.location.href = '/admin/login'
    }
  }

  /**
   * Refresca la sesión llamando a /refresh con el refresh token vigente.
   * Deduplica llamadas concurrentes para que múltiples peticiones fallidas
   * no disparen N refrescos simultáneos.
   */
  async _refreshSession() {
    if (this._refreshPromise) return this._refreshPromise

    this._refreshPromise = (async () => {
      if (this.isRefreshTokenExpired()) {
        await this.logout()
        throw new Error('La sesión ha caducado. Por favor, inicia sesión de nuevo.')
      }

      const res  = await fetch(`${BASE_URL}/v1.0/refresh/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refresh_token: this.getRefreshToken() }),
      })

      const data = await res.json()

      if (!res.ok) {
        await this.logout()
        throw new Error(data.detail ?? 'No se pudo refrescar la sesión.')
      }

      // Si la API devuelve un nuevo refresh_token se usa; si no, se conserva el actual
      const newRefresh = data.refresh_token ?? this.getRefreshToken()
      this.setTokens(data.token, newRefresh)

      return data.token
    })()

    try {
      return await this._refreshPromise
    } finally {
      this._refreshPromise = null
    }
  }

  // ─── Método base para peticiones autenticadas ─────────────────────────────

  /**
   * Realiza una petición al backend.
   *
   * @param {string}  endpoint    - Ruta relativa, p. ej. '/v1.0/users/'
   * @param {object}  options     - Opciones de fetch (method, body, headers, …)
   * @param {boolean} requiresAuth - Si es false, no adjunta el token (útil para
   *                                  endpoints públicos como /login).
   * @returns {Promise<any>}       - JSON de la respuesta
   * @throws {Error}               - Con el mensaje de `detail` que devuelve la API
   */
  async request(endpoint, options = {}, requiresAuth = true) {
    const headers = { 'Content-Type': 'application/json', ...options.headers }

    if (requiresAuth) {
      if (this.isRefreshTokenExpired()) {
        await this.logout()
        throw new Error('La sesión ha caducado.')
      }

      if (this.isTokenExpired()) {
        await this._refreshSession()
      }

      headers['Authorization'] = `Bearer ${this.getToken()}`
    }

    const { _retry, ...fetchOptions } = options
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...fetchOptions, headers })

    // 401 en una petición normal → intentar refrescar y reintentar una sola vez
    if (res.status === 401 && requiresAuth && !_retry) {
      try {
        await this._refreshSession()
        return this.request(endpoint, { ...options, _retry: true }, requiresAuth)
      } catch {
        throw new Error('No autorizado.')
      }
    }

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(data?.detail ?? `Error ${res.status}`)
    }

    return data
  }
}

/** Singleton compartido por toda la aplicación */
const authService = new AuthService()
export default authService

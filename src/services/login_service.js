/**
 * login_service.js
 *
 * Re-exporta el singleton de AuthService como punto de entrada principal
 * para el módulo de autenticación.
 *
 * Uso rápido:
 *   import authService from '@/services/login_service'
 *
 *   // Login
 *   await authService.login(email, password)
 *
 *   // Petición autenticada
 *   const data = await authService.request('/v1.0/some-endpoint/')
 *
 *   // Logout manual
 *   await authService.logout()
 *
 * Para otros servicios que necesiten hacer peticiones autenticadas,
 * importa directamente el singleton o extiende AuthService:
 *
 *   import { AuthService } from '@/services/auth_service'
 *   class MyService extends AuthService { ... }
 *
 *   — o —
 *
 *   import authService from '@/services/login_service'
 *   authService.request('/v1.0/my-endpoint/', { method: 'GET' })
 */

export { AuthService } from './auth_service'
export { default } from './auth_service'

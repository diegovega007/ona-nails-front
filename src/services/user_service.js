import authService from './auth_service'

/**
 * UserService — Gestiona todas las peticiones al módulo de usuarios del sistema.
 *
 * Roles disponibles en la API:
 *   admin        → administrador con acceso completo
 *   receptionist → acceso limitado (sin módulos de admin)
 *
 * Todos los endpoints requieren autenticación con token Bearer.
 */
class UserService {

  async getAll() {
    try {
      return await authService.request('/v1.0/users/')
    } catch {
      return []
    }
  }

  async getById(id) {
    return authService.request(`/v1.0/users/${id}`)
  }

  async create(dto) {
    return authService.request('/v1.0/users/', {
      method: 'POST',
      body:   JSON.stringify(dto),
    })
  }

  async update(dto) {
    return authService.request('/v1.0/users/', {
      method: 'PUT',
      body:   JSON.stringify(dto),
    })
  }

  async remove(id) {
    return authService.request(`/v1.0/users/${id}`, { method: 'DELETE' })
  }
}

const userService = new UserService()
export default userService

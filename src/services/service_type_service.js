import authService from './auth_service'

/**
 * ServiceTypeService — Gestiona peticiones al catálogo de tipos de servicio.
 *
 * Todos los endpoints requieren autenticación con token Bearer.
 * ServiceTypeResponseDTO: { id, name, description, created_at, created_by, ... }
 */
class ServiceTypeService {
  async getAll() {
    try {
      return await authService.request('/v1.0/services-type/')
    } catch {
      return []
    }
  }

  async getById(id) {
    return authService.request(`/v1.0/services-type/${id}`)
  }

  async create(dto) {
    return authService.request('/v1.0/services-type/', {
      method: 'POST',
      body:   JSON.stringify(dto),
    })
  }

  async update(id, dto) {
    return authService.request(`/v1.0/services-type/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(dto),
    })
  }

  async remove(id) {
    return authService.request(`/v1.0/services-type/${id}`, { method: 'DELETE' })
  }
}

const serviceTypeService = new ServiceTypeService()
export default serviceTypeService

import authService from './auth_service'

/**
 * PromotionService — Gestiona peticiones al módulo de promociones.
 *
 * Todos los endpoints requieren autenticación con token Bearer.
 * PromotionResponseDTO: { id, identifier, name, description, created_at, created_by, ... }
 */
class PromotionService {
  async getAll() {
    try {
      return await authService.request('/v1.0/promotions/')
    } catch {
      return []
    }
  }

  async getById(id) {
    return authService.request(`/v1.0/promotions/${id}`)
  }

  async create(dto) {
    return authService.request('/v1.0/promotions/', {
      method: 'POST',
      body:   JSON.stringify(dto),
    })
  }

  async update(id, dto) {
    return authService.request(`/v1.0/promotions/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(dto),
    })
  }

  async remove(id) {
    return authService.request(`/v1.0/promotions/${id}`, { method: 'DELETE' })
  }
}

const promotionService = new PromotionService()
export default promotionService

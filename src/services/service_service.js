import authService from './auth_service'

class ServiceService {
  async getAll() {
    try {
      return await authService.request('/v1.0/services/', {}, false)
    } catch {
      return []
    }
  }

  async getById(id) {
    return authService.request(`/v1.0/services/${id}`)
  }

  async create(dto, file = null) {
    const service = await authService.request('/v1.0/services/', {
      method: 'POST',
      body:   JSON.stringify(dto),
    })
    if (file) return this._uploadPhoto(service.id, file)
    return service
  }

  async update(dto, file = null) {
    const service = await authService.request('/v1.0/services/', {
      method: 'PUT',
      body:   JSON.stringify(dto),
    })
    if (file) return this._uploadPhoto(service.id, file)
    return service
  }

  async _uploadPhoto(id, file) {
    const form = new FormData()
    form.append('file', file)
    return authService.request(`/v1.0/services/${id}/photo`, {
      method: 'POST',
      body:   form,
    })
  }

  async remove(id) {
    return authService.request(`/v1.0/services/${id}`, { method: 'DELETE' })
  }
}

const serviceService = new ServiceService()
export default serviceService

import authService from './auth_service'

/**
 * ClientService — Gestiona peticiones al módulo de clientes.
 *
 * GET /v1.0/clients/ devuelve ClientAppointmentsResponseDTO:
 *   { id, name, last_name, cellphone, email, loyalty_completed, appointments[] }
 */
class ClientService {
  async getAll() {
    try {
      return await authService.request('/v1.0/clients/')
    } catch {
      return []
    }
  }

  async update(dto) {
    return authService.request('/v1.0/clients/', {
      method: 'PUT',
      body:   JSON.stringify(dto),
    })
  }
}

const clientService = new ClientService()
export default clientService

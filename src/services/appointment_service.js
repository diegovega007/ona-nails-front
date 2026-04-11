import authService from './auth_service'

/**
 * AppointmentService — Gestiona todas las peticiones al módulo de citas.
 *
 * Statuses disponibles en la API:
 *   received    → cita registrada / pendiente
 *   in_progress → en curso
 *   done        → completada
 *   cancelled   → cancelada
 *
 * Nota: la API devuelve 404 cuando no hay resultados; getAll() captura ese
 * caso y retorna [] para que los consumidores no necesiten manejar el error.
 */
class AppointmentService {

  /**
   * Obtiene citas aplicando filtros opcionales.
   * @param {object} filters
   * @param {string}  [filters.status]    - 'received' | 'in_progress' | 'done' | 'cancelled'
   * @param {string}  [filters.cellphone] - teléfono del cliente
   * @param {Date}    [filters.date]      - fecha exacta de la cita
   */
  async getAll({ status, cellphone, date } = {}) {
    const params = new URLSearchParams()
    if (status)    params.append('status',    status)
    if (cellphone) params.append('cellphone', cellphone)
    if (date)      params.append('date',      date instanceof Date ? date.toISOString() : date)

    const query = params.toString() ? `?${params}` : ''
    try {
      return await authService.request(`/v1.0/appointments/${query}`)
    } catch {
      return []
    }
  }

  /** Obtiene todas las citas sin filtros (útil para el dashboard). */
  async getAllRaw() {
    return this.getAll()
  }

  async getById(id) {
    return authService.request(`/v1.0/appointments/${id}`)
  }

  async create(dto) {
    return authService.request('/v1.0/appointments/', {
      method: 'POST',
      body:   JSON.stringify(dto),
    }, false)
  }

  async update(dto) {
    return authService.request('/v1.0/appointments/', {
      method: 'PUT',
      body:   JSON.stringify(dto),
    })
  }

  async remove(id) {
    return authService.request(`/v1.0/appointments/${id}`, { method: 'DELETE' })
  }
}

const appointmentService = new AppointmentService()
export default appointmentService

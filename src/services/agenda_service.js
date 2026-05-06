import authService from './auth_service'

/**
 * AgendaService — Consulta la disponibilidad de horarios.
 *
 * GET /v1.0/agenda/?initial_date=&final_date= (público, no requiere auth)
 * Respuesta: {
 *   avilable_schedule: string[],   // ISO datetimes disponibles
 *   reserved_schedule: Appointment[]
 * }
 */
class AgendaService {
  /**
   * Obtiene la agenda para un rango de fechas.
   * @param {Date|string} initialDate
   * @param {Date|string} finalDate
   */
  async getAvailability(initialDate, finalDate) {
    const toISO = (d) => (d instanceof Date ? d.toISOString() : d)
    const params = new URLSearchParams({
      initial_date: toISO(initialDate),
      final_date:   toISO(finalDate),
    })
    try {
      return await authService.request(`/v1.0/agenda/?${params}`, {}, false)
    } catch {
      return { avilable_schedule: [], reserved_schedule: [] }
    }
  }
}

const agendaService = new AgendaService()
export default agendaService

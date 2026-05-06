import { useState } from 'react'
import StatusBadge from './StatusBadge'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

const fmtPrice = (amount) =>
  Number(amount ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

const initials = (name, lastName) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()

// ─── Barra de lealtad ─────────────────────────────────────────────────────────

const LoyaltyBar = ({ completed }) => {
  const count = Math.min(completed ?? 0, 6)
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full transition-colors ${
            i < count ? 'bg-primary-dark' : 'bg-neutral-gray'
          }`}
        />
      ))}
      <span className="font-sans text-[10px] text-text-light ml-0.5">
        {count}/6
      </span>
    </div>
  )
}

// ─── ClientRow ────────────────────────────────────────────────────────────────

const ClientRow = ({ client, onEditAppointment, onCreateAppointment }) => {
  const [expanded, setExpanded] = useState(false)

  const appointments = client.appointments ?? []
  const sortedAppts  = [...appointments].sort(
    (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
  )

  return (
    <>
      {/* Fila del cliente */}
      <tr
        onClick={() => setExpanded(prev => !prev)}
        className="hover:bg-neutral-light/40 transition-colors cursor-pointer"
      >
        {/* Avatar + nombre */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="font-sans text-xs font-semibold text-primary-dark">
                {initials(client.name, client.last_name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-sm font-medium text-text-dark truncate">
                {client.name} {client.last_name}
              </p>
              <p className="font-sans text-xs text-text-light truncate">{client.cellphone}</p>
            </div>
          </div>
        </td>

        {/* Email */}
        <td className="px-5 py-4 hidden md:table-cell">
          <p className="font-sans text-xs text-text-dark/70 truncate">{client.email || '—'}</p>
        </td>

        {/* Lealtad */}
        <td className="px-5 py-4 hidden sm:table-cell">
          <LoyaltyBar completed={client.loyalty_completed} />
        </td>

        {/* Número de citas */}
        <td className="px-5 py-4 hidden lg:table-cell">
          <span className="font-sans text-sm text-text-dark">{appointments.length}</span>
        </td>

        {/* Expandir / acciones */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={e => { e.stopPropagation(); onCreateAppointment(client) }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
              title="Nueva cita para este cliente"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className={`w-5 h-5 flex items-center justify-center text-text-light transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </td>
      </tr>

      {/* Panel expandible con las citas */}
      {expanded && (
        <tr>
          <td colSpan={5} className="px-5 pb-4 pt-0 bg-neutral-light/20">
            {sortedAppts.length === 0 ? (
              <p className="font-sans text-xs text-text-light/60 py-3 text-center">
                Este cliente no tiene citas registradas
              </p>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                {sortedAppts.map(appt => (
                  <div
                    key={appt.id}
                    className="flex flex-wrap items-center gap-3 bg-white rounded-xl px-4 py-3 border border-neutral-gray/60 text-sm"
                  >
                    {/* Fecha */}
                    <div className="flex-shrink-0 min-w-[90px]">
                      <p className="font-sans text-xs font-medium text-text-dark">
                        {fmtDate(appt.appointment_date)}
                      </p>
                      <p className="font-sans text-[10px] text-text-light">
                        {fmtTime(appt.appointment_date)}
                      </p>
                    </div>

                    {/* Servicios */}
                    <div className="flex-1 min-w-[120px]">
                      {appt.list_services && appt.list_services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {appt.list_services.map(svc => (
                            <span key={svc.id} className="font-sans text-[11px] bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full">
                              {svc.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="font-sans text-xs text-text-light">—</p>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="flex-shrink-0">
                      <StatusBadge status={appt.status} />
                    </div>

                    {/* Total */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-sans text-xs text-text-light">Total</p>
                      <p className="font-sans text-sm font-semibold text-text-dark">
                        {fmtPrice(appt.total)}
                      </p>
                    </div>

                    {/* Editar */}
                    <button
                      onClick={() => onEditAppointment(client, appt)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
                      title="Editar cita"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default ClientRow

import { useState } from 'react'
import AppointmentListItem from './AppointmentListItem'
import StatusBadge from './StatusBadge'

const PREVIEW_APPOINTMENTS = 5

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

const ClientRow = ({ client, onEditAppointment, onCreateAppointment, onEditClient, onOpenAllAppointments }) => {
  const [expanded, setExpanded] = useState(false)

  const appointments = client.appointments ?? []
  const sortedAppts  = [...appointments].sort(
    (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
  )
  const previewList = sortedAppts.slice(0, PREVIEW_APPOINTMENTS)
  const hasMore     = sortedAppts.length > PREVIEW_APPOINTMENTS

  return (
    <>
      {/* Fila del cliente */}
      <tr
        onClick={() => setExpanded(prev => !prev)}
        className="hover:bg-neutral-light/40 transition-colors cursor-pointer align-middle"
      >
        {/* Avatar + nombre */}
        <td className="px-5 py-4 text-left align-middle">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 min-w-0 mx-auto max-w-md">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="font-sans text-xs font-semibold text-primary-dark">
                {initials(client.name, client.last_name)}
              </span>
            </div>
            <div className="min-w-0 text-left">
              <p className="font-sans text-sm font-medium text-text-dark truncate">
                {client.name} {client.last_name}
              </p>
              <p className="font-sans text-xs text-text-light truncate">{client.cellphone}</p>
            </div>
          </div>
        </td>

        {/* Email */}
        <td className="px-5 py-4 hidden md:table-cell text-center align-middle">
          <p className="font-sans text-xs text-text-dark/70 truncate max-w-[200px] mx-auto">{client.email || '—'}</p>
        </td>

        {/* Lealtad */}
        <td className="px-5 py-4 hidden sm:table-cell text-center align-middle">
          <div className="flex justify-center">
            <LoyaltyBar completed={client.loyalty_completed} />
          </div>
        </td>

        {/* Número de citas */}
        <td className="px-5 py-4 hidden lg:table-cell text-center align-middle">
          <span className="font-sans text-sm text-text-dark">{appointments.length}</span>
        </td>

        {/* Acciones */}
        <td className="px-5 py-4 text-center align-middle">
          <div className="flex items-center gap-1 justify-center">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onEditClient(client) }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
              title="Editar cliente"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
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

      {/* Panel expandible con las citas (máx. 5) */}
      {expanded && (
        <tr>
          <td colSpan={5} className="px-5 pb-4 pt-0 bg-neutral-light/20">
            {sortedAppts.length === 0 ? (
              <p className="font-sans text-xs text-text-light/60 py-3 text-center">
                Este cliente no tiene citas registradas
              </p>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                {previewList.map(appt => (
                  <AppointmentListItem
                    key={appt.id}
                    appointment={appt}
                    client={client}
                    onEdit={onEditAppointment}
                  />
                ))}
                {hasMore && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      onOpenAllAppointments(client)
                    }}
                    className="mt-1 w-full font-sans text-xs font-medium text-primary-dark hover:text-primary-dark/80 py-2.5 rounded-xl border border-primary/25 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    Ver más ({sortedAppts.length - PREVIEW_APPOINTMENTS} cita{sortedAppts.length - PREVIEW_APPOINTMENTS !== 1 ? 's' : ''} más · {sortedAppts.length} en total)
                  </button>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default ClientRow

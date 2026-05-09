import StatusBadge from './StatusBadge'

export const fmtApptDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

export const fmtApptTime = (iso) =>
  new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

export const fmtApptPrice = (amount) =>
  Number(amount ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

/**
 * Fila compacta de una cita (expandible o modal de listado).
 * Ancho según contenido (servicios); espaciado uniforme entre bloques.
 */
const AppointmentListItem = ({ appointment: appt, onEdit, client }) => (
  <div className="flex flex-wrap items-center gap-y-4 gap-x-6 bg-white rounded-xl px-5 py-3.5 border border-neutral-gray/60 text-sm w-max max-w-full">
    {/* Fecha / hora */}
    <div className="flex-shrink-0 w-[108px]">
      <p className="font-sans text-xs font-medium text-text-dark leading-tight">
        {fmtApptDate(appt.appointment_date)}
      </p>
      <p className="font-sans text-[10px] text-text-light mt-0.5">
        {fmtApptTime(appt.appointment_date)}
      </p>
    </div>

    {/* Servicios (ancho natural según cantidad / texto) */}
    <div className="min-w-0 border-l border-neutral-gray/45 pl-6">
      {appt.list_services?.length > 0 ? (
        <p className="font-sans text-[11px] text-text-light uppercase tracking-wide mb-2">
          Servicio{appt.list_services.length !== 1 ? 's' : ''}
        </p>
      ) : null}
      {appt.list_services?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {appt.list_services.map(svc => (
            <span
              key={svc.id}
              className="font-sans text-[11px] bg-primary/10 text-primary-dark px-2.5 py-1 rounded-full leading-snug max-w-full"
            >
              {svc.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="font-sans text-xs text-text-light py-0.5">Sin servicios</p>
      )}
    </div>

    {/* Estado, total, editar */}
    <div className="flex items-center gap-5 flex-shrink-0 border-l border-neutral-gray/45 pl-6">
      <StatusBadge status={appt.status} />
      <div className="text-right min-w-[5rem]">
        <p className="font-sans text-[10px] text-text-light leading-none">Total</p>
        <p className="font-sans text-sm font-semibold text-text-dark leading-tight mt-0.5">
          {fmtApptPrice(appt.total)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(client, appt)}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors -mr-0.5"
        title="Editar cita"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  </div>
)

export default AppointmentListItem

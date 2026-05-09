import { useEffect } from 'react'
import AppointmentListItem from './AppointmentListItem'
import TablePagination, { useTablePagination, DEFAULT_TABLE_PAGE_SIZE } from '../common/TablePagination'

const ClientAppointmentsModal = ({ client, onClose, onEditAppointment }) => {
  const appointments = client.appointments ?? []
  const sorted = [...appointments].sort(
    (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date),
  )

  const { page, setPage, paginated } = useTablePagination(
    sorted,
    DEFAULT_TABLE_PAGE_SIZE,
    client.id,
  )

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="client-appts-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-gray flex-shrink-0">
          <div>
            <h2 id="client-appts-title" className="font-serif text-lg text-text-dark">
              Citas del cliente
            </h2>
            <p className="font-sans text-xs text-text-light mt-0.5">
              {client.name} {client.last_name}
              <span className="text-text-light/70"> · {sorted.length} cita{sorted.length !== 1 ? 's' : ''}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-light hover:text-text-dark hover:bg-neutral-light transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-4 overflow-y-auto flex-1 flex flex-col gap-2 min-h-0">
          {sorted.length === 0 ? (
            <p className="font-sans text-sm text-text-light text-center py-8">
              Este cliente no tiene citas registradas
            </p>
          ) : (
            paginated.map(appt => (
              <AppointmentListItem
                key={appt.id}
                appointment={appt}
                client={client}
                onEdit={onEditAppointment}
              />
            ))
          )}
        </div>

        {sorted.length > 0 && (
          <TablePagination
            page={page}
            pageSize={DEFAULT_TABLE_PAGE_SIZE}
            totalItems={sorted.length}
            onPageChange={setPage}
            singularLabel="cita"
            pluralLabel="citas"
          />
        )}
      </div>
    </div>
  )
}

export default ClientAppointmentsModal

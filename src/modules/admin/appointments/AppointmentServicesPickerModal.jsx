import { useEffect, useMemo, useState } from 'react'

const fmtPrice = (amount) =>
  Number(amount ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

const inputSearchCls =
  'w-full font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors placeholder:text-text-light/50'

/**
 * Modal superpuesto (z-index alto) para elegir servicios sin alargar el formulario principal de la cita.
 */
const AppointmentServicesPickerModal = ({ open, onClose, services, selectedIds, onApply }) => {
  const [draft, setDraft] = useState(() => [...selectedIds])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open) return
    setDraft([...selectedIds])
    setSearchQuery('')
  }, [open, selectedIds])

  const enabled = useMemo(() => services.filter((s) => s.enabled), [services])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return enabled
    return enabled.filter((s) => {
      const name = (s.name ?? '').toLowerCase()
      const desc = (s.description ?? '').toLowerCase()
      return name.includes(q) || desc.includes(q)
    })
  }, [enabled, searchQuery])

  const toggle = (id) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  const draftServices = enabled.filter((s) => draft.includes(s.id))
  const subtotal = draftServices.reduce((sum, s) => sum + Number(s.price ?? 0), 0)
  const duration = draftServices.reduce((sum, s) => sum + Number(s.duration ?? 0), 0)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[min(90vh,32rem)] flex flex-col border border-neutral-gray/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-gray shrink-0">
          <div>
            <h3 className="font-serif text-base font-semibold text-text-dark">Servicios de la cita</h3>
            <p className="font-sans text-[11px] text-text-light mt-0.5">
              {draft.length === 0
                ? 'Ninguno seleccionado'
                : `${draft.length} servicio${draft.length !== 1 ? 's' : ''} · ${fmtPrice(subtotal)}${duration ? ` · ${duration} min` : ''}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-light hover:text-text-dark hover:bg-neutral-light transition-colors"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-3 pb-2 shrink-0 border-b border-neutral-gray/60">
          <label htmlFor="appointment-services-search" className="sr-only">
            Buscar servicios
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="appointment-services-search"
              type="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o descripción…"
              className={inputSearchCls}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((s) => {
              const checked = draft.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border transition-all ${
                    checked
                      ? 'border-primary-dark bg-primary/8 text-primary-dark'
                      : 'border-neutral-gray bg-neutral-light hover:border-primary/40 text-text-dark'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      checked ? 'bg-primary-dark border-primary-dark' : 'border-neutral-gray bg-white'
                    }`}
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-xs font-medium truncate">{s.name}</p>
                    <p className="font-sans text-[10px] text-text-light">
                      {Number(s.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                      {s.duration ? ` · ${s.duration} min` : ''}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <p className="font-sans text-sm text-text-light text-center py-8 px-4">
              {enabled.length === 0
                ? 'No hay servicios habilitados.'
                : 'Ningún servicio coincide con tu búsqueda.'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-gray bg-neutral-light/30 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-sm text-text-light hover:text-text-dark px-4 py-2 rounded-lg hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="font-sans text-sm font-medium text-white bg-primary-dark hover:bg-primary-dark/90 px-5 py-2 rounded-lg transition-colors"
          >
            Aplicar selección
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentServicesPickerModal

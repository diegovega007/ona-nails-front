import SpinnerIcon from '../../../assets/icons/spinnerIcon'

const fmtPrice = (price) =>
  Number(price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

/**
 * StepService — Paso 1 del modal de reserva.
 * Permite seleccionar uno o varios servicios disponibles.
 *
 * Props:
 *   services   — lista de servicios habilitados
 *   loading    — boolean
 *   selected   — array de servicios seleccionados
 *   onToggle   — función que recibe un servicio para agregarlo/quitarlo
 */
export default function StepService({ services, loading, selected, onToggle }) {
  const selectedIds = new Set(selected.map(s => s.id))

  const total = selected.reduce((sum, s) => sum + Number(s.price), 0)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <SpinnerIcon className="w-7 h-7 text-primary animate-spin" />
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-sans text-sm text-text-light">
          No hay servicios disponibles por el momento.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="font-sans text-sm text-text-light mb-5">
        Selecciona uno o varios servicios para tu cita
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(svc => {
          const active = selectedIds.has(svc.id)
          return (
            <button
              key={svc.id}
              onClick={() => onToggle(svc)}
              className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                active
                  ? 'border-primary-dark bg-primary-light/30 shadow-md'
                  : 'border-neutral-gray bg-white hover:border-primary/50 hover:bg-primary-light/10'
              }`}
            >
              {active && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-dark flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {svc.photo && (
                <div className="w-full h-24 rounded-xl overflow-hidden mb-3">
                  <img src={svc.photo} alt={svc.name} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="font-sans text-sm font-semibold text-text-dark leading-tight mb-1">
                {svc.name}
              </p>
              {svc.description && (
                <p className="font-sans text-xs text-text-light line-clamp-2 mb-2">
                  {svc.description}
                </p>
              )}
              {svc.price && (
                <p className="font-sans text-xs font-semibold text-primary-dark">
                  {fmtPrice(svc.price)}
                </p>
              )}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div className="mt-5 pt-4 border-t border-neutral-gray/60">
          <div className="flex flex-col gap-1.5 mb-3">
            {selected.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="font-sans text-xs text-text-dark truncate pr-2">{s.name}</span>
                <span className="font-sans text-xs font-medium text-primary-dark whitespace-nowrap">
                  {fmtPrice(s.price)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-primary/20">
            <span className="font-sans text-xs font-semibold text-text-dark">Total estimado</span>
            <span className="font-serif text-base font-semibold text-primary-dark">
              {fmtPrice(total)}
            </span>
          </div>
        </div>
      )}
    </>
  )
}

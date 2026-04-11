import NailIcon from '../../../assets/icons/nailIcon'

const STEP_LABELS = ['Servicio', 'Tus datos', 'Fecha y hora']

export default function ModalHeader({ step, success, onClose }) {
  return (
    <div
      className="relative shrink-0 px-8 pt-8 pb-6"
      style={{ background: 'linear-gradient(135deg, #D4B896 0%, #B8956A 100%)' }}
    >
      {/* Círculos decorativos */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute top-4 right-16 w-10 h-10 rounded-full bg-white/10 pointer-events-none" />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors duration-200"
        aria-label="Cerrar"
      >
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
          <NailIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-white leading-tight">
            Reservar Cita
          </h2>
          <p className="font-sans text-white/75 text-xs tracking-wide">
            Ona Nails &amp; Art
          </p>
        </div>
      </div>

      {!success && (
        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const num    = i + 1
            const active = step === num
            const done   = step > num
            return (
              <div key={num} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    done
                      ? 'bg-white text-primary-dark'
                      : active
                        ? 'bg-white text-primary-dark ring-2 ring-white/50'
                        : 'bg-white/25 text-white/70'
                  }`}>
                    {done
                      ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )
                      : num
                    }
                  </div>
                  <span className={`font-sans text-xs hidden sm:block ${active ? 'text-white font-medium' : 'text-white/65'}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${done ? 'bg-white/70' : 'bg-white/25'}`} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

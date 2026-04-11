import SpinnerIcon from '../../../assets/icons/spinnerIcon'

export default function ModalFooter({ step, selectedSvc, submitting, onBack, onNext, onSubmit }) {
  return (
    <div className="shrink-0 px-8 py-5 border-t border-neutral-gray/60 flex items-center justify-between gap-3 bg-white">
      {step > 1 ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-medium text-neutral-dark hover:bg-neutral-light transition-colors duration-200 border border-neutral-gray"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Atrás
        </button>
      ) : (
        <div />
      )}

      {step < 3 ? (
        <button
          onClick={onNext}
          disabled={step === 1 && !selectedSvc}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-sans text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #D4B896 0%, #B8956A 100%)' }}
        >
          Siguiente
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-sans text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
          style={{
            background:  'linear-gradient(135deg, #D4B896 0%, #B8956A 100%)',
            boxShadow:   '0 4px 14px rgba(184,149,106,0.35)',
          }}
        >
          {submitting ? (
            <>
              <SpinnerIcon className="w-4 h-4 animate-spin" />
              Reservando...
            </>
          ) : (
            <>
              Confirmar cita
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  )
}

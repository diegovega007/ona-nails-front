import CheckCircleIcon from '../../../assets/icons/checkCircleIcon'

export default function SuccessView({ serviceName, date, time, onClose }) {
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  })

  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 ring-8 ring-green-100">
        <CheckCircleIcon className="w-10 h-10 text-green-500" />
      </div>

      <h3 className="font-serif text-2xl font-semibold text-text-dark mb-3">
        ¡Cita reservada!
      </h3>

      <p className="font-sans text-text-light text-sm leading-relaxed max-w-xs mb-2">
        Tu cita para{' '}
        <span className="font-medium text-primary-dark">{serviceName}</span> el{' '}
        <span className="font-medium text-text-dark">{formattedDate}</span>{' '}
        a las{' '}
        <span className="font-medium text-text-dark">{time}</span>{' '}
        ha sido registrada con éxito.
      </p>

      <p className="font-sans text-text-light text-xs mb-8">
        Nos pondremos en contacto contigo para confirmar.
      </p>

      <button
        onClick={onClose}
        className="px-8 py-3 rounded-xl font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #D4B896 0%, #B8956A 100%)' }}
      >
        Aceptar
      </button>
    </div>
  )
}

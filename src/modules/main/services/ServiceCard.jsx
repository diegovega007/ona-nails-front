import NailIcon from '../../../assets/icons/nailIcon'

const fmtPrice = (price) =>
  Number(price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

const ServiceCard = ({ service }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 flex flex-col">
    {/* Imagen */}
    <div className="aspect-video bg-primary/8 flex items-center justify-center overflow-hidden relative">
      {service.photo ? (
        <img
          src={service.photo}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
        />
      ) : null}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ display: service.photo ? 'none' : 'flex' }}
      >
        <NailIcon className="w-12 h-12 text-primary-dark opacity-30" />
      </div>
    </div>

    {/* Contenido */}
    <div className="p-6 flex flex-col flex-1 gap-3">
      <h3 className="font-serif text-lg font-semibold text-text-dark leading-snug">
        {service.name}
      </h3>

      {service.description && (
        <p className="font-sans text-sm text-text-light leading-relaxed flex-1">
          {service.description}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-neutral-gray/60">
        <span className="font-serif text-xl font-semibold text-primary-dark">
          {fmtPrice(service.price)}
        </span>
      </div>
    </div>
  </div>
)

export default ServiceCard

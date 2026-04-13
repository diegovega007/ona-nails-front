import { CONTACT_INFO, MAP_EMBED_URL } from './contactData'
import MapPinIcon from '../../../assets/icons/mapPinIcon'

const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`

const ContactMap = () => (
  <section className="pb-16 lg:pb-20">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-soft border border-neutral-gray/40 overflow-hidden">

        <div className="px-8 py-6 border-b border-neutral-gray/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPinIcon className="w-5 h-5 text-primary-dark" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-text-dark">¿Dónde estamos?</h2>
              <p className="font-sans text-sm text-text-light">{CONTACT_INFO.address}</p>
            </div>
          </div>
        </div>

        <div className="relative" style={{ height: '420px' }}>
          <iframe
            title="Ubicación Ona Nails"
            src={MAP_EMBED_URL}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full"
          />
        </div>

        <div className="px-8 py-4 bg-neutral-light/60 flex items-center justify-between flex-wrap gap-3">
          <p className="font-sans text-xs text-text-light">
            Mapa proporcionado por{' '}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-dark hover:underline"
            >
              OpenStreetMap
            </a>
          </p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs font-medium text-primary-dark hover:underline"
          >
            Abrir en Google Maps →
          </a>
        </div>
      </div>
    </div>
  </section>
)

export default ContactMap

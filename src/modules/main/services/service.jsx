import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import serviceService from '../../../services/service_service'
import NailIcon from '../../../assets/icons/nailIcon'
import ContactIcon from '../../../assets/icons/contactIcon'
import ServiceCard from './ServiceCard'
import Skeleton from './Skeleton'

const Service = () => {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    serviceService.getAll().then(data => {
      setServices(data.filter(s => s.enabled))
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="bg-white border-b border-neutral-gray/40 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-sans text-xs font-semibold tracking-[0.22em] uppercase text-primary-dark mb-4">
            Nuestros servicios
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-dark mb-5 leading-tight">
            Lo que ofrecemos para ti
          </h1>
          <p className="font-sans text-lg text-text-light max-w-2xl mx-auto leading-relaxed">
            Cada servicio está diseñado para realzar tu belleza natural con técnicas profesionales,
            productos premium y atención al detalle que nos distingue.
          </p>
        </div>
      </section>

      {/* ── Grilla de servicios ── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <NailIcon className="w-8 h-8 text-primary-dark opacity-40" />
              </div>
              <p className="font-serif text-xl text-text-dark/40">Próximamente</p>
              <p className="font-sans text-sm text-text-light/60">
                Estamos preparando nuestro catálogo de servicios
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map(s => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      {!loading && services.length > 0 && (
        <section className="bg-primary/8 border-t border-primary/20 py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-text-dark mb-4">
              ¿Buscas algo personalizado?
            </h2>
            <p className="font-sans text-text-light mb-8 leading-relaxed">
              Si tienes en mente un diseño especial o quieres saber más sobre nuestros servicios, con gusto te atendemos.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 font-sans font-semibold text-white bg-primary-dark hover:bg-primary-dark/90 px-8 py-3.5 rounded-2xl shadow-medium transition-all hover:scale-105"
            >
              <ContactIcon className="w-5 h-5" />
              Contáctanos
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Service

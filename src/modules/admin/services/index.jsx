import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import serviceService from '../../../services/service_service'
import RefreshIcon    from '../../../assets/icons/refreshIcon'
import NailIcon       from '../../../assets/icons/nailIcon'
import EnabledBadge   from './EnabledBadge'
import ServiceModal   from './ServiceModal'
import Skeleton       from './Skeleton'
import EmptyState     from './EmptyState'

const REFRESH_INTERVAL_MS = 60_000

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (price) =>
  Number(price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

// ─── Services ─────────────────────────────────────────────────────────────────

const Services = () => {
  const [services,      setServices]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [refreshing,    setRefreshing]    = useState(false)
  const [lastUpdated,   setLastUpdated]   = useState(null)
  const [search,        setSearch]        = useState('')
  const [filterEnabled, setFilterEnabled] = useState('')   // '' | 'true' | 'false'
  const [modal,         setModal]         = useState(null) // { mode: 'view'|'edit'|'create', service? }

  const intervalRef = useRef(null)

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const fetchServices = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    else         setRefreshing(true)

    const data = await serviceService.getAll()
    setServices(data)
    setLastUpdated(new Date())

    if (initial) setLoading(false)
    else         setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchServices(true)
    intervalRef.current = setInterval(() => fetchServices(false), REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchServices])

  // ── Filtrado local ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = services
    if (filterEnabled !== '') {
      const enabled = filterEnabled === 'true'
      result = result.filter(s => s.enabled === enabled)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      )
    }
    return result
  }, [services, search, filterEnabled])

  const stats = useMemo(() => ({
    total:    services.length,
    active:   services.filter(s => s.enabled).length,
    inactive: services.filter(s => !s.enabled).length,
  }), [services])

  // ── Handlers de modal ───────────────────────────────────────────────────────

  const handleSaved = (saved) => {
    setServices(prev => {
      const idx = prev.findIndex(s => s.id === saved.id)
      if (idx === -1) return [saved, ...prev]
      const copy = [...prev]
      copy[idx] = saved
      return copy
    })
    setModal(null)
  }

  const handleDeleted = (id) => {
    setServices(prev => prev.filter(s => s.id !== id))
    setModal(null)
  }

  const clearFilters = () => {
    setSearch('')
    setFilterEnabled('')
  }

  const hasFilters = search || filterEnabled !== ''

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">

      {/* ── Cabecera ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-text-dark">Servicios</h1>
          <p className="font-sans text-xs text-text-light mt-0.5">
            Catálogo de servicios ofrecidos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="font-sans text-[11px] text-text-light/60 hidden sm:inline">
              Actualizado {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchServices(false)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 font-sans text-xs font-medium text-text-light hover:text-primary-dark px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-2 font-sans text-sm font-medium text-white bg-primary-dark hover:bg-primary-dark/90 px-4 py-2 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo servicio
          </button>
        </div>
      </div>

      {/* ── Stats rápidas ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            key: '',
            label: 'Total',
            value: stats.total,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary-dark',
            Icon: NailIcon,
          },
          {
            key: 'true',
            label: 'Activos',
            value: stats.active,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            Icon: ({ className }) => (
              <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            key: 'false',
            label: 'Inactivos',
            value: stats.inactive,
            iconBg: 'bg-neutral-100',
            iconColor: 'text-text-light',
            Icon: ({ className }) => (
              <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
              </svg>
            ),
          },
        ].map(({ key, label, value, iconBg, iconColor, Icon }) => (
          <button
            key={`stat-${key}`}
            onClick={() => setFilterEnabled(filterEnabled === key && key !== '' ? '' : key)}
            className={`bg-white border rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-soft text-left ${
              filterEnabled === key && key !== '' ? 'border-primary ring-2 ring-primary/20' : 'border-neutral-gray'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div>
              <p className="font-sans text-xs text-text-light">{label}</p>
              <p className="font-serif text-xl font-semibold text-text-dark leading-none mt-0.5">
                {loading ? '—' : value}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white border border-neutral-gray rounded-2xl overflow-hidden">

        {/* Barra de filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-neutral-gray/60">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/60 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="w-full font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-light/50"
              placeholder="Buscar por nombre o descripción…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer w-full sm:w-40"
            value={filterEnabled}
            onChange={e => setFilterEnabled(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="font-sans text-xs text-text-light hover:text-text-dark px-3 py-2 rounded-xl hover:bg-neutral-light transition-colors whitespace-nowrap"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Conteo */}
        {!loading && (
          <div className="px-5 py-2.5 border-b border-neutral-gray/40 bg-neutral-light/40">
            <p className="font-sans text-xs text-text-light">
              {filtered.length === services.length
                ? `${filtered.length} servicio${filtered.length !== 1 ? 's' : ''}`
                : `${filtered.length} de ${services.length} servicios`}
            </p>
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <Skeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState text={hasFilters ? 'Sin resultados para los filtros aplicados' : 'No hay servicios registrados'} />
        ) : (
          <table className="w-full">
            <thead className="hidden md:table-header-group bg-neutral-light/30 border-b border-neutral-gray/60">
              <tr>
                {['Servicio', 'Descripción', 'Precio', 'Estado', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[11px] font-semibold tracking-[1.2px] uppercase text-text-light">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray/60">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-neutral-light/40 transition-colors">

                  {/* Servicio */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {s.photo ? (
                          <img
                            src={s.photo}
                            alt={s.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.style.display = 'none' }}
                          />
                        ) : (
                          <NailIcon className="w-4 h-4 text-primary-dark opacity-50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-medium text-text-dark truncate">{s.name}</p>
                        <p className="font-sans text-xs text-text-light truncate md:hidden">{fmtPrice(s.price)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Descripción */}
                  <td className="px-5 py-4 hidden md:table-cell max-w-xs">
                    <p className="font-sans text-sm text-text-dark/70 truncate">{s.description || '—'}</p>
                  </td>

                  {/* Precio */}
                  <td className="px-5 py-4 hidden md:table-cell whitespace-nowrap">
                    <p className="font-sans text-sm font-medium text-text-dark">{fmtPrice(s.price)}</p>
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4">
                    <EnabledBadge enabled={s.enabled} />
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <div className="relative group">
                        <button
                          onClick={() => setModal({ mode: 'view', service: s })}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-white bg-text-dark/80 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver detalle
                        </span>
                      </div>
                      <div className="relative group">
                        <button
                          onClick={() => setModal({ mode: 'edit', service: s })}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-white bg-text-dark/80 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          Editar
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <ServiceModal
          service={modal.service}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

export default Services

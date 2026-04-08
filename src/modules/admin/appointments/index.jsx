import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import appointmentService from '../../../services/appointment_service'
import serviceService     from '../../../services/service_service'
import RefreshIcon        from '../../../assets/icons/refreshIcon'
import ClockIcon          from '../../../assets/icons/clockIcon'
import CheckCircleIcon    from '../../../assets/icons/checkCircleIcon'
import XCircleIcon        from '../../../assets/icons/xCircleIcon'
import StatusBadge        from './StatusBadge'
import AppointmentModal   from './AppointmentModal'
import Skeleton           from './Skeleton'
import EmptyState         from './EmptyState'

const REFRESH_INTERVAL_MS = 60_000

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

const initials = (name, lastName) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()

// ─── Citas ─────────────────────────────────────────────────────────────────────

const Citas = () => {
  const [appointments, setAppointments] = useState([])
  const [services,     setServices]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)
  const [lastUpdated,  setLastUpdated]  = useState(null)

  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate,   setFilterDate]   = useState('')
  const [search,       setSearch]       = useState('')

  const [modal, setModal] = useState(null) // { mode: 'view'|'edit'|'create', appointment? }

  const intervalRef = useRef(null)

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const fetchAppointments = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    else         setRefreshing(true)

    const params = {}
    if (filterStatus) params.status = filterStatus
    if (filterDate)   params.date   = new Date(filterDate).toISOString()

    const data = await appointmentService.getAll(params)
    setAppointments(data)
    setLastUpdated(new Date())

    if (initial) setLoading(false)
    else         setRefreshing(false)
  }, [filterStatus, filterDate])

  useEffect(() => {
    fetchAppointments(true)
    intervalRef.current = setInterval(() => fetchAppointments(false), REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchAppointments])

  useEffect(() => {
    serviceService.getAll().then(setServices)
  }, [])

  // ── Búsqueda local ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return appointments
    const q = search.toLowerCase()
    return appointments.filter(a =>
      `${a.client?.name} ${a.client?.last_name}`.toLowerCase().includes(q) ||
      a.client?.cellphone?.includes(q) ||
      a.service?.name?.toLowerCase().includes(q)
    )
  }, [appointments, search])

  const stats = useMemo(() => ({
    total:       appointments.length,
    received:    appointments.filter(a => a.status === 'received').length,
    in_progress: appointments.filter(a => a.status === 'in_progress').length,
    done:        appointments.filter(a => a.status === 'done').length,
    cancelled:   appointments.filter(a => a.status === 'cancelled').length,
  }), [appointments])

  // ── Handlers de modal ───────────────────────────────────────────────────────

  const handleSaved = (updated) => {
    setAppointments(prev => {
      const idx = prev.findIndex(a => a.id === updated.id)
      if (idx === -1) return [updated, ...prev]
      const copy = [...prev]
      copy[idx] = updated
      return copy
    })
    setModal(null)
  }

  const handleDeleted = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id))
    setModal(null)
  }

  const clearFilters = () => {
    setFilterStatus('')
    setFilterDate('')
    setSearch('')
  }

  const hasFilters = filterStatus || filterDate || search

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">

      {/* ── Cabecera ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-text-dark">Citas</h1>
          <p className="font-sans text-xs text-text-light mt-0.5">
            Gestión de reservas y atenciones
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="font-sans text-[11px] text-text-light/60 hidden sm:inline">
              Actualizado {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchAppointments(false)}
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
            Nueva cita
          </button>
        </div>
      </div>

      {/* ── Stats rápidas ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'received',    label: 'Pendientes',  Icon: ClockIcon,       iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'   },
          { key: 'in_progress', label: 'En progreso', Icon: RefreshIcon,     iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'    },
          { key: 'done',        label: 'Completadas', Icon: CheckCircleIcon, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
          { key: 'cancelled',   label: 'Canceladas',  Icon: XCircleIcon,     iconBg: 'bg-red-50',     iconColor: 'text-red-400'     },
        ].map(({ key, label, Icon, iconBg, iconColor }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
            className={`bg-white border rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-soft text-left ${
              filterStatus === key ? 'border-primary ring-2 ring-primary/20' : 'border-neutral-gray'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div>
              <p className="font-sans text-xs text-text-light">{label}</p>
              <p className="font-serif text-xl font-semibold text-text-dark leading-none mt-0.5">
                {loading ? '—' : stats[key]}
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
              placeholder="Buscar cliente, teléfono o servicio…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <input
            type="date"
            className="font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer w-full sm:w-auto"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />

          <select
            className="font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer w-full sm:w-auto"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="received">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="done">Completada</option>
            <option value="cancelled">Cancelada</option>
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
              {filtered.length === appointments.length
                ? `${filtered.length} cita${filtered.length !== 1 ? 's' : ''}`
                : `${filtered.length} de ${appointments.length} citas`}
            </p>
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <Skeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState text={hasFilters ? 'Sin resultados para los filtros aplicados' : 'No hay citas registradas'} />
        ) : (
          <table className="w-full">
            <thead className="hidden md:table-header-group bg-neutral-light/30 border-b border-neutral-gray/60">
              <tr>
                {['Cliente', 'Servicio', 'Fecha y hora', 'Estado', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[11px] font-semibold tracking-[1.2px] uppercase text-text-light">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray/60">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-neutral-light/40 transition-colors">
                  {/* Cliente */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-sans text-xs font-semibold text-primary-dark">
                          {initials(a.client?.name, a.client?.last_name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-medium text-text-dark truncate">
                          {a.client?.name} {a.client?.last_name}
                        </p>
                        <p className="font-sans text-xs text-text-light truncate">{a.client?.cellphone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Servicio */}
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="font-sans text-sm text-text-dark/80 truncate">{a.service?.name ?? '—'}</p>
                  </td>

                  {/* Fecha */}
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="font-sans text-sm text-text-dark">{fmtDate(a.appointment_date)}</p>
                    <p className="font-sans text-xs text-text-light">{fmtTime(a.appointment_date)}</p>
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <div className="relative group">
                        <button
                          onClick={() => setModal({ mode: 'view', appointment: a })}
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
                          onClick={() => setModal({ mode: 'edit', appointment: a })}
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
        <AppointmentModal
          appointment={modal.appointment}
          services={services}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

export default Citas

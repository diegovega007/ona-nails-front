import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import authService        from '../../../services/login_service'
import appointmentService from '../../../services/appointment_service'
import userService        from '../../../services/user_service'
import CalendarIcon       from '../../../assets/icons/calendarIcon'
import ClockIcon          from '../../../assets/icons/clockIcon'
import CheckCircleIcon    from '../../../assets/icons/checkCircleIcon'
import XCircleIcon        from '../../../assets/icons/xCircleIcon'
import RefreshIcon        from '../../../assets/icons/refreshIcon'
import StatCard           from './StatCard'
import MiniBarChart       from './MiniBarChart'
import EmptyState         from './EmptyState'
import Skeleton           from './Skeleton'

const REFRESH_INTERVAL_MS = 60_000

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate()

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

const STATUS = {
  received:    { label: 'Pendiente',    dot: 'bg-amber-400'   },
  in_progress: { label: 'En progreso',  dot: 'bg-blue-400'    },
  done:        { label: 'Completada',   dot: 'bg-emerald-400' },
  cancelled:   { label: 'Cancelada',    dot: 'bg-red-400'     },
}

const ROLE_LABEL = { admin: 'Administrador', receptionist: 'Recepcionista' }

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const user    = authService.getUser()
  const isAdmin = user?.rol === 'admin'

  const [appointments,   setAppointments]   = useState([])
  const [sysUsers,       setSysUsers]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [refreshing,     setRefreshing]     = useState(false)
  const [lastUpdated,    setLastUpdated]    = useState(null)
  const [summaryFilter,  setSummaryFilter]  = useState(0)   // 0 = hoy, N = últimos N días
  const [upcomingFilter, setUpcomingFilter] = useState('today') // 'today' | 'tomorrow' | '7days'
  const intervalRef = useRef(null)

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    else           setRefreshing(true)

    const calls = [appointmentService.getAllRaw()]
    if (isAdmin) calls.push(userService.getAll())

    const [appts, usrs = []] = await Promise.all(calls)
    setAppointments(appts)
    setSysUsers(usrs)
    setLastUpdated(new Date())

    if (isInitial) setLoading(false)
    else           setRefreshing(false)
  }, [isAdmin])

  useEffect(() => {
    fetchData(true)
    intervalRef.current = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchData])

  // ── Computed stats ──────────────────────────────────────────────────────────
  const today = useMemo(() => new Date(), [])

  const summaryAppts = useMemo(() => {
    if (summaryFilter === 0) {
      return appointments.filter(a => isSameDay(new Date(a.appointment_date), today))
    }
    const from = new Date(today)
    from.setDate(from.getDate() - summaryFilter)
    from.setHours(0, 0, 0, 0)
    const to = new Date(today)
    to.setHours(23, 59, 59, 999)
    return appointments.filter(a => {
      const d = new Date(a.appointment_date)
      return d >= from && d <= to
    })
  }, [appointments, today, summaryFilter])

  const stats = useMemo(() => ({
    total:     summaryAppts.length,
    pending:   summaryAppts.filter(a => a.status === 'received').length,
    done:      summaryAppts.filter(a => a.status === 'done').length,
    cancelled: summaryAppts.filter(a => a.status === 'cancelled').length,
  }), [summaryAppts])

  const upcoming = useMemo(() => {
    const now   = new Date()
    let from, to

    if (upcomingFilter === 'today') {
      from = now
      to   = new Date(today)
      to.setHours(23, 59, 59, 999)
    } else if (upcomingFilter === 'tomorrow') {
      from = new Date(today)
      from.setDate(from.getDate() + 1)
      from.setHours(0, 0, 0, 0)
      to = new Date(from)
      to.setHours(23, 59, 59, 999)
    } else {
      // 7 días
      from = now
      to   = new Date(today)
      to.setDate(to.getDate() + 7)
      to.setHours(23, 59, 59, 999)
    }

    return appointments
      .filter(a => {
        const d = new Date(a.appointment_date)
        return d >= from && d <= to && a.status === 'received'
      })
      .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
  }, [appointments, today, upcomingFilter])

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return {
        label: d.toLocaleDateString('es', { weekday: 'short' }),
        count: appointments.filter(a => isSameDay(new Date(a.appointment_date), d)).length,
      }
    })
  }, [appointments])

  const recentClients = useMemo(() => {
    const seen = new Set()
    return appointments
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .reduce((acc, a) => {
        if (a.client && !seen.has(a.client.id)) {
          seen.add(a.client.id)
          acc.push(a.client)
        }
        return acc
      }, [])
      .slice(0, 6)
  }, [appointments])

  const todayLabel = today.toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-7">

      {/* ── Cabecera ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-sans text-xs text-text-light tracking-wide capitalize">{todayLabel}</p>
          <h1 className="font-serif text-2xl text-text-dark">
            {getGreeting()}, {user?.first_name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="font-sans text-[11px] text-text-light/60">
              Actualizado {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <button
            onClick={() => fetchData(false)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 font-sans text-xs font-medium text-text-light hover:text-primary-dark px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Actualizar datos"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <span className="font-sans text-xs text-text-light/60 bg-neutral-light px-3 py-1.5 rounded-full capitalize">
            {user?.rol === 'admin' ? 'Administrador' : 'Recepcionista'}
          </span>
        </div>
      </div>

      {/* ── 1. Resumen rápido ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-sans text-xs font-semibold tracking-[1.5px] uppercase text-text-light">
            {summaryFilter === 0 ? 'Resumen de hoy' : `Resumen — últimos ${summaryFilter} días`}
          </h2>
          <div className="flex items-center gap-1">
            {[{ label: 'Hoy', value: 0 }, { label: '7d', value: 7 }, { label: '15d', value: 15 }, { label: '30d', value: 30 }, { label: '60d', value: 60 }].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSummaryFilter(opt.value)}
                className={`font-sans text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  summaryFilter === opt.value
                    ? 'bg-primary/15 text-primary-dark font-semibold'
                    : 'text-text-light hover:bg-neutral-light'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label={summaryFilter === 0 ? 'Citas hoy' : 'Total citas'} value={stats.total}     Icon={CalendarIcon}    iconBg="bg-primary/10"   iconColor="text-primary-dark" loading={loading} />
          <StatCard label="Pendientes"  value={stats.pending}   Icon={ClockIcon}        iconBg="bg-amber-50"     iconColor="text-amber-500"    loading={loading} />
          <StatCard label="Completadas" value={stats.done}      Icon={CheckCircleIcon}  iconBg="bg-emerald-50"   iconColor="text-emerald-500"  loading={loading} />
          <StatCard label="Canceladas"  value={stats.cancelled} Icon={XCircleIcon}      iconBg="bg-red-50"       iconColor="text-red-400"      loading={loading} />
        </div>
      </section>

      {/* ── 2 + 3. Próximas citas + Citas por día ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <section className="bg-white border border-neutral-gray rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-xs font-semibold tracking-[1.5px] uppercase text-text-light">
              Próximas citas
            </h2>
            <div className="flex items-center gap-1">
              {[{ label: 'Hoy', value: 'today' }, { label: 'Mañana', value: 'tomorrow' }, { label: '7 días', value: '7days' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setUpcomingFilter(opt.value)}
                  className={`font-sans text-xs px-2.5 py-1 rounded-lg transition-colors ${
                    upcomingFilter === opt.value
                      ? 'bg-primary/15 text-primary-dark font-semibold'
                      : 'text-text-light hover:bg-neutral-light'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Skeleton rows={3} />
          ) : upcoming.length === 0 ? (
            <EmptyState text={upcomingFilter === 'today' ? 'Sin citas pendientes hoy' : upcomingFilter === 'tomorrow' ? 'Sin citas para mañana' : 'Sin citas en los próximos 7 días'} />
          ) : (
            <ul className="flex flex-col divide-y divide-neutral-gray/60">
              {upcoming.map(a => (
                <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-shrink-0 text-center w-12">
                    <p className="font-sans text-sm font-semibold text-primary-dark">
                      {fmtTime(a.appointment_date)}
                    </p>
                    {upcomingFilter === '7days' && (
                      <p className="font-sans text-[10px] text-text-light leading-none mt-0.5">
                        {new Date(a.appointment_date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-text-dark truncate">
                      {a.client?.name} {a.client?.last_name}
                    </p>
                    <p className="font-sans text-xs text-text-light truncate">
                      {a.list_services?.map(s => s.name).join(', ') || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS[a.status]?.dot ?? 'bg-neutral-gray'}`} />
                    <span className="font-sans text-[10px] text-text-light">
                      {STATUS[a.status]?.label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-neutral-gray rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-sans text-xs font-semibold tracking-[1.5px] uppercase text-text-light">
            Citas — últimos 7 días
          </h2>
          {loading ? (
            <div className="h-28 bg-neutral-light rounded-xl animate-pulse" />
          ) : (
            <MiniBarChart data={chartData} />
          )}
          <p className="font-sans text-[10px] text-text-light/50 text-center">
            Total: {chartData.reduce((s, d) => s + d.count, 0)} citas en la semana
          </p>
        </section>
      </div>

      {/* ── 4 + 5. Clientes + Usuarios del sistema ── */}
      <div className={`grid grid-cols-1 gap-5 ${isAdmin ? 'lg:grid-cols-2' : ''}`}>

        <section className="bg-white border border-neutral-gray rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-sans text-xs font-semibold tracking-[1.5px] uppercase text-text-light">
            Clientes recientes
          </h2>
          {loading ? (
            <Skeleton rows={4} />
          ) : recentClients.length === 0 ? (
            <EmptyState text="Sin clientes registrados" />
          ) : (
            <ul className="flex flex-col divide-y divide-neutral-gray/60">
              {recentClients.map(c => (
                <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-xs font-semibold text-primary-dark">
                      {c.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-text-dark truncate">
                      {c.name} {c.last_name}
                    </p>
                    <p className="font-sans text-xs text-text-light truncate">
                      {c.cellphone}{c.email ? ` · ${c.email}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isAdmin && (
          <section className="bg-white border border-neutral-gray rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="font-sans text-xs font-semibold tracking-[1.5px] uppercase text-text-light">
              Usuarios del sistema
            </h2>
            {loading ? (
              <Skeleton rows={3} />
            ) : sysUsers.length === 0 ? (
              <EmptyState text="Sin usuarios registrados" />
            ) : (
              <ul className="flex flex-col divide-y divide-neutral-gray/60">
                {sysUsers.map(u => (
                  <li key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-sans text-xs font-semibold text-primary-dark">
                        {u.first_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-sans text-sm font-medium text-text-dark truncate">
                          {u.first_name} {u.last_name}
                        </p>
                        <span className={`flex-shrink-0 font-sans text-[10px] px-2 py-0.5 rounded-full border ${
                          u.rol === 'admin'
                            ? 'bg-primary/10 text-primary-dark border-primary/20'
                            : 'bg-neutral-light text-text-light border-neutral-gray'
                        }`}>
                          {ROLE_LABEL[u.rol] ?? u.rol}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-text-light truncate">{u.email}</p>
                    </div>
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-neutral-gray'}`} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

      </div>
    </div>
  )
}

export default Dashboard

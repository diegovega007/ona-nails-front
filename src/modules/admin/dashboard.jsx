import { useEffect, useState, useMemo } from 'react'
import authService       from '../../services/login_service'
import appointmentService from '../../services/appointment_service'
import userService        from '../../services/user_service'
import CalendarIcon      from '../../assets/icons/calendarIcon'
import ClockIcon         from '../../assets/icons/clockIcon'
import CheckCircleIcon   from '../../assets/icons/checkCircleIcon'
import XCircleIcon       from '../../assets/icons/xCircleIcon'

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

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })

const STATUS = {
  received:    { label: 'Pendiente',    dot: 'bg-amber-400'  },
  in_progress: { label: 'En progreso',  dot: 'bg-blue-400'   },
  done:        { label: 'Completada',   dot: 'bg-emerald-400' },
  cancelled:   { label: 'Cancelada',    dot: 'bg-red-400'    },
}

const ROLE_LABEL = { admin: 'Administrador', receptionist: 'Recepcionista' }

// ─── Sub-componentes locales ──────────────────────────────────────────────────

const StatCard = ({ label, value, Icon, iconBg, iconColor, loading }) => (
  <div className="bg-white border border-neutral-gray rounded-2xl p-5 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <span className="font-sans text-[11px] font-semibold tracking-[1.5px] uppercase text-text-light">
        {label}
      </span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>
    <span className="font-serif text-4xl font-semibold text-text-dark leading-none">
      {loading ? <span className="text-2xl text-text-light/40">—</span> : value}
    </span>
  </div>
)

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
    <span className="font-sans text-sm text-text-light/50">{text}</span>
  </div>
)

const Skeleton = ({ rows = 3 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-neutral-light rounded-xl animate-pulse" />
    ))}
  </div>
)

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map(({ label, count }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
          {count > 0 && (
            <span className="font-sans text-[10px] text-text-light">{count}</span>
          )}
          <div className="w-full flex items-end flex-1">
            <div
              className="w-full bg-primary/25 hover:bg-primary/40 rounded-t-lg transition-all duration-500"
              style={{ height: count === 0 ? '4px' : `${Math.max((count / max) * 100, 8)}%` }}
            />
          </div>
          <span className="font-sans text-[10px] text-text-light capitalize">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const user    = authService.getUser()
  const isAdmin = user?.rol === 'admin'

  const [appointments, setAppointments] = useState([])
  const [sysUsers,     setSysUsers]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [timeFilter,   setTimeFilter]   = useState(2)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const calls = [appointmentService.getAllRaw()]
      if (isAdmin) calls.push(userService.getAll())

      const [appts, usrs = []] = await Promise.all(calls)
      setAppointments(appts)
      setSysUsers(usrs)
      setLoading(false)
    }
    fetchData()
  }, [isAdmin])

  // ── Computed stats ──────────────────────────────────────────────────────────
  const today = useMemo(() => new Date(), [])

  const todayAppts = useMemo(
    () => appointments.filter(a => isSameDay(new Date(a.appointment_date), today)),
    [appointments, today]
  )

  const stats = useMemo(() => ({
    total:     todayAppts.length,
    pending:   todayAppts.filter(a => a.status === 'received').length,
    done:      todayAppts.filter(a => a.status === 'done').length,
    cancelled: todayAppts.filter(a => a.status === 'cancelled').length,
  }), [todayAppts])

  // Próximas citas: pendientes dentro de las próximas X horas
  const upcoming = useMemo(() => {
    const now    = new Date()
    const cutoff = new Date(now.getTime() + timeFilter * 3_600_000)
    return appointments
      .filter(a => {
        const d = new Date(a.appointment_date)
        return d >= now && d <= cutoff && a.status === 'received'
      })
      .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
  }, [appointments, timeFilter])

  // Citas por día: últimos 7 días
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

  // Clientes recientes únicos
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <p className="font-sans text-xs text-text-light tracking-wide capitalize">{todayLabel}</p>
          <h1 className="font-serif text-2xl text-text-dark">
            {getGreeting()}, {user?.first_name}
          </h1>
        </div>
        <span className="font-sans text-xs text-text-light/60 bg-neutral-light px-3 py-1.5 rounded-full capitalize">
          {user?.rol === 'admin' ? 'Administrador' : 'Recepcionista'}
        </span>
      </div>

      {/* ── 1. Resumen rápido ── */}
      <section>
        <h2 className="font-sans text-xs font-semibold tracking-[1.5px] uppercase text-text-light mb-3">
          Resumen de hoy
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Citas hoy"
            value={stats.total}
            Icon={CalendarIcon}
            iconBg="bg-primary/10"
            iconColor="text-primary-dark"
            loading={loading}
          />
          <StatCard
            label="Pendientes"
            value={stats.pending}
            Icon={ClockIcon}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            loading={loading}
          />
          <StatCard
            label="Completadas"
            value={stats.done}
            Icon={CheckCircleIcon}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
            loading={loading}
          />
          <StatCard
            label="Canceladas"
            value={stats.cancelled}
            Icon={XCircleIcon}
            iconBg="bg-red-50"
            iconColor="text-red-400"
            loading={loading}
          />
        </div>
      </section>

      {/* ── 2 + 3. Próximas citas + Citas por día ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Próximas citas */}
        <section className="bg-white border border-neutral-gray rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-xs font-semibold tracking-[1.5px] uppercase text-text-light">
              Próximas citas
            </h2>
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(Number(e.target.value))}
              className="font-sans text-xs text-text-dark bg-neutral-light border-0 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value={1}>1 hora</option>
              <option value={2}>2 horas</option>
              <option value={4}>4 horas</option>
              <option value={8}>8 horas</option>
            </select>
          </div>

          {loading ? (
            <Skeleton rows={3} />
          ) : upcoming.length === 0 ? (
            <EmptyState text={`Sin citas en las próximas ${timeFilter}h`} />
          ) : (
            <ul className="flex flex-col divide-y divide-neutral-gray/60">
              {upcoming.map(a => (
                <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-shrink-0 text-center w-12">
                    <p className="font-sans text-sm font-semibold text-primary-dark">
                      {fmtTime(a.appointment_date)}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-text-dark truncate">
                      {a.client?.name} {a.client?.last_name}
                    </p>
                    <p className="font-sans text-xs text-text-light truncate">
                      {a.service?.name}
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

        {/* Citas por día */}
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

        {/* 4. Clientes recientes */}
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

        {/* 5. Usuarios del sistema (solo admin) */}
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

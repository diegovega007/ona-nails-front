import { useMemo, useState } from 'react'
import StatusBadge, { STATUS } from './StatusBadge'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** @param {Date} d */
const dayKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

const fmtPrice = (n) =>
  Number(n ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

/** Mes visible: 42 celdas (6 semanas), lunes como primer día. */
function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const padStart = (first.getDay() + 6) % 7
  const cells = []
  const cursor = new Date(year, month, 1 - padStart)
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return cells
}

/**
 * Calendario mensual alimentado por GET /v1.0/appointments/ (lista ya ordenada por fecha).
 */
const AppointmentsCalendar = ({ appointments, loading, onEditAppointment }) => {
  const [viewMonth, setViewMonth] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [selectedKey, setSelectedKey] = useState(() => dayKey(new Date()))

  const byDay = useMemo(() => {
    const map = new Map()
    for (const a of appointments) {
      const k = dayKey(new Date(a.appointment_date))
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(a)
    }
    for (const list of map.values()) {
      list.sort((x, y) => new Date(x.appointment_date) - new Date(y.appointment_date))
    }
    return map
  }, [appointments])

  const summary = useMemo(() => {
    let pend = 0
    let prog = 0
    let done = 0
    let cancel = 0
    for (const a of appointments) {
      if (a.status === 'received') pend++
      else if (a.status === 'in_progress') prog++
      else if (a.status === 'done') done++
      else if (a.status === 'cancelled') cancel++
    }
    return { pend, prog, done, cancel }
  }, [appointments])

  const y = viewMonth.getFullYear()
  const m = viewMonth.getMonth()
  const grid = useMemo(() => buildMonthGrid(y, m), [y, m])
  const todayKey = dayKey(new Date())
  const monthLabel = viewMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  const goPrev = () => {
    const nm = new Date(y, m - 1, 1)
    setViewMonth(nm)
    setSelectedKey(dayKey(nm))
  }
  const goNext = () => {
    const nm = new Date(y, m + 1, 1)
    setViewMonth(nm)
    setSelectedKey(dayKey(nm))
  }
  const goToday = () => {
    const n = new Date()
    setViewMonth(new Date(n.getFullYear(), n.getMonth(), 1))
    setSelectedKey(dayKey(n))
  }

  const selectedList = byDay.get(selectedKey) ?? []

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-4 animate-pulse">
        <div className="flex-1 min-w-0 bg-white border border-neutral-gray rounded-xl p-4">
          <div className="h-6 bg-neutral-light rounded-lg w-40 mb-4" />
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-neutral-light rounded-lg" />
            ))}
          </div>
        </div>
        <div className="w-full lg:w-72 shrink-0 bg-white border border-neutral-gray rounded-xl p-4 h-64" />
      </div>
    )
  }

  const legend = (
    <div className="flex flex-col items-start gap-2 text-left">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-text-light">Estados</span>
      <div className="flex flex-col gap-1.5 w-full">
        <span className="inline-flex items-center justify-start gap-1.5 font-sans text-[11px] text-text-dark">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS.received.dot}`} />
          Pendiente
          <span className="font-medium tabular-nums text-text-light">({summary.pend})</span>
        </span>
        <span className="inline-flex items-center justify-start gap-1.5 font-sans text-[11px] text-text-dark">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS.in_progress.dot}`} />
          En progreso
          <span className="font-medium tabular-nums text-text-light">({summary.prog})</span>
        </span>
        <span className="inline-flex items-center justify-start gap-1.5 font-sans text-[11px] text-text-dark">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS.done.dot}`} />
          Completadas
          <span className="font-medium tabular-nums text-text-light">({summary.done})</span>
        </span>
        {summary.cancel > 0 && (
          <span className="inline-flex items-center justify-start gap-1.5 font-sans text-[11px] text-text-dark">
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS.cancelled.dot}`} />
            Canceladas
            <span className="font-medium tabular-nums text-text-light">({summary.cancel})</span>
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
      {/* Calendario (izquierda, más ancho) */}
      <div className="flex-1 min-w-0 bg-white border border-neutral-gray rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-gray/60 bg-neutral-light/30">
          <button
            type="button"
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-light hover:text-text-dark hover:bg-white border border-transparent hover:border-neutral-gray transition-colors"
            aria-label="Mes anterior"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="text-center px-2">
            <h2 className="font-serif text-base sm:text-lg text-text-dark capitalize leading-tight">{monthLabel}</h2>
            <button
              type="button"
              onClick={goToday}
              className="font-sans text-[10px] text-primary-dark hover:underline mt-0.5"
            >
              Ir a hoy
            </button>
          </div>
          <button
            type="button"
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-light hover:text-text-dark hover:bg-white border border-transparent hover:border-neutral-gray transition-colors"
            aria-label="Mes siguiente"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-neutral-gray/40 bg-neutral-light/20">
          {WEEKDAYS.map(w => (
            <div key={w} className="py-1.5 text-center font-sans text-[10px] font-semibold tracking-wide uppercase text-text-light">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-neutral-gray/30 p-px">
          {grid.map((d) => {
            const k = dayKey(d)
            const inMonth = d.getMonth() === m
            const isToday = k === todayKey
            const isSelected = k === selectedKey
            const dayAppts = byDay.get(k) ?? []

            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedKey(k)}
                className={`min-h-[3.5rem] sm:min-h-[4rem] p-1.5 text-left transition-colors flex flex-col gap-0.5 ${
                  inMonth ? 'bg-white' : 'bg-neutral-light/50'
                } ${isSelected ? 'ring-2 ring-primary/40 ring-inset z-[1]' : ''} ${isToday ? 'bg-primary/5' : ''} hover:bg-primary/8`}
              >
                <span
                  className={`font-sans text-[11px] sm:text-xs font-semibold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-primary-dark text-white' : inMonth ? 'text-text-dark' : 'text-text-light'
                  }`}
                >
                  {d.getDate()}
                </span>
                <div className="flex flex-wrap gap-0.5 mt-auto justify-start">
                  {dayAppts.slice(0, 4).map(a => (
                    <span
                      key={a.id}
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS[a.status]?.dot ?? 'bg-neutral-gray'}`}
                      title={`${fmtTime(a.appointment_date)} · ${a.client?.name ?? ''}`}
                    />
                  ))}
                  {dayAppts.length > 4 && (
                    <span className="font-sans text-[8px] text-text-light leading-none pl-0.5">+{dayAppts.length - 4}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Derecha: estados + citas del día (clientes) */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4">
        <div className="bg-white border border-neutral-gray rounded-xl p-4 shadow-sm">
          {legend}
        </div>

        <div className="bg-white border border-neutral-gray rounded-xl overflow-hidden shadow-sm flex flex-col flex-1 min-h-0 lg:max-h-[min(32rem,calc(100vh-14rem))]">
          <div className="px-3 py-2.5 border-b border-neutral-gray/60 bg-neutral-light/30 text-left">
            <h3 className="font-serif text-sm text-text-dark leading-snug">
              Citas del{' '}
              {selectedKey
                ? new Date(selectedKey + 'T12:00:00').toLocaleDateString('es-CO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </h3>
            <p className="font-sans text-[11px] text-text-light mt-0.5">
              {selectedList.length === 0
                ? 'Sin citas este día'
                : `${selectedList.length} cita${selectedList.length !== 1 ? 's' : ''} · por hora`}
            </p>
          </div>
          <ul className="divide-y divide-neutral-gray/50 overflow-y-auto flex-1">
            {selectedList.map(a => (
              <li key={a.id} className="px-3 py-2.5 hover:bg-neutral-light/20 text-left">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-sans text-xs font-medium text-text-dark tabular-nums shrink-0">
                      {fmtTime(a.appointment_date)}
                    </span>
                    <p className="font-sans text-sm text-text-dark font-medium leading-snug truncate min-w-0">
                      {a.client?.name} {a.client?.last_name}
                    </p>
                  </div>
                  <p className="font-sans text-[10px] text-text-light line-clamp-2">
                    {a.list_services?.map(s => s.name).join(' · ') || '—'} · {fmtPrice(a.total)}
                  </p>
                  <div className="flex items-center justify-start gap-2 flex-wrap mt-0.5">
                    <StatusBadge status={a.status} />
                    <button
                      type="button"
                      onClick={() => onEditAppointment(a.client, a)}
                      className="font-sans text-[11px] font-medium text-primary-dark hover:underline px-2 py-1 rounded-lg hover:bg-primary/8"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AppointmentsCalendar

import { useState, useEffect } from 'react'
import CalendarIcon from '../../../assets/icons/calendarIcon'
import ClockIcon from '../../../assets/icons/clockIcon'
import XCircleIcon from '../../../assets/icons/xCircleIcon'
import SpinnerIcon from '../../../assets/icons/spinnerIcon'
import { Field } from './Field'
import agendaService from '../../../services/agenda_service'

// YYYY-MM-DD de hoy en timezone México, independiente del browser
const today = new Date()
  .toLocaleDateString('sv-SE', { timeZone: 'America/Mexico_City' })

// Extrae HH:MM directamente del string ISO sin pasar por Date/getHours,
// evitando que el timezone del browser distorsione la hora mostrada.
// Funciona tanto para naive ("T10:30:00") como para offset-aware ("T10:30:00-06:00").
const toHHMM = (isoString) => {
  const m = isoString.match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : '--:--'
}

export default function StepDateTime({ form, errors, onChange, apiError }) {
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingAgenda,  setLoadingAgenda]  = useState(false)

  useEffect(() => {
    if (!form.date) {
      setAvailableSlots([])
      onChange('time', '')
      return
    }

    // Usar offset explícito de México (-06:00) para que el servidor reciba
    // siempre la medianoche correcta independientemente del timezone del browser.
    const dayStart = new Date(`${form.date}T00:00:00-06:00`)
    const dayEnd   = new Date(`${form.date}T23:59:59.999-06:00`)

    setLoadingAgenda(true)
    onChange('time', '')

    agendaService.getAvailability(dayStart, dayEnd).then(data => {
      setAvailableSlots((data.avilable_schedule ?? []).map(toHHMM))
      setLoadingAgenda(false)
    })
  }, [form.date]) // eslint-disable-line react-hooks/exhaustive-deps

  const allSlots = availableSlots

  return (
    <div className="flex flex-col gap-5">
      <p className="font-sans text-sm text-text-light">
        Elige cuándo quieres tu cita
      </p>

      {/* Fecha */}
      <Field label="Fecha *" error={errors.date}>
        <div className={`flex items-center gap-3 h-12 px-4 rounded-[10px] border-[1.5px] transition-colors duration-200 ${
          errors.date
            ? 'border-red-400 bg-red-50'
            : 'border-neutral-gray bg-neutral-light focus-within:border-primary'
        }`}>
          <CalendarIcon className="w-[18px] h-[18px] text-primary-dark shrink-0" />
          <input
            type="date"
            min={today}
            value={form.date}
            onChange={e => onChange('date', e.target.value)}
            className="flex-1 bg-transparent font-sans text-sm text-text-dark outline-none"
          />
        </div>
      </Field>

      {/* Horarios */}
      <div>
        <label className="font-sans text-[13px] font-medium text-neutral-dark block mb-2">
          Horario *
        </label>
        {errors.time && (
          <p className="font-sans text-xs text-red-500 mb-2">{errors.time}</p>
        )}

        {!form.date ? (
          <p className="font-sans text-xs text-text-light/60 py-4 text-center">
            Selecciona una fecha para ver los horarios disponibles
          </p>
        ) : loadingAgenda ? (
          <div className="flex justify-center py-6">
            <SpinnerIcon className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : allSlots.length === 0 ? (
          <p className="font-sans text-xs text-text-light/60 py-4 text-center">
            No hay horarios disponibles para este día
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {allSlots.map(h => {
              const active = form.time === h
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => onChange('time', h)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-sans text-xs font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-dark text-white shadow-md shadow-primary-dark/25'
                      : 'bg-neutral-light text-text-dark hover:bg-primary-light/40 border border-neutral-gray'
                  }`}
                >
                  <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                  {h}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Notas */}
      <Field label="Notas adicionales (opcional)">
        <textarea
          value={form.detail_service}
          onChange={e => onChange('detail_service', e.target.value)}
          placeholder="Cuéntanos si tienes alguna preferencia especial..."
          rows={3}
          className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-neutral-gray bg-neutral-light font-sans text-sm text-text-dark placeholder:text-neutral-dark/40 outline-none focus:border-primary transition-colors duration-200 resize-none"
        />
      </Field>

      {/* Error de API */}
      {apiError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <XCircleIcon className="w-4 h-4 shrink-0" />
          <span className="font-sans text-sm">{apiError}</span>
        </div>
      )}
    </div>
  )
}

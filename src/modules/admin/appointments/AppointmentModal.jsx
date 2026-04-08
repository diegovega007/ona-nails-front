import { useEffect, useState } from 'react'
import appointmentService from '../../../services/appointment_service'
import StatusBadge from './StatusBadge'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

const fmtDateTime = (iso) => `${fmtDate(iso)}, ${fmtTime(iso)}`

const toInputDatetime = (iso) => {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const initials = (name, lastName) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const inputCls  = 'w-full font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors placeholder:text-text-light/50'
const selectCls = 'w-full font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors cursor-pointer'

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-sans text-xs font-medium text-text-light">
      {label}{required && <span className="text-primary-dark ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

// ─── AppointmentModal ─────────────────────────────────────────────────────────

const AppointmentModal = ({ appointment, services, mode, onClose, onSaved, onDeleted }) => {
  const isView   = mode === 'view'
  const isEdit   = mode === 'edit'
  const isCreate = mode === 'create'

  const [form, setForm] = useState(() => {
    if (isCreate) return {
      service_id: '',
      client: { name: '', last_name: '', cellphone: '', email: '' },
      appointment_date: '',
      appintment_duration: '',
      detail_service: '',
      status: 'received',
    }
    return {
      id: appointment.id,
      service_id: appointment.service?.id ?? '',
      client_id: appointment.client?.id ?? '',
      appointment_date: appointment.appointment_date ? toInputDatetime(appointment.appointment_date) : '',
      appintment_duration: appointment.appintment_duration ?? '',
      detail_service: appointment.detail_service ?? '',
      status: appointment.status,
    }
  })

  const [saving,        setSaving]        = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [error,         setError]         = useState(null)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleClientChange = (field, value) => {
    setForm(prev => ({ ...prev, client: { ...prev.client, [field]: value } }))
    setError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      let result
      if (isCreate) {
        const dto = {
          service_id: Number(form.service_id),
          client: {
            name: form.client.name.trim(),
            last_name: form.client.last_name.trim(),
            cellphone: form.client.cellphone.trim(),
            email: form.client.email.trim() || undefined,
          },
          appointment_date: new Date(form.appointment_date).toISOString(),
          appintment_duration: form.appintment_duration ? Number(form.appintment_duration) : undefined,
          detail_service: form.detail_service.trim() || undefined,
          status: form.status,
        }
        result = await appointmentService.create(dto)
      } else {
        const dto = {
          id: form.id,
          service_id: Number(form.service_id),
          client_id: Number(form.client_id),
          appointment_date: new Date(form.appointment_date).toISOString(),
          appintment_duration: form.appintment_duration ? Number(form.appintment_duration) : undefined,
          detail_service: form.detail_service.trim() || undefined,
          status: form.status,
        }
        result = await appointmentService.update(dto)
      }
      onSaved(result)
    } catch (e) {
      setError(e?.message ?? 'Error al guardar la cita')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await appointmentService.remove(appointment.id)
      onDeleted(appointment.id)
    } catch (e) {
      setError(e?.message ?? 'Error al eliminar la cita')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-gray">
          <div>
            <h2 className="font-serif text-lg text-text-dark">
              {isCreate ? 'Nueva cita' : isEdit ? 'Editar cita' : 'Detalle de cita'}
            </h2>
            {!isCreate && (
              <p className="font-sans text-xs text-text-light mt-0.5">#{appointment.id}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-light hover:text-text-dark hover:bg-neutral-light transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 flex-1">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="font-sans text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Cliente (vista/edición) */}
          {!isCreate && (
            <div className="flex items-center gap-3 p-4 bg-neutral-light rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="font-sans text-sm font-semibold text-primary-dark">
                  {initials(appointment.client?.name, appointment.client?.last_name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-medium text-text-dark">
                  {appointment.client?.name} {appointment.client?.last_name}
                </p>
                <p className="font-sans text-xs text-text-light">
                  {appointment.client?.cellphone}
                  {appointment.client?.email ? ` · ${appointment.client.email}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Datos de nuevo cliente (create) */}
          {isCreate && (
            <fieldset className="flex flex-col gap-3">
              <legend className="font-sans text-xs font-semibold tracking-[1.2px] uppercase text-text-light mb-1">
                Datos del cliente
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre" required>
                  <input className={inputCls} value={form.client.name} onChange={e => handleClientChange('name', e.target.value)} placeholder="Ana" />
                </Field>
                <Field label="Apellido" required>
                  <input className={inputCls} value={form.client.last_name} onChange={e => handleClientChange('last_name', e.target.value)} placeholder="García" />
                </Field>
              </div>
              <Field label="Teléfono" required>
                <input className={inputCls} value={form.client.cellphone} onChange={e => handleClientChange('cellphone', e.target.value)} placeholder="3001234567" />
              </Field>
              <Field label="Correo electrónico">
                <input className={inputCls} type="email" value={form.client.email} onChange={e => handleClientChange('email', e.target.value)} placeholder="correo@ejemplo.com" />
              </Field>
            </fieldset>
          )}

          {/* Servicio */}
          <Field label="Servicio" required={!isView}>
            {isView ? (
              <p className="font-sans text-sm text-text-dark py-1">{appointment.service?.name ?? '—'}</p>
            ) : (
              <select className={selectCls} value={form.service_id} onChange={e => handleChange('service_id', e.target.value)}>
                <option value="">Seleccionar servicio</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </Field>

          {/* Fecha y duración */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha y hora" required={!isView}>
              {isView ? (
                <p className="font-sans text-sm text-text-dark py-1">{fmtDateTime(appointment.appointment_date)}</p>
              ) : (
                <input className={inputCls} type="datetime-local" value={form.appointment_date} onChange={e => handleChange('appointment_date', e.target.value)} />
              )}
            </Field>
            <Field label="Duración (min)">
              {isView ? (
                <p className="font-sans text-sm text-text-dark py-1">
                  {appointment.appintment_duration ? `${appointment.appintment_duration} min` : '—'}
                </p>
              ) : (
                <input className={inputCls} type="number" min="1" value={form.appintment_duration} onChange={e => handleChange('appintment_duration', e.target.value)} placeholder="60" />
              )}
            </Field>
          </div>

          {/* Estado (oculto en create, siempre se crea como 'received') */}
          {!isCreate && (
            <Field label="Estado" required={!isView}>
              {isView ? (
                <div className="py-1"><StatusBadge status={appointment.status} /></div>
              ) : (
                <select className={selectCls} value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  <option value="received">Pendiente</option>
                  <option value="in_progress">En progreso</option>
                  <option value="done">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              )}
            </Field>
          )}

          {/* Detalle */}
          <Field label="Detalle / Notas">
            {isView ? (
              <p className="font-sans text-sm text-text-dark/80 py-1 whitespace-pre-wrap">
                {appointment.detail_service || '—'}
              </p>
            ) : (
              <textarea className={`${inputCls} resize-none`} rows={3} maxLength={500} value={form.detail_service} onChange={e => handleChange('detail_service', e.target.value)} placeholder="Indicaciones especiales, diseño, color…" />
            )}
          </Field>

          {/* Timestamps (solo vista) */}
          {isView && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-sans text-text-light">Creada</p>
                <p className="font-sans text-text-dark mt-0.5">{fmtDateTime(appointment.created_at)}</p>
              </div>
              {appointment.modified_at && (
                <div>
                  <p className="font-sans text-text-light">Modificada</p>
                  <p className="font-sans text-text-dark mt-0.5">{fmtDateTime(appointment.modified_at)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-gray flex items-center justify-between gap-3">
          {isEdit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="font-sans text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          )}

          {isEdit && confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-red-500">¿Confirmar?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="font-sans text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-sans text-xs text-text-light hover:text-text-dark px-2 py-1.5 rounded-lg transition-colors"
              >
                No
              </button>
            </div>
          )}

          {!isEdit && !isCreate && <div />}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="font-sans text-sm text-text-light hover:text-text-dark px-4 py-2 rounded-lg hover:bg-neutral-light transition-colors"
            >
              {isView ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isView && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="font-sans text-sm font-medium text-white bg-primary-dark hover:bg-primary-dark/90 px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando…' : isCreate ? 'Crear cita' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentModal

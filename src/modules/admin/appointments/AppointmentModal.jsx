import { useEffect, useState, useMemo } from 'react'
import appointmentService from '../../../services/appointment_service'
import StatusBadge from './StatusBadge'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

const fmtDateTime = (iso) => `${fmtDate(iso)}, ${fmtTime(iso)}`

const fmtPrice = (amount) =>
  Number(amount ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

const toInputDatetime = (iso) => {
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
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

// ─── Barra de progreso de fidelidad ──────────────────────────────────────────

const LoyaltyProgress = ({ completed }) => {
  const count = Math.min(completed ?? 0, 6)
  return (
    <div className="flex flex-col gap-1.5 p-3 bg-primary/5 rounded-xl border border-primary/15">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-medium text-text-dark">Progromoción de fidelidad</span>
        <span className="font-sans text-xs text-primary-dark font-semibold">{count}/6 visitas</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i < count ? 'bg-primary-dark' : 'bg-neutral-gray'
            }`}
          />
        ))}
      </div>
      {count === 5 && (
        <p className="font-sans text-[11px] text-primary-dark font-medium">
          Esta es la 6a visita — selecciona una promoción
        </p>
      )}
    </div>
  )
}

// ─── AppointmentModal ─────────────────────────────────────────────────────────

const AppointmentModal = ({ client, appointment, services, promotions, mode, onClose, onSaved, onDeleted }) => {
  const isView   = mode === 'view'
  const isEdit   = mode === 'edit'
  const isCreate = mode === 'create'

  // El cliente puede venir del appointment (edición) o del prop directo
  const clientData = appointment?.client ?? client

  // IDs de servicios actualmente en la cita
  const currentServiceIds = useMemo(() =>
    (appointment?.list_services ?? []).map(s => s.id),
  [appointment])

  const [selectedServiceIds, setSelectedServiceIds] = useState(
    isCreate ? [] : currentServiceIds
  )

  const [form, setForm] = useState(() => {
    if (isCreate) return {
      client: {
        name: client?.name ?? '',
        last_name: client?.last_name ?? '',
        cellphone: client?.cellphone ?? '',
        email: client?.email ?? '',
      },
      client_id: client?.id ?? null,
      appointment_date: '',
      detail_service: '',
      status: 'received',
      promotion_id: '',
      duration: '',
    }
    return {
      id: appointment.id,
      client_id: appointment.client?.id ?? client?.id ?? '',
      appointment_date: appointment.appointment_date
        ? toInputDatetime(appointment.appointment_date)
        : '',
      detail_service: appointment.detail_service ?? '',
      status: appointment.status,
      promotion_id: appointment.promotion_id ?? '',
      duration: appointment.duration ?? '',
    }
  })

  const [saving,        setSaving]        = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [error,         setError]         = useState(null)

  // ── Lealtad y promoción obligatoria en 6ª visita ──────────────────────────

  const loyaltyCompleted  = clientData?.loyalty_completed ?? 0
  const isSixthVisit      = loyaltyCompleted === 5
  // La promoción es requerida si es la 6ª visita y se está marcando como completada
  const promoRequired     = isSixthVisit && form.status === 'done' && !isCreate

  // ── Totales calculados localmente (referencia) ────────────────────────────

  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id))
  const subtotalLocal    = selectedServices.reduce((sum, s) => sum + Number(s.price ?? 0), 0)
  const durationLocal    = selectedServices.reduce((sum, s) => sum + Number(s.duration ?? 0), 0)

  // Prioriza valores que vienen de la API (más precisos)
  const displaySubtotal  = isCreate ? subtotalLocal : (appointment?.subtotal ?? subtotalLocal)
  const displayTotal     = isCreate ? subtotalLocal : (appointment?.total     ?? subtotalLocal)
  const displayDuration  = isCreate ? durationLocal : (appointment?.duration  ?? durationLocal)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleClientChange = (field, value) => {
    setForm(prev => ({ ...prev, client: { ...prev.client, [field]: value } }))
    setError(null)
  }

  const toggleService = (id) => {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Auto-calcula duration al cambiar servicios (solo si el admin no la editó manualmente)
  const [durationEdited, setDurationEdited] = useState(false)
  useEffect(() => {
    if (!durationEdited) {
      setForm(prev => ({ ...prev, duration: durationLocal || '' }))
    }
  }, [durationLocal]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (promoRequired && !form.promotion_id) {
      setError('Debes seleccionar una promoción para la 6ª visita')
      return
    }

    setSaving(true)
    setError(null)
    try {
      let result
      if (isCreate) {
        const dto = {
          list_services:    selectedServiceIds,
          client:           {
            name:      form.client.name.trim(),
            last_name: form.client.last_name.trim(),
            cellphone: form.client.cellphone.trim(),
            email:     form.client.email?.trim() || undefined,
          },
          appointment_date: new Date(form.appointment_date).toISOString(),
          detail_service:   form.detail_service.trim() || undefined,
          status:           'received',
          promotion_id:     form.promotion_id ? Number(form.promotion_id) : undefined,
          duration:         form.duration !== '' ? Number(form.duration) : undefined,
        }
        result = await appointmentService.create(dto)
      } else {
        const dto = {
          id:               form.id,
          client_id:        Number(form.client_id),
          list_services:    selectedServiceIds,
          appointment_date: new Date(form.appointment_date).toISOString(),
          detail_service:   form.detail_service.trim() || undefined,
          status:           form.status,
          promotion_id:     form.promotion_id ? Number(form.promotion_id) : undefined,
          duration:         form.duration !== '' ? Number(form.duration) : undefined,
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-gray sticky top-0 bg-white z-10">
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

          {/* ── Info del cliente ── */}
          {!isCreate && clientData && (
            <div className="flex items-center gap-3 p-4 bg-neutral-light rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="font-sans text-sm font-semibold text-primary-dark">
                  {initials(clientData.name, clientData.last_name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-medium text-text-dark">
                  {clientData.name} {clientData.last_name}
                </p>
                <p className="font-sans text-xs text-text-light">
                  {clientData.cellphone}
                  {clientData.email ? ` · ${clientData.email}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* ── Datos del cliente (create) ── */}
          {isCreate && (
            <fieldset className="flex flex-col gap-3">
              <legend className="font-sans text-xs font-semibold tracking-[1.2px] uppercase text-text-light mb-1">
                Datos del cliente
              </legend>
              {/* Si ya hay un cliente seleccionado (desde ClientRow) mostramos solo lectura */}
              {form.client_id ? (
                <div className="flex items-center gap-3 p-3 bg-neutral-light rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-xs font-semibold text-primary-dark">
                      {initials(form.client.name, form.client.last_name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-text-dark">
                      {form.client.name} {form.client.last_name}
                    </p>
                    <p className="font-sans text-xs text-text-light">{form.client.cellphone}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
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
                </div>
              )}
            </fieldset>
          )}

          {/* ── Fidelidad (solo edición) ── */}
          {!isCreate && clientData && (
            <LoyaltyProgress completed={clientData.loyalty_completed} />
          )}

          {/* ── Servicios ── */}
          <Field label="Servicios" required={!isView}>
            {isView ? (
              <div className="flex flex-wrap gap-1.5 py-1">
                {appointment?.list_services?.length > 0
                  ? appointment.list_services.map(s => (
                      <span key={s.id} className="font-sans text-xs bg-primary/10 text-primary-dark px-2.5 py-1 rounded-full">
                        {s.name}
                      </span>
                    ))
                  : <p className="font-sans text-sm text-text-dark">—</p>
                }
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {services.filter(s => s.enabled).map(s => {
                  const checked = selectedServiceIds.includes(s.id)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border transition-all ${
                        checked
                          ? 'border-primary-dark bg-primary/8 text-primary-dark'
                          : 'border-neutral-gray bg-neutral-light hover:border-primary/40 text-text-dark'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                        checked ? 'bg-primary-dark border-primary-dark' : 'border-neutral-gray bg-white'
                      }`}>
                        {checked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans text-xs font-medium truncate">{s.name}</p>
                        <p className="font-sans text-[10px] text-text-light">
                          {Number(s.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                          {s.duration ? ` · ${s.duration} min` : ''}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </Field>

          {/* ── Fecha y duración ── */}
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
                <p className="font-sans text-sm text-text-dark py-2.5 px-3 bg-neutral-light/60 rounded-xl border border-neutral-gray/50">
                  {displayDuration > 0 ? `${displayDuration} min` : '—'}
                </p>
              ) : (
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="30"
                  value={form.duration}
                  onChange={e => {
                    setDurationEdited(true)
                    handleChange('duration', e.target.value)
                  }}
                  placeholder="Auto"
                />
              )}
            </Field>
          </div>

          {/* ── Estado ── */}
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

          {/* ── Promoción (visible siempre en edición; requerida en 6ª visita) ── */}
          {!isCreate && !isView && (
            <Field label={promoRequired ? 'Promoción de fidelidad *' : 'Promoción especial (opcional)'}>
              <select
                className={`${selectCls} ${promoRequired ? 'ring-2 ring-primary/30 border-primary/40' : ''}`}
                value={form.promotion_id}
                onChange={e => handleChange('promotion_id', e.target.value)}
              >
                <option value="">Sin promoción</option>
                {promotions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {promoRequired && !form.promotion_id && (
                <p className="font-sans text-[11px] text-primary-dark">
                  Requerida al completar la 6ª visita
                </p>
              )}
            </Field>
          )}
          {isView && appointment?.promotion && (
            <Field label="Promoción aplicada">
              <p className="font-sans text-sm text-text-dark py-1">
                {appointment.promotion.name}
              </p>
            </Field>
          )}

          {/* ── Totales ── */}
          {!isCreate && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-light rounded-xl">
              <div>
                <p className="font-sans text-xs text-text-light mb-0.5">Subtotal</p>
                <p className="font-sans text-sm font-semibold text-text-dark">{fmtPrice(displaySubtotal)}</p>
              </div>
              <div>
                <p className="font-sans text-xs text-text-light mb-0.5">Total</p>
                <p className="font-serif text-base font-semibold text-primary-dark">{fmtPrice(displayTotal)}</p>
              </div>
            </div>
          )}
          {isCreate && selectedServices.length > 0 && (
            <div className="p-4 bg-neutral-light rounded-xl">
              <div className="flex items-center justify-between">
                <p className="font-sans text-xs text-text-light">Total estimado</p>
                <p className="font-serif text-base font-semibold text-primary-dark">{fmtPrice(subtotalLocal)}</p>
              </div>
            </div>
          )}

          {/* ── Detalle ── */}
          <Field label="Detalle / Notas">
            {isView ? (
              <p className="font-sans text-sm text-text-dark/80 py-1 whitespace-pre-wrap">
                {appointment.detail_service || '—'}
              </p>
            ) : (
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                maxLength={500}
                value={form.detail_service}
                onChange={e => handleChange('detail_service', e.target.value)}
                placeholder="Indicaciones especiales, diseño, color…"
              />
            )}
          </Field>

          {/* ── Timestamps ── */}
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
        <div className="px-6 py-4 border-t border-neutral-gray flex items-center justify-between gap-3 sticky bottom-0 bg-white">
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

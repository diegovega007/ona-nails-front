import { useEffect, useRef, useState } from 'react'
import serviceService from '../../../services/service_service'
import EnabledBadge from './EnabledBadge'

// ServiceModal recibe serviceTypes: array de { id, name } para el selector de tipo

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

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

// ─── ServiceModal ─────────────────────────────────────────────────────────────

const ServiceModal = ({ service, serviceTypes = [], mode, onClose, onSaved, onDeleted }) => {
  const isView   = mode === 'view'
  const isEdit   = mode === 'edit'
  const isCreate = mode === 'create'

  const [form, setForm] = useState(() => {
    if (isCreate) return {
      name: '', description: '', price: '', duration: '', enabled: true, service_type_id: '',
    }
    return {
      id:              service.id,
      name:            service.name            ?? '',
      description:     service.description     ?? '',
      price:           service.price           ?? '',
      duration:        service.duration        ?? '',
      enabled:         service.enabled         ?? true,
      service_type_id: service.service_type_id ?? service.service_type?.id ?? '',
    }
  })

  const [file,          setFile]          = useState(null)      // File object
  const [preview,       setPreview]       = useState(          // URL for preview
    isView || isEdit ? (service?.photo ?? null) : null
  )
  const fileInputRef = useRef(null)

  const [saving,        setSaving]        = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [error,         setError]         = useState(null)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    if (selected) {
      setPreview(URL.createObjectURL(selected))
    } else {
      setPreview(isEdit ? (service?.photo ?? null) : null)
    }
    setError(null)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(isEdit ? (service?.photo ?? null) : null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    if (!form.name.trim())
      return setError('El nombre es requerido.')
    if (!form.service_type_id)
      return setError('Selecciona un tipo de servicio.')
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
      return setError('El precio debe ser un número válido.')
    if (form.duration === '' || isNaN(Number(form.duration)) || Number(form.duration) <= 0)
      return setError('La duración debe ser un número mayor a 0.')

    setSaving(true)
    setError(null)
    try {
      const dto = {
        name:            form.name.trim(),
        description:     form.description.trim() || undefined,
        price:           Number(form.price),
        duration:        Number(form.duration),
        enabled:         isCreate ? true : form.enabled,
        service_type_id: Number(form.service_type_id),
      }
      let result
      if (isCreate) {
        result = await serviceService.create(dto, file)
      } else {
        result = await serviceService.update({ id: form.id, ...dto }, file)
      }
      onSaved(result)
    } catch (e) {
      setError(e?.message ?? 'Error al guardar el servicio.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await serviceService.remove(service.id)
      onDeleted(service.id)
    } catch (e) {
      setError(e?.message ?? 'Error al eliminar el servicio.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Liberar object URL al desmontar
  useEffect(() => {
    return () => {
      if (file && preview) URL.revokeObjectURL(preview)
    }
  }, [file, preview])

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
              {isCreate ? 'Nuevo servicio' : isEdit ? 'Editar servicio' : 'Detalle del servicio'}
            </h2>
            {!isCreate && (
              <p className="font-sans text-xs text-text-light mt-0.5">#{service.id}</p>
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

          {/* Tipo de servicio */}
          <Field label="Tipo de servicio" required={!isView}>
            {isView ? (
              <p className="font-sans text-sm text-text-dark py-1">
                {service.service_type?.name ?? '—'}
              </p>
            ) : (
              <select
                className={selectCls}
                value={form.service_type_id}
                onChange={e => handleChange('service_type_id', e.target.value)}
              >
                <option value="">Seleccionar tipo…</option>
                {serviceTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </Field>

          {/* Nombre */}
          <Field label="Nombre" required={!isView}>
            {isView ? (
              <p className="font-sans text-sm text-text-dark py-1">{service.name}</p>
            ) : (
              <input
                className={inputCls}
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Ej. Manicure Semipermanente"
                maxLength={255}
              />
            )}
          </Field>

          {/* Descripción */}
          <Field label="Descripción">
            {isView ? (
              <p className="font-sans text-sm text-text-dark/80 py-1 whitespace-pre-wrap">
                {service.description || '—'}
              </p>
            ) : (
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                maxLength={255}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Breve descripción del servicio…"
              />
            )}
          </Field>

          {/* Precio, Duración y Estado */}
          <div className={`grid gap-3 ${isCreate ? 'grid-cols-2' : 'grid-cols-2'}`}>
            <Field label="Precio (COP)" required={!isView}>
              {isView ? (
                <p className="font-sans text-sm text-text-dark py-1">
                  {Number(service.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </p>
              ) : (
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="500"
                  value={form.price}
                  onChange={e => handleChange('price', e.target.value)}
                  placeholder="50000"
                />
              )}
            </Field>

            <Field label="Duración (min)" required={!isView}>
              {isView ? (
                <p className="font-sans text-sm text-text-dark py-1">
                  {service.duration ? `${service.duration} min` : '—'}
                </p>
              ) : (
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  step="5"
                  value={form.duration}
                  onChange={e => handleChange('duration', e.target.value)}
                  placeholder="60"
                />
              )}
            </Field>
          </div>

          {!isCreate && (
            <Field label="Estado">
              {isView ? (
                <div className="py-1"><EnabledBadge enabled={service.enabled} /></div>
              ) : (
                <select
                  className={selectCls}
                  value={form.enabled ? 'true' : 'false'}
                  onChange={e => handleChange('enabled', e.target.value === 'true')}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              )}
            </Field>
          )}

          {/* Imagen */}
          <Field label="Imagen">
            {isView ? (
              preview ? (
                <div className="rounded-xl overflow-hidden border border-neutral-gray bg-neutral-light aspect-video flex items-center justify-center">
                  <img
                    src={preview}
                    alt={service.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <p className="font-sans text-sm text-text-dark/50 py-1">Sin imagen</p>
              )
            ) : (
              <div className="flex flex-col gap-3">
                {/* Preview */}
                {preview && (
                  <div className="relative rounded-xl overflow-hidden border border-neutral-gray bg-neutral-light aspect-video flex items-center justify-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    {file && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        title="Quitar imagen seleccionada"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {/* File input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full font-sans text-sm text-text-light border border-dashed border-neutral-gray rounded-xl px-3 py-3 hover:border-primary/50 hover:text-primary-dark hover:bg-primary/5 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {file ? file.name : preview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </button>
              </div>
            )}
          </Field>

          {/* Timestamps (solo vista) */}
          {isView && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-sans text-text-light">Creado</p>
                <p className="font-sans text-text-dark mt-0.5">{fmtDateTime(service.created_at)}</p>
                {service.created_by && (
                  <p className="font-sans text-text-light/60 mt-0.5">{service.created_by}</p>
                )}
              </div>
              {service.modified_at && (
                <div>
                  <p className="font-sans text-text-light">Modificado</p>
                  <p className="font-sans text-text-dark mt-0.5">{fmtDateTime(service.modified_at)}</p>
                  {service.modified_by && (
                    <p className="font-sans text-text-light/60 mt-0.5">{service.modified_by}</p>
                  )}
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
                {saving ? 'Guardando…' : isCreate ? 'Crear servicio' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceModal

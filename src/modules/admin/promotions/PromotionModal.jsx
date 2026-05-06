import { useEffect, useState } from 'react'
import promotionService from '../../../services/promotion_service'

// ─── Estilos ──────────────────────────────────────────────────────────────────

const inputCls    = 'w-full font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors placeholder:text-text-light/50'
const textareaCls = `${inputCls} resize-none`

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-sans text-xs font-medium text-text-light">
      {label}{required && <span className="text-primary-dark ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

// ─── PromotionModal ───────────────────────────────────────────────────────────

const PromotionModal = ({ promotion, mode, onClose, onSaved, onDeleted }) => {
  const isView   = mode === 'view'
  const isEdit   = mode === 'edit'
  const isCreate = mode === 'create'

  const [form, setForm] = useState({
    identifier:  promotion?.identifier  ?? '',
    name:        promotion?.name        ?? '',
    description: promotion?.description ?? '',
  })

  const [saving,        setSaving]        = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [error,         setError]         = useState(null)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSave = async () => {
    if (!form.identifier.trim() || !form.name.trim()) {
      setError('El identificador y el nombre son requeridos')
      return
    }
    setSaving(true)
    setError(null)
    try {
      let result
      const dto = {
        identifier:  form.identifier.trim(),
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
      }
      if (isCreate) {
        result = await promotionService.create(dto)
      } else {
        result = await promotionService.update(promotion.id, { ...dto, id: promotion.id })
      }
      onSaved(result)
    } catch (e) {
      setError(e?.message ?? 'Error al guardar la promoción')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await promotionService.remove(promotion.id)
      onDeleted(promotion.id)
    } catch (e) {
      setError(e?.message ?? 'Error al eliminar la promoción')
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-gray">
          <div>
            <h2 className="font-serif text-lg text-text-dark">
              {isCreate ? 'Nueva promoción' : isEdit ? 'Editar promoción' : 'Detalle de promoción'}
            </h2>
            {!isCreate && (
              <p className="font-sans text-xs text-text-light mt-0.5">#{promotion.id}</p>
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
        <div className="px-6 py-5 flex flex-col gap-4 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="font-sans text-sm text-red-600">{error}</p>
            </div>
          )}

          <Field label="Identificador" required={!isView}>
            {isView ? (
              <p className="font-sans text-sm font-mono text-text-dark py-1 bg-neutral-light px-3 rounded-xl">
                {promotion.identifier}
              </p>
            ) : (
              <input
                className={inputCls}
                value={form.identifier}
                onChange={e => handleChange('identifier', e.target.value.toUpperCase().replace(/\s/g, '_'))}
                placeholder="PROMO_LEALTAD"
              />
            )}
          </Field>

          <Field label="Nombre" required={!isView}>
            {isView ? (
              <p className="font-sans text-sm text-text-dark py-1">{promotion.name}</p>
            ) : (
              <input
                className={inputCls}
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Descuento por fidelidad"
              />
            )}
          </Field>

          <Field label="Descripción">
            {isView ? (
              <p className="font-sans text-sm text-text-dark/80 py-1 whitespace-pre-wrap">
                {promotion.description || '—'}
              </p>
            ) : (
              <textarea
                className={textareaCls}
                rows={3}
                maxLength={255}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Describe los beneficios de esta promoción…"
              />
            )}
          </Field>

          {isView && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-sans text-text-light">Creada por</p>
                <p className="font-sans text-text-dark mt-0.5">{promotion.created_by}</p>
              </div>
              {promotion.modified_by && (
                <div>
                  <p className="font-sans text-text-light">Modificada por</p>
                  <p className="font-sans text-text-dark mt-0.5">{promotion.modified_by}</p>
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
                {saving ? 'Guardando…' : isCreate ? 'Crear promoción' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromotionModal

import { useEffect, useState } from 'react'
import clientService from '../../../services/client_service'

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

const ClientEditModal = ({ client, onClose, onSaved }) => {
  const [form, setForm] = useState(() => ({
    name:               client.name ?? '',
    last_name:          client.last_name ?? '',
    cellphone:          client.cellphone ?? '',
    email:              client.email ?? '',
    loyalty_completed:  client.loyalty_completed ?? 0,
  }))
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.last_name.trim() || !form.cellphone.trim()) {
      setError('Nombre, apellido y teléfono son requeridos')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await clientService.update({
        id:                client.id,
        name:              form.name.trim(),
        last_name:         form.last_name.trim(),
        cellphone:         form.cellphone.trim(),
        email:             form.email.trim() || null,
        loyalty_completed: Number(form.loyalty_completed),
      })
      onSaved()
    } catch (e) {
      setError(e?.message ?? 'Error al guardar el cliente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-gray">
          <div>
            <h2 className="font-serif text-lg text-text-dark">Editar cliente</h2>
            <p className="font-sans text-xs text-text-light mt-0.5">
              {client.name} {client.last_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-light hover:text-text-dark hover:bg-neutral-light transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="font-sans text-sm text-red-600">{error}</p>
            </div>
          )}

          <Field label="Nombre" required>
            <input
              className={inputCls}
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              autoComplete="given-name"
            />
          </Field>

          <Field label="Apellido" required>
            <input
              className={inputCls}
              value={form.last_name}
              onChange={e => handleChange('last_name', e.target.value)}
              autoComplete="family-name"
            />
          </Field>

          <Field label="Teléfono" required>
            <input
              className={inputCls}
              value={form.cellphone}
              onChange={e => handleChange('cellphone', e.target.value)}
              autoComplete="tel"
            />
          </Field>

          <Field label="Correo">
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              autoComplete="email"
            />
          </Field>

          <Field label="Visitas completadas (fidelidad)">
            <select
              className={selectCls}
              value={form.loyalty_completed}
              onChange={e => handleChange('loyalty_completed', Number(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} / 6</option>
              ))}
            </select>
            <p className="font-sans text-[11px] text-text-light">
              Indica cuántas visitas completadas lleva el cliente en el programa de lealtad.
            </p>
          </Field>
        </div>

        <div className="px-6 py-4 border-t border-neutral-gray flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-sm text-text-light hover:text-text-dark px-4 py-2 rounded-lg hover:bg-neutral-light transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="font-sans text-sm font-medium text-white bg-primary-dark hover:bg-primary-dark/90 px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClientEditModal

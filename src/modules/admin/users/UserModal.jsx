import { useEffect, useState } from 'react'
import userService from '../../../services/user_service'
import authService from '../../../services/auth_service'
import RoleBadge from './RoleBadge'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'

const initials = (u) =>
  `${u?.first_name?.[0] ?? ''}${u?.last_name?.[0] ?? ''}`.toUpperCase() || '?'

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

// ─── Indicador de fortaleza de contraseña ─────────────────────────────────────

const passwordStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)                    score++
  if (/[A-Z]/.test(pwd))                  score++
  if (/[0-9]/.test(pwd))                  score++
  if (/[^A-Za-z0-9]/.test(pwd))           score++
  if (pwd.length >= 12)                   score++

  if (score <= 1) return { level: 1, label: 'Muy débil',  color: 'bg-red-400' }
  if (score === 2) return { level: 2, label: 'Débil',     color: 'bg-orange-400' }
  if (score === 3) return { level: 3, label: 'Moderada',  color: 'bg-yellow-400' }
  if (score === 4) return { level: 4, label: 'Fuerte',    color: 'bg-emerald-400' }
  return             { level: 5, label: 'Muy fuerte', color: 'bg-emerald-600' }
}

const PasswordStrengthBar = ({ password }) => {
  const { level, label, color } = passwordStrength(password)
  if (!password) return null
  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${n <= level ? color : 'bg-neutral-gray'}`}
          />
        ))}
      </div>
      <p className={`font-sans text-[11px] ${level >= 4 ? 'text-emerald-600' : level >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
        {label}
      </p>
    </div>
  )
}

// ─── EyeIcon (mostrar/ocultar contraseña) ─────────────────────────────────────

const EyeIcon = ({ open }) => open ? (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

// ─── UserModal ────────────────────────────────────────────────────────────────

const UserModal = ({ user, mode, onClose, onSaved, onDeleted }) => {
  const isView   = mode === 'view'
  const isEdit   = mode === 'edit'
  const isCreate = mode === 'create'

  // El usuario autenticado actualmente (para bloquear auto-eliminación)
  const currentUser = authService.getUser()
  const isSelf = isEdit && user && currentUser && user.id === currentUser.id

  const [form, setForm] = useState(() => {
    if (isCreate) {
      return { first_name: '', last_name: '', email: '', cellphone: '', password: '', rol: 'receptionist', is_active: true }
    }
    return {
      id:         user.id,
      first_name: user.first_name ?? '',
      last_name:  user.last_name  ?? '',
      email:      user.email      ?? '',
      cellphone:  user.cellphone  ?? '',
      password:   '',            // vacío = no cambiar
      rol:        user.rol        ?? 'receptionist',
      is_active:  user.is_active  ?? true,
    }
  })

  const [showPwd,       setShowPwd]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [error,         setError]         = useState(null)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  // ── Validación ───────────────────────────────────────────────────────────

  const validate = () => {
    if (!form.first_name.trim()) return 'El nombre es requerido.'
    if (!form.last_name.trim())  return 'El apellido es requerido.'
    if (!form.email.trim())      return 'El correo electrónico es requerido.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Ingresa un correo válido.'
    if (isCreate) {
      if (!form.password)          return 'La contraseña es requerida.'
      if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
      const { level } = passwordStrength(form.password)
      if (level < 3)               return 'La contraseña es demasiado débil. Usa mayúsculas, números o símbolos.'
    }
    if (isEdit && form.password && form.password.length < 8) {
      return 'La nueva contraseña debe tener al menos 8 caracteres.'
    }
    if (isEdit && form.password) {
      const { level } = passwordStrength(form.password)
      if (level < 3) return 'La nueva contraseña es demasiado débil.'
    }
    return null
  }

  // ── Guardar ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const err = validate()
    if (err) return setError(err)

    setSaving(true)
    setError(null)
    try {
      const dto = {
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim().toLowerCase(),
        cellphone:  form.cellphone.trim() || undefined,
        rol:        form.rol,
      }

      let result
      if (isCreate) {
        result = await userService.create({ ...dto, password: form.password })
      } else {
        const updateDto = { id: form.id, ...dto, is_active: form.is_active }
        if (form.password) updateDto.password = form.password
        result = await userService.update(updateDto)
      }
      onSaved(result)
    } catch (e) {
      setError(e?.message ?? 'Error al guardar el usuario.')
    } finally {
      setSaving(false)
    }
  }

  // ── Eliminar ─────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await userService.remove(user.id)
      onDeleted(user.id)
    } catch (e) {
      setError(e?.message ?? 'Error al eliminar el usuario.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // ── Render ───────────────────────────────────────────────────────────────

  const avatarBg = isSelf ? 'bg-primary/20' : 'bg-primary/10'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-gray">
          <div className="flex items-center gap-3">
            {/* Avatar con iniciales */}
            <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}>
              <span className="font-sans text-sm font-semibold text-primary-dark">
                {isCreate ? '?' : initials(user)}
              </span>
            </div>
            <div>
              <h2 className="font-serif text-lg text-text-dark">
                {isCreate ? 'Nuevo usuario' : isEdit ? 'Editar usuario' : 'Detalle del usuario'}
              </h2>
              {!isCreate && (
                <p className="font-sans text-xs text-text-light mt-0.5">#{user.id}</p>
              )}
            </div>
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

        {/* ── Alerta si es el usuario en sesión ── */}
        {isSelf && (
          <div className="mx-6 mt-4 flex items-start gap-2.5 bg-primary/10 border border-primary/25 rounded-xl px-4 py-3">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-dark flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
            </svg>
            <p className="font-sans text-xs text-primary-dark leading-relaxed">
              Estás editando <strong>tu propia cuenta</strong>. Los cambios de rol o estado afectan tu sesión actual.
            </p>
          </div>
        )}

        {/* ── Body ── */}
        <div className="px-6 py-5 flex flex-col gap-5 flex-1">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
                <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
              </svg>
              <p className="font-sans text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" required={!isView}>
              {isView ? (
                <p className="font-sans text-sm text-text-dark py-1">{user.first_name}</p>
              ) : (
                <input
                  className={inputCls}
                  value={form.first_name}
                  onChange={e => handleChange('first_name', e.target.value)}
                  placeholder="Ej. María"
                  maxLength={100}
                  autoComplete="given-name"
                />
              )}
            </Field>
            <Field label="Apellido" required={!isView}>
              {isView ? (
                <p className="font-sans text-sm text-text-dark py-1">{user.last_name}</p>
              ) : (
                <input
                  className={inputCls}
                  value={form.last_name}
                  onChange={e => handleChange('last_name', e.target.value)}
                  placeholder="Ej. González"
                  maxLength={100}
                  autoComplete="family-name"
                />
              )}
            </Field>
          </div>

          {/* Correo */}
          <Field label="Correo electrónico" required={!isView}>
            {isView ? (
              <p className="font-sans text-sm text-text-dark py-1">{user.email}</p>
            ) : (
              <input
                className={inputCls}
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                maxLength={255}
                autoComplete="email"
              />
            )}
          </Field>

          {/* Teléfono */}
          <Field label="Teléfono">
            {isView ? (
              <p className="font-sans text-sm text-text-dark py-1">{user.cellphone || '—'}</p>
            ) : (
              <input
                className={inputCls}
                type="tel"
                value={form.cellphone}
                onChange={e => handleChange('cellphone', e.target.value)}
                placeholder="Ej. 3001234567"
                maxLength={20}
                autoComplete="tel"
              />
            )}
          </Field>

          {/* Rol y Estado */}
          <div className={`grid gap-3 ${isCreate ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Field label="Rol" required={!isView}>
              {isView ? (
                <div className="py-1"><RoleBadge rol={user.rol} /></div>
              ) : (
                <select
                  className={selectCls}
                  value={form.rol}
                  onChange={e => handleChange('rol', e.target.value)}
                >
                  <option value="receptionist">Recepcionista</option>
                  <option value="admin">Administrador</option>
                </select>
              )}
            </Field>

            {!isCreate && (
              <Field label="Estado">
                {isView ? (
                  <div className="py-1">
                    <span className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      user.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-100 text-text-light border border-neutral-gray'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${user.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                ) : (
                  <select
                    className={selectCls}
                    value={form.is_active ? 'true' : 'false'}
                    onChange={e => handleChange('is_active', e.target.value === 'true')}
                    disabled={isSelf}
                    title={isSelf ? 'No puedes desactivar tu propia cuenta' : undefined}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                )}
              </Field>
            )}
          </div>

          {/* Contraseña (crear o editar) */}
          {!isView && (
            <Field
              label={isCreate ? 'Contraseña' : 'Nueva contraseña'}
              required={isCreate}
            >
              <div className="relative">
                <input
                  className={`${inputCls} pr-10`}
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder={isCreate ? 'Mínimo 8 caracteres' : 'Dejar vacío para no cambiar'}
                  autoComplete={isCreate ? 'new-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              <PasswordStrengthBar password={form.password} />
              {!isCreate && (
                <p className="font-sans text-[11px] text-text-light/60 mt-0.5">
                  Deja este campo vacío si no deseas cambiar la contraseña.
                </p>
              )}
            </Field>
          )}

          {/* Advertencia seguridad al cambiar rol a admin */}
          {!isView && form.rol === 'admin' && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="font-sans text-xs text-amber-700 leading-relaxed">
                El rol <strong>Administrador</strong> tiene acceso completo al sistema. Asígnalo solo a personal de confianza.
              </p>
            </div>
          )}

          {/* Último acceso en modo vista */}
          {isView && (
            <div className="border-t border-neutral-gray/50 pt-4 mt-1 text-xs">
              <p className="font-sans text-text-light">Último acceso</p>
              <p className="font-sans text-text-dark mt-0.5">{fmtDateTime(user.last_login)}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-neutral-gray flex items-center justify-between gap-3">
          {/* Eliminar (solo edición y no es el mismo usuario) */}
          {isEdit && !isSelf && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="font-sans text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          )}

          {isEdit && isSelf && !confirmDelete && (
            <div className="flex items-center gap-1.5 text-text-light/50">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
              </svg>
              <span className="font-sans text-xs">No puedes eliminar tu propia cuenta</span>
            </div>
          )}

          {isEdit && confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-red-500">¿Confirmar eliminación?</span>
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
                {saving ? 'Guardando…' : isCreate ? 'Crear usuario' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserModal

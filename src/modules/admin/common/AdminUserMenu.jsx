import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import authService from '../../../services/login_service'
import userService from '../../../services/user_service'

/**
 * Menú de cabecera: nombre, estado en citas (activo/inactivo) y cerrar sesión.
 */
const AdminUserMenu = ({ user, onUserChange, onLogout }) => {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [activeError, setActiveError] = useState(null)
  const menuRef = useRef(null)

  const isStaffActive = user?.is_active !== false

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const applyAccountActive = async (next) => {
    if (!user || togglingActive || next === isStaffActive) return false
    if (
      !next &&
      !window.confirm(
        'Al marcarte como inactiva se reducirá tu disponibilidad en el registro de citas de la página principal. ¿Deseas continuar?'
      )
    ) {
      return false
    }
    setTogglingActive(true)
    setActiveError(null)
    try {
      const updated = await userService.update({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        cellphone: user.cellphone || undefined,
        rol: user.rol,
        is_active: next,
      })
      authService.setUser(updated)
      onUserChange(updated)
      return true
    } catch (e) {
      setActiveError(e?.message ?? 'No se pudo actualizar tu estado.')
      return false
    } finally {
      setTogglingActive(false)
    }
  }

  const handlePickActive = async (next) => {
    if (!user || togglingActive) return
    if (next === isStaffActive) {
      setMenuOpen(false)
      return
    }
    const ok = await applyAccountActive(next)
    if (ok) setMenuOpen(false)
  }

  const handleLogoutClick = async () => {
    setMenuOpen(false)
    await onLogout()
  }

  if (!user) return null

  return (
    <div className="relative flex flex-col items-end min-w-0">
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          disabled={togglingActive}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-controls="admin-user-menu"
          aria-label={`Menú de cuenta: ${user.first_name} ${user.last_name}`}
          onClick={() => setMenuOpen((o) => !o)}
          className="flex max-w-[min(100vw-6rem,15rem)] items-center gap-3 rounded-xl border border-neutral-gray bg-white py-1.5 pl-2 pr-2.5  transition-colors hover:bg-neutral-light disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:pl-2.5 sm:pr-3"
        >
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
            <span className="font-serif text-xs font-semibold text-primary-dark">
              {user.first_name?.[0]?.toUpperCase() ?? '?'}
            </span>
            <span
              className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-white ${isStaffActive ? 'bg-primary-dark' : 'bg-neutral-gray'}`}
              aria-hidden
              title={isStaffActive ? 'Activa para citas' : 'Inactiva para citas'}
            />
          </div>
          <span className="min-w-0 flex-1 truncate text-left font-serif text-sm font-semibold text-text-dark">
            {user.first_name} {user.last_name}
          </span>
          <svg
            className={`h-4 w-4 flex-shrink-0 text-text-light transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div
            id="admin-user-menu"
            role="menu"
            aria-label="Menú de cuenta"
            title="Disponibilidad en el registro de citas. Independiente del rol: Usuarios solo para administradores."
            className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2.5rem),17.5rem)] overflow-hidden rounded-xl border border-neutral-gray bg-white shadow-[var(--shadow-soft)]"
          >
            <div className="border-b border-neutral-gray bg-neutral-light/40 px-4 py-3.5">
              <p className="font-serif text-sm font-semibold leading-snug text-text-dark">
                {user.first_name} {user.last_name}
              </p>
              <p className="mt-1 truncate font-serif text-xs text-text-light">{user.email}</p>
            </div>

            <div className="px-2.5 pt-4 pb-3">
              <p className="mb-3 px-2 font-serif text-[10px] font-semibold uppercase tracking-[0.14em] text-text-light">
                Estado en citas
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  role="menuitem"
                  disabled={togglingActive}
                  onClick={() => void handlePickActive(true)}
                  className={`
                    flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left font-serif text-sm font-medium transition-colors
                    focus:outline-none focus-visible:bg-primary/10
                    ${isStaffActive
                      ? 'bg-primary/12 text-primary-dark'
                      : 'text-text-dark hover:bg-neutral-light'}
                  `}
                >
                  {isStaffActive ? (
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-primary-dark" aria-hidden>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="h-4 w-4 flex-shrink-0" aria-hidden />
                  )}
                  Activo
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={togglingActive}
                  onClick={() => void handlePickActive(false)}
                  className={`
                    flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left font-serif text-sm font-medium transition-colors
                    focus:outline-none focus-visible:bg-primary/10
                    ${!isStaffActive
                      ? 'bg-neutral-light text-text-dark'
                      : 'text-text-dark hover:bg-neutral-light'}
                  `}
                >
                  {!isStaffActive ? (
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-primary-dark" aria-hidden>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="h-4 w-4 flex-shrink-0" aria-hidden />
                  )}
                  Inactivo
                </button>
              </div>
            </div>

            {activeError && (
              <div className="mx-2.5 mb-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 font-serif text-[11px] leading-snug text-red-700">
                {activeError}
              </div>
            )}

            <div className="border-t border-neutral-gray p-2.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleLogoutClick()}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 font-serif text-sm font-medium text-neutral-dark transition-colors hover:bg-neutral-light hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset"
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUserMenu

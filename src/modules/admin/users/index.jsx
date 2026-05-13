import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import userService   from '../../../services/user_service'
import authService   from '../../../services/auth_service'
import RefreshIcon   from '../../../assets/icons/refreshIcon'
import UsersIcon     from '../../../assets/icons/usersIcon'
import RoleBadge     from './RoleBadge'
import UserModal     from './UserModal'
import Skeleton      from './Skeleton'
import EmptyState    from './EmptyState'

const REFRESH_INTERVAL_MS = 60_000

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (u) =>
  `${u?.first_name?.[0] ?? ''}${u?.last_name?.[0] ?? ''}`.toUpperCase() || '?'

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

// ─── Usuarios ─────────────────────────────────────────────────────────────────

const Usuarios = () => {
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [search,      setSearch]      = useState('')
  const [filterRol,   setFilterRol]   = useState('')       // '' | 'admin' | 'receptionist'
  const [filterActive,setFilterActive]= useState('')       // '' | 'true' | 'false'
  const [modal,       setModal]       = useState(null)     // { mode: 'view'|'edit'|'create', user? }

  const intervalRef  = useRef(null)
  const currentUser  = authService.getUser()

  // ── Carga de datos ───────────────────────────────────────────────────────

  const fetchUsers = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    else         setRefreshing(true)

    const data = await userService.getAll()
    setUsers(data)
    setLastUpdated(new Date())

    if (initial) setLoading(false)
    else         setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchUsers(true)
    intervalRef.current = setInterval(() => fetchUsers(false), REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchUsers])

  // ── Filtrado local ───────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = users

    if (filterRol !== '') {
      result = result.filter(u => u.rol === filterRol)
    }
    if (filterActive !== '') {
      const active = filterActive === 'true'
      result = result.filter(u => u.is_active === active)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q)  ||
        u.email?.toLowerCase().includes(q)      ||
        u.cellphone?.toLowerCase().includes(q)
      )
    }

    return result
  }, [users, search, filterRol, filterActive])

  const stats = useMemo(() => ({
    total:        users.length,
    admins:       users.filter(u => u.rol === 'admin').length,
    receptionists:users.filter(u => u.rol === 'receptionist').length,
    employees:    users.filter(u => u.rol === 'employee').length,
    active:       users.filter(u => u.is_active).length,
  }), [users])

  // ── Handlers de modal ────────────────────────────────────────────────────

  const handleSaved = (saved) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === saved.id)
      if (idx === -1) return [saved, ...prev]
      const copy = [...prev]
      copy[idx] = saved
      return copy
    })
    setModal(null)
  }

  const handleDeleted = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setModal(null)
  }

  const clearFilters = () => {
    setSearch('')
    setFilterRol('')
    setFilterActive('')
  }

  const hasFilters = search || filterRol !== '' || filterActive !== ''

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">

      {/* ── Cabecera ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-text-dark">Usuarios</h1>
          <p className="font-sans text-xs text-text-light mt-0.5">
            Gestión de cuentas y roles del sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="font-sans text-[11px] text-text-light/60 hidden sm:inline">
              Actualizado {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchUsers(false)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 font-sans text-xs font-medium text-text-light hover:text-primary-dark px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-2 font-sans text-sm font-medium text-white bg-primary-dark hover:bg-primary-dark/90 px-4 py-2 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo usuario
          </button>
        </div>
      </div>

      {/* ── Stats rápidas ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            key: null,
            label: 'Total',
            value: stats.total,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary-dark',
            Icon: UsersIcon,
            filter: null,
          },
          {
            key: 'admin',
            label: 'Admins',
            value: stats.admins,
            iconBg: 'bg-primary/15',
            iconColor: 'text-primary-dark',
            Icon: ({ className }) => (
              <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
            filter: () => { setFilterRol(f => f === 'admin' ? '' : 'admin'); setFilterActive('') },
            active: filterRol === 'admin',
          },
          {
            key: 'employee',
            label: 'Empleados',
            value: stats.employees,
            iconBg: 'bg-neutral-100',
            iconColor: 'text-neutral-dark',
            Icon: ({ className }) => (
              <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
            filter: () => { setFilterRol(f => f === 'employee' ? '' : 'employee'); setFilterActive('') },
            active: filterRol === 'employee',
          },
          {
            key: 'receptionist',
            label: 'Recepcionistas',
            value: stats.receptionists,
            iconBg: 'bg-neutral-100',
            iconColor: 'text-neutral-dark',
            Icon: ({ className }) => (
              <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
            filter: () => { setFilterRol(f => f === 'receptionist' ? '' : 'receptionist'); setFilterActive('') },
            active: filterRol === 'receptionist',
          },
          {
            key: 'active',
            label: 'Activos',
            value: stats.active,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            Icon: ({ className }) => (
              <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            filter: () => { setFilterActive(f => f === 'true' ? '' : 'true'); setFilterRol('') },
            active: filterActive === 'true',
          },
        ].map(({ key, label, value, iconBg, iconColor, Icon, filter, active }) => (
          <button
            key={`stat-${key}`}
            onClick={filter ?? undefined}
            disabled={!filter}
            className={`bg-white border rounded-2xl p-4 flex items-center gap-3 transition-all text-left ${
              filter ? 'hover:shadow-soft cursor-pointer' : 'cursor-default'
            } ${active ? 'border-primary ring-2 ring-primary/20' : 'border-neutral-gray'}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div>
              <p className="font-sans text-xs text-text-light">{label}</p>
              <p className="font-serif text-xl font-semibold text-text-dark leading-none mt-0.5">
                {loading ? '—' : value}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white border border-neutral-gray rounded-2xl overflow-hidden">

        {/* Barra de filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-neutral-gray/60">
          {/* Buscador */}
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/60 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="w-full font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-light/50"
              placeholder="Buscar por nombre, correo o teléfono…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro rol */}
          <select
            className="font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer w-full sm:w-44"
            value={filterRol}
            onChange={e => setFilterRol(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="receptionist">Recepcionista</option>
            <option value="employee">Empleado</option>
          </select>

          {/* Filtro estado */}
          <select
            className="font-sans text-sm text-text-dark bg-neutral-light border border-neutral-gray rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer w-full sm:w-36"
            value={filterActive}
            onChange={e => setFilterActive(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="font-sans text-xs text-text-light hover:text-text-dark px-3 py-2 rounded-xl hover:bg-neutral-light transition-colors whitespace-nowrap"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Conteo */}
        {!loading && (
          <div className="px-5 py-2.5 border-b border-neutral-gray/40 bg-neutral-light/40">
            <p className="font-sans text-xs text-text-light">
              {filtered.length === users.length
                ? `${filtered.length} usuario${filtered.length !== 1 ? 's' : ''}`
                : `${filtered.length} de ${users.length} usuarios`}
            </p>
          </div>
        )}

        {/* Contenido */}
        {loading ? (
          <Skeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState text={hasFilters ? 'Sin resultados para los filtros aplicados' : 'No hay usuarios registrados'} />
        ) : (
          <table className="w-full">
            <thead className="hidden md:table-header-group bg-neutral-light/30 border-b border-neutral-gray/60">
              <tr>
                {['Usuario', 'Correo', 'Teléfono', 'Rol', 'Estado', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[11px] font-semibold tracking-[1.2px] uppercase text-text-light">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray/60">
              {filtered.map(u => {
                const isCurrent = currentUser && u.id === currentUser.id
                return (
                  <tr key={u.id} className={`hover:bg-neutral-light/40 transition-colors ${isCurrent ? 'bg-primary/5' : ''}`}>

                    {/* Usuario */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-primary/20' : 'bg-primary/10'}`}>
                          <span className="font-sans text-xs font-semibold text-primary-dark">
                            {initials(u)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-sans text-sm font-medium text-text-dark truncate">
                              {u.first_name} {u.last_name}
                            </p>
                            {isCurrent && (
                              <span className="font-sans text-[10px] text-primary-dark bg-primary/15 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="font-sans text-xs text-text-light truncate md:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Correo */}
                    <td className="px-5 py-4 hidden md:table-cell max-w-xs">
                      <p className="font-sans text-sm text-text-dark/70 truncate">{u.email}</p>
                    </td>

                    {/* Teléfono */}
                    <td className="px-5 py-4 hidden md:table-cell whitespace-nowrap">
                      <p className="font-sans text-sm text-text-dark/70">{u.cellphone || '—'}</p>
                    </td>

                    {/* Rol */}
                    <td className="px-5 py-4">
                      <RoleBadge rol={u.rol} />
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-medium px-2.5 py-1 rounded-full ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-text-light border border-neutral-gray'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${u.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <div className="relative group">
                          <button
                            onClick={() => setModal({ mode: 'view', user: u })}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-white bg-text-dark/80 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver detalle
                          </span>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => setModal({ mode: 'edit', user: u })}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-white bg-text-dark/80 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            Editar
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <UserModal
          user={modal.user}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

export default Usuarios

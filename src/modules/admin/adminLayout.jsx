import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import authService from '../../services/login_service'
import AdminUserMenu from './common/AdminUserMenu'
import logo from '../../assets/images/logo.jpeg'
import DashboardIcon from '../../assets/icons/dashboardIcon'
import CalendarIcon from '../../assets/icons/calendarIcon'
import NailIcon from '../../assets/icons/nailIcon'
import UsersIcon from '../../assets/icons/usersIcon'
import GaleryIcon from '../../assets/icons/galeryIcon'

const NAV_ITEMS = [
  { path: '/admin',          label: 'Dashboard', Icon: DashboardIcon, adminOnly: false },
  { path: '/admin/citas',    label: 'Citas',     Icon: CalendarIcon,  adminOnly: false },
  { path: '/admin/servicios',label: 'Servicios', Icon: NailIcon,      adminOnly: true  },
  { path: '/admin/usuarios', label: 'Usuarios',  Icon: UsersIcon,     adminOnly: true  },
  { path: '/admin/galeria',  label: 'Galería',   Icon: GaleryIcon,    adminOnly: true  },
]

const AdminLayout = () => {
  const navigate        = useNavigate()
  const location        = useLocation()
  const [user, setUser] = useState(() => authService.getUser())
  const isAdmin         = user?.rol === 'admin'
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  const handleLogout = async () => {
    await authService.logout(false)
    navigate('/admin/login', { replace: true })
  }

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path)

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 h-16 flex items-center justify-between px-5 bg-white"
        style={{ boxShadow: '0 1px 0 #E5E5E5' }}
      >
        {/* Hamburger + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSideOpen(prev => !prev)}
            className="lg:hidden w-9 h-9 rounded-lg flex flex-col justify-center items-center gap-1.5 hover:bg-neutral-light transition-colors"
            aria-label="Abrir menú"
          >
            <span className={`w-5 h-0.5 bg-text-dark rounded-full transition-all duration-300 ${sideOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-text-dark rounded-full transition-all duration-300 ${sideOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-text-dark rounded-full transition-all duration-300 ${sideOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30">
              <img src={logo} alt="Ona Nails" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-base font-semibold text-text-dark tracking-tight">
              Ona Nails
            </span>
            <span className="hidden sm:block h-4 w-px bg-neutral-gray" />
            <span className="hidden sm:block font-sans text-[10px] text-text-light tracking-[2px] uppercase">
              {user?.rol}
            </span>
          </div>
        </div>

        <AdminUserMenu user={user} onUserChange={setUser} onLogout={handleLogout} />
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mobile overlay */}
        {sideOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSideOpen(false)}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed top-16 left-0 bottom-0 z-20 w-56 bg-white border-r border-neutral-gray
            flex flex-col
            transform transition-transform duration-300 ease-in-out
            lg:static lg:top-auto lg:bottom-auto lg:translate-x-0 lg:z-auto
            ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Brand label (solo desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-5 pt-6 pb-4">
            <span className="font-sans text-[10px] font-semibold tracking-[3px] uppercase text-text-light">
              Panel Admin
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-2 lg:py-0 flex flex-col gap-0.5 overflow-y-auto">
            {visibleItems.map(({ path, label, Icon }) => {
              const active = isActive(path)
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSideOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    font-sans text-sm font-medium
                    transition-all duration-200
                    ${active
                      ? 'bg-primary/12 text-primary-dark border-l-[3px] border-primary-dark pl-[13px]'
                      : 'text-text-light hover:bg-neutral-light hover:text-text-dark border-l-[3px] border-transparent pl-[13px]'
                    }
                  `}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="px-5 py-5 border-t border-neutral-gray">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-sans text-xs font-semibold text-primary-dark">
                  {user?.first_name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-sans text-xs font-medium text-text-dark truncate">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="font-sans text-[10px] text-text-light truncate">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default AdminLayout

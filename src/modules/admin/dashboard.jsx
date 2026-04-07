import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/login_service'
import logo from '../../assets/images/logo.jpeg'

const Dashboard = () => {
  const navigate  = useNavigate()
  const user      = authService.getUser()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  const handleLogout = async () => {
    await authService.logout(false)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Topbar ── */}
      <header
        className="h-16 flex items-center justify-between px-8 bg-white"
        style={{ boxShadow: '0 1px 0 #E5E5E5' }}
      >
        {/* Logo + nombre */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/30">
            <img src={logo} alt="Ona Nails" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-lg font-semibold text-text-dark tracking-tight">
            Ona Nails
          </span>
          <span className="hidden sm:block h-4 w-px bg-neutral-gray mx-1" />
          <span className="hidden sm:block font-sans text-xs text-text-light tracking-[2px] uppercase">
            {user.rol}
          </span>
        </div>

        {/* Usuario + logout */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block font-sans text-sm text-text-light">
              {user.first_name} {user.last_name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-sans text-sm font-medium text-neutral-dark hover:text-primary-dark transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-neutral-light"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden opacity-30">
            <img src={logo} alt="" className="w-full h-full object-cover" />
          </div>
          <p className="font-serif text-2xl text-text-dark/30">Panel en construcción</p>
          <p className="font-sans text-sm text-text-light/60">Pronto habrá contenido aquí</p>
        </div>
      </main>

    </div>
  )
}

export default Dashboard

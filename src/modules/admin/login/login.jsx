import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../../services/login_service'
import logo from '../../../assets/images/logo.jpeg'
import MailIcon from '../../../assets/icons/mailIcon'
import LockIcon from '../../../assets/icons/lockIcon'
import EyeIcon from '../../../assets/icons/eyeIcon'
import EyeOffIcon from '../../../assets/icons/eyeOffIcon'
import LogInIcon from '../../../assets/icons/logInIcon'
import SpinnerIcon from '../../../assets/icons/spinnerIcon'
import AlertCircleIcon from '../../../assets/icons/alertCircleIcon'
import ShieldIcon from '../../../assets/icons/shieldIcon'

// ─── Componente principal ─────────────────────────────────────────────────────

const Login = () => {
  const navigate = useNavigate()

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/admin', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — Branding ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[600px] shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #D4B896 0%, #B8956A 100%)' }}
      >
        {/* Círculos decorativos */}
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="absolute top-14 right-14 w-28 h-28 rounded-full bg-white/[0.06] pointer-events-none" />

        {/* Contenido centrado */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full gap-8 px-12">

          {/* Logo */}
          <div className="w-36 h-36 rounded-full overflow-hidden shadow-xl ring-4 ring-white/20">
            <img src={logo} alt="Ona Nails" className="w-full h-full object-cover" />
          </div>

          {/* Nombre y subtítulo */}
          <div className="text-center">
            <h1 className="font-serif text-[42px] font-bold text-white leading-tight tracking-tight">
              Ona Nails
            </h1>
            <p className="font-sans text-white/80 text-sm tracking-[3px] mt-1 uppercase">
              Panel Administrativo
            </p>
          </div>

          {/* Divisor decorativo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <div className="w-12 h-px bg-white/40" />
          </div>

          {/* Frase */}
          <p className="font-serif italic text-white/70 text-[15px] text-center max-w-[280px] leading-relaxed">
            Elegancia en cada detalle
          </p>
        </div>
      </div>

      {/* ── Panel derecho — Formulario ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-12 relative">

        {/* Card del formulario */}
        <div
          className="w-full max-w-[420px] bg-white rounded-2xl px-12 py-10"
          style={{ boxShadow: '0 4px 24px rgba(212, 184, 150, 0.2)' }}
        >
          {/* Cabecera */}
          <div className="mb-8">
            <h2 className="font-serif text-[28px] font-semibold text-text-dark leading-tight">
              Bienvenida de vuelta
            </h2>
            <p className="font-sans text-text-light text-sm mt-2">
              Ingresa tus credenciales para continuar
            </p>
            <div className="w-10 h-0.5 bg-primary rounded-full mt-4" />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <AlertCircleIcon className="w-4 h-4 shrink-0" />
              <span className="font-sans text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Campo email */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[13px] font-medium text-neutral-dark">
                Correo electrónico
              </label>
              <div className="flex items-center gap-3 h-12 px-4 bg-neutral-light rounded-[10px] border-[1.5px] border-neutral-gray focus-within:border-primary transition-colors duration-200">
                <MailIcon className="w-[18px] h-[18px] shrink-0 text-primary-dark" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  autoComplete="email"
                  className="flex-1 bg-transparent font-sans text-sm text-text-dark placeholder:text-neutral-dark/40 outline-none"
                />
              </div>
            </div>

            {/* Campo contraseña */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[13px] font-medium text-neutral-dark">
                Contraseña
              </label>
              <div className="flex items-center gap-3 h-12 px-4 bg-neutral-light rounded-[10px] border-[1.5px] border-neutral-gray focus-within:border-primary transition-colors duration-200">
                <LockIcon className="w-[18px] h-[18px] shrink-0 text-primary-dark" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="flex-1 bg-transparent font-sans text-sm text-text-dark placeholder:text-neutral-dark/40 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-neutral-dark/40 hover:text-primary-dark transition-colors duration-200"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword
                    ? <EyeOffIcon className="w-[18px] h-[18px]" />
                    : <EyeIcon className="w-[18px] h-[18px]" />
                  }
                </button>
              </div>
            </div>

            {/* Olvidé mi contraseña */}
            {/* <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="font-sans text-[13px] font-medium text-primary-dark hover:text-primary transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div> */}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="relative flex items-center justify-center gap-2.5 h-[52px] w-full rounded-xl font-sans text-[15px] font-semibold text-white tracking-[0.5px] transition-opacity duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:opacity-80"
              style={{
                background: 'linear-gradient(135deg, #D4B896 0%, #B8956A 100%)',
                boxShadow: '0 6px 16px rgba(184, 149, 106, 0.35)',
              }}
            >
              {loading ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogInIcon className="w-[18px] h-[18px]" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Separador + seguridad */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-gray" />
              <span className="font-sans text-[11px] text-neutral-dark/50 tracking-[1px]">
                acceso seguro
              </span>
              <div className="flex-1 h-px bg-neutral-gray" />
            </div>
            <div className="flex items-center justify-center gap-2 text-neutral-dark/40">
              <ShieldIcon className="w-3.5 h-3.5" />
              <span className="font-sans text-xs">Conexión cifrada y segura</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="absolute bottom-5 font-sans text-[11px] text-neutral-dark/30">
          © {new Date().getFullYear()} Ona Nails · Todos los derechos reservados
        </p>
      </div>

    </div>
  )
}

export default Login

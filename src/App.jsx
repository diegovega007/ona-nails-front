import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './modules/main/mainLayout'
import Welcome from './modules/main/home/welcome'
import Service from './modules/main/services/service'
import Galery from './modules/main/galery/galery'
import Contact from './modules/main/contact/information'
import Login from './modules/admin/login/login'
import AdminLayout from './modules/admin/adminLayout'
import Dashboard from './modules/admin/dashboard'
import Citas from './modules/admin/appointments'
import Servicios from './modules/admin/services'
import Usuarios from './modules/admin/users'
import GaleriaAdmin from './modules/admin/gallery'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Login (sin layout admin) ── */}
        <Route path="/admin/login" element={<Login />} />

        {/* ── Panel administrativo (con AdminLayout) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="citas"     element={<Citas />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="usuarios"  element={<Usuarios />} />
          <Route path="galeria"   element={<GaleriaAdmin />} />
        </Route>

        {/* ── Rutas públicas (con MainLayout) ── */}
        <Route element={<MainLayout />}>
          <Route path="/"          element={<Welcome />} />
          <Route path="/servicios" element={<Service />} />
          <Route path="/galeria"   element={<Galery />} />
          <Route path="/contacto"  element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

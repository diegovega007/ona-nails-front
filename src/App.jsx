import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Toolbar from './modules/common/toolbar'
import Footer from './modules/common/footer'
import Welcome from './modules/home/welcome'
import Service from './modules/services/service'
import Galery from './modules/galery/galery'
import Prices from './modules/prices/catalog'
import Contact from './modules/contact/information'
import Login from './modules/login/login'
import Dashboard from './modules/admin/dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rutas administrativas (sin layout público) ── */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />

        {/* ── Rutas públicas (con Toolbar + Footer) ── */}
        <Route path="/*" element={
          <div className="min-h-screen bg-background flex flex-col">
            <Toolbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/servicios" element={<Service />} />
                <Route path="/galeria" element={<Galery />} />
                <Route path="/precios" element={<Prices />} />
                <Route path="/contacto" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Toolbar from './modules/common/toolbar'
import Footer from './modules/common/footer'
import Welcome from './modules/home/welcome'
import Service from './modules/services/service'
import Galery from './modules/galery/galery'
import Prices from './modules/prices/catalog'
import Contact from './modules/contact/information'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App

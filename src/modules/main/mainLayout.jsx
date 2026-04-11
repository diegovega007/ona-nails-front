import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Toolbar from './common/toolbar'
import Footer from './common/footer'
import BookingModal from './appointments/BookingModal'

const MainLayout = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toolbar onOpenBooking={() => setModalOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default MainLayout

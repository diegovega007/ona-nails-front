import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Toolbar from './common/toolbar'
import Footer from './common/footer'
import Ballons from './common/Ballons'
import BookingModal from './appointments/BookingModal'

const MainLayout = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const openBooking = () => setModalOpen(true)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toolbar onOpenBooking={openBooking} />
      <main className="flex-1">
        <Outlet context={{ onOpenBooking: openBooking }} />
      </main>
      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <Ballons />
    </div>
  )
}

export default MainLayout

import { Outlet } from 'react-router-dom'
import Toolbar from './common/toolbar'
import Footer from './common/footer'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toolbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout

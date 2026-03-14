import { Outlet } from 'react-router-dom'
import Header from '../Header'
import BottomNav from '../BottomNav'

export default function Layout() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="pt-[56px] md:pt-[64px] pb-24 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

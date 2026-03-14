import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 ml-56 min-h-screen overflow-x-hidden">
        <div className="p-6 max-w-[1200px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

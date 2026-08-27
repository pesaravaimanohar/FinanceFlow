import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="lg:pl-64 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

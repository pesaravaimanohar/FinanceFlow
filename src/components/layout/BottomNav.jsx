import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, CreditCard, PieChart, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Txns' },
  { to: '/emi', icon: CreditCard, label: 'EMI' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/analytics', icon: BarChart3, label: 'Charts' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-indigo-400 bg-indigo-900/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

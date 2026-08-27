import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, PieChart, BarChart3, Settings,
  Wallet, TrendingUp, Sparkles
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { formatCurrency } from '../../lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/emi', icon: CreditCard, label: 'EMI Center' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { profile, currency, signOut } = useAuth()
  const { stats } = useApp()

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-slate-900 border-r border-slate-800 fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm leading-none">FinanceFlow</h1>
            <p className="text-slate-500 text-xs mt-0.5">Personal Finance</p>
          </div>
        </div>
      </div>

      {/* Net Balance Card */}
      <div className="mx-3 mt-4 p-3 bg-gradient-to-br from-indigo-900/50 to-purple-900/30 border border-indigo-800/40 rounded-xl">
        <p className="text-slate-400 text-xs flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Net Savings
        </p>
        <p className={`text-lg font-bold mt-0.5 ${stats.netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(Math.abs(stats.netSavings), currency)}
        </p>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-emerald-400">↑ {formatCurrency(stats.totalIncome, currency)}</span>
          <span className="text-red-400">↓ {formatCurrency(stats.totalExpenses, currency)}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs font-medium truncate">
              {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-slate-500 text-xs truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full mt-2 text-slate-500 hover:text-red-400 text-xs py-1.5 rounded-lg hover:bg-red-900/20 transition-all duration-200"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

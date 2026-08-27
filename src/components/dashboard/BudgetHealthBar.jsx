import { Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'

export default function BudgetHealthBar({ totalBudget, totalSpent }) {
  const { currency } = useAuth()
  const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const isOver = totalSpent > totalBudget && totalBudget > 0

  const getStatus = () => {
    if (!totalBudget) return { color: 'bg-slate-600', text: 'text-slate-400', label: 'No budget set', Icon: Target }
    if (isOver) return { color: 'bg-red-500', text: 'text-red-400', label: 'Over budget!', Icon: AlertTriangle }
    if (pct >= 90) return { color: 'bg-red-500', text: 'text-red-400', label: 'Critical', Icon: AlertTriangle }
    if (pct >= 70) return { color: 'bg-amber-500', text: 'text-amber-400', label: 'Warning', Icon: AlertTriangle }
    return { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'On track', Icon: CheckCircle }
  }

  const status = getStatus()
  const Icon = status.Icon

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-slate-400" />
          <h3 className="text-slate-200 font-medium text-sm">Budget Health</h3>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${status.text}`}>
          <Icon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${status.color} rounded-full transition-all duration-700 ease-out relative`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        >
          <div className="absolute inset-0 bg-white/10 rounded-full" />
        </div>
        {/* 70% marker */}
        <div className="absolute top-0 bottom-0 w-px bg-amber-500/60" style={{ left: '70%' }} />
        {/* 90% marker */}
        <div className="absolute top-0 bottom-0 w-px bg-red-500/60" style={{ left: '90%' }} />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-slate-400">
          Spent: <span className="text-slate-200 font-medium">{formatCurrency(totalSpent, currency)}</span>
        </span>
        <span className="text-slate-400">
          {totalBudget > 0
            ? <>Budget: <span className="text-slate-200 font-medium">{formatCurrency(totalBudget, currency)}</span></>
            : <span className="text-slate-500">Set a budget in Budget tab</span>
          }
        </span>
        {totalBudget > 0 && (
          <span className={`font-semibold ${status.text}`}>{pct.toFixed(0)}%</span>
        )}
      </div>
    </div>
  )
}

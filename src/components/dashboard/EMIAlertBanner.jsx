import { Bell, AlertCircle, Clock } from 'lucide-react'
import { getDaysUntilDue, formatCurrency } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'

export default function EMIAlertBanner({ emis }) {
  const { currency } = useAuth()
  const upcoming = emis
    .filter(e => e.is_active && e.due_day)
    .map(e => ({ ...e, daysUntil: getDaysUntilDue(e.due_day) }))
    .filter(e => e.daysUntil !== null && e.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  if (!upcoming.length) return null

  return (
    <div className="rounded-xl border border-amber-800/50 bg-amber-900/20 p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-amber-400" />
        <h3 className="text-amber-300 font-medium text-sm">
          {upcoming.length} EMI{upcoming.length > 1 ? 's' : ''} due soon
        </h3>
      </div>
      <div className="space-y-2">
        {upcoming.map(emi => (
          <div key={emi.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-sm text-slate-300">{emi.title}</span>
              {emi.lender_or_source && (
                <span className="text-xs text-slate-500">({emi.lender_or_source})</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-semibold text-sm">
                {formatCurrency(emi.monthly_amount, currency)}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                emi.daysUntil === 0
                  ? 'bg-red-900/60 text-red-300'
                  : emi.daysUntil <= 2
                  ? 'bg-red-900/40 text-red-400'
                  : 'bg-amber-900/40 text-amber-400'
              }`}>
                {emi.daysUntil === 0 ? 'Due Today' : `${emi.daysUntil}d`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

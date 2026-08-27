import { TrendingUp, TrendingDown, Wallet, CreditCard, Target, DollarSign } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardCards({ stats, profile }) {
  const { currency } = useAuth()
  const utilizationPct = profile?.monthly_income_target > 0
    ? (stats.totalExpenses / profile.monthly_income_target) * 100
    : null

  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(stats.totalIncome, currency),
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      valueColor: 'text-emerald-400',
      wrapperClass: 'gradient-income',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses, currency),
      icon: TrendingDown,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      valueColor: 'text-red-400',
      wrapperClass: 'gradient-expense',
    },
    {
      label: 'EMI Commitment',
      value: formatCurrency(stats.activeEmiTotal, currency),
      icon: CreditCard,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      valueColor: 'text-amber-400',
      wrapperClass: 'gradient-amber',
      sub: '/month',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(Math.abs(stats.netSavings), currency),
      icon: Wallet,
      iconBg: stats.netSavings >= 0 ? 'bg-indigo-500/20' : 'bg-red-500/20',
      iconColor: stats.netSavings >= 0 ? 'text-indigo-400' : 'text-red-400',
      valueColor: stats.netSavings >= 0 ? 'text-indigo-400' : 'text-red-400',
      wrapperClass: 'gradient-indigo',
      prefix: stats.netSavings >= 0 ? '' : '-',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div key={i} className={`card border ${card.wrapperClass} animate-fade-in`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                <p className={`text-lg lg:text-xl font-bold font-mono tracking-tight mt-1 ${card.valueColor}`}>
                  {card.prefix}{card.value}
                  {card.sub && <span className="text-xs font-normal font-sans text-slate-500 ml-1">{card.sub}</span>}
                </p>
              </div>
              <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

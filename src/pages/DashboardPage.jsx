import { useState, useMemo } from 'react'
import { Plus, Download, RefreshCw, Sparkles, PieChart, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import DashboardCards from '../components/dashboard/DashboardCards'
import BudgetHealthBar from '../components/dashboard/BudgetHealthBar'
import EMIAlertBanner from '../components/dashboard/EMIAlertBanner'
import ExpenseForm from '../components/transactions/ExpenseForm'
import TransactionList from '../components/transactions/TransactionList'
import { format } from 'date-fns'
import { formatCurrency, exportToExcel } from '../lib/utils'

export default function DashboardPage() {
  const { transactions, emis, budgets, stats, selectedMonth, loadingTransactions, fetchTransactions } = useApp()
  const { profile, currency } = useAuth()
  const [showForm, setShowForm] = useState(false)

  const currentMonth = format(new Date(), 'yyyy-MM')
  const currentMonthBudgets = budgets.filter(b => b.month_year === currentMonth)
  const totalBudget = currentMonthBudgets.reduce((s, b) => s + parseFloat(b.budget_limit), 0)
  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const budgetPct = totalBudget > 0 ? Math.min(100, (stats.totalExpenses / totalBudget) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">{greeting()},</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Equilibrium Finance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 mt-0.5 tracking-tight">
            {profile?.full_name?.split(' ')[0] || 'Member'} 👋
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => exportToExcel({ transactions, emis, budgets, selectedMonth, currency })}
            className="btn-secondary text-xs py-2 px-3.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Excel (.xlsx)
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-xs py-2 px-4 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Target Calculation Bento Hero Card */}
      <div className="card bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-500/30 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Target Monthly Planning
            </span>
            <h2 className="text-slate-100 font-bold text-lg mt-0.5">Total Budget Allocated</h2>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl lg:text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
                {formatCurrency(totalBudget, currency)}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Baseline EMIs ({formatCurrency(stats.activeEmiTotal, currency)}) + Additional Discretionary Budget
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="card-sm bg-slate-950/60 border-slate-800/80 min-w-[130px]">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Spent So Far</p>
              <p className={`text-base font-bold font-mono mt-1 ${stats.totalExpenses > totalBudget && totalBudget > 0 ? 'text-red-400' : 'text-slate-100'}`}>
                {formatCurrency(stats.totalExpenses, currency)}
              </p>
              <p className="text-slate-500 text-[10px] mt-0.5">{budgetPct.toFixed(0)}% of monthly budget</p>
            </div>

            <div className="card-sm bg-slate-950/60 border-slate-800/80 min-w-[130px]">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Remaining Buffer</p>
              <p className={`text-base font-bold font-mono mt-1 ${totalBudget - stats.totalExpenses < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatCurrency(Math.abs(totalBudget - stats.totalExpenses), currency)}
              </p>
              <p className="text-slate-500 text-[10px] mt-0.5">Available balance</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 relative z-10">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Budget Utilization</span>
            <span className="text-indigo-300 font-bold font-mono">{budgetPct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                budgetPct >= 90 ? 'bg-rose-500' : budgetPct >= 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${Math.min(100, budgetPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardCards stats={stats} profile={profile} />

      {/* Budget Health */}
      <BudgetHealthBar totalBudget={totalBudget} totalSpent={stats.totalExpenses} />

      {/* EMI Alerts */}
      <EMIAlertBanner emis={emis} />

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-slate-100 font-bold text-sm">Recent Transactions & Daily Expenses</h2>
            <p className="text-slate-500 text-xs">Logged expenditure marked with date, time & description</p>
          </div>
          <button
            onClick={() => fetchTransactions()}
            disabled={loadingTransactions}
            className="btn-secondary text-xs py-1.5 px-2.5"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loadingTransactions ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {loadingTransactions ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <TransactionList transactions={recentTransactions} onEdit={() => {}} />
        )}
      </div>

      <ExpenseForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Plus, Download, RefreshCw } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import DashboardCards from '../components/dashboard/DashboardCards'
import BudgetHealthBar from '../components/dashboard/BudgetHealthBar'
import EMIAlertBanner from '../components/dashboard/EMIAlertBanner'
import ExpenseForm from '../components/transactions/ExpenseForm'
import TransactionList from '../components/transactions/TransactionList'
import { format } from 'date-fns'
import { exportToCSV } from '../lib/utils'

export default function DashboardPage() {
  const { transactions, emis, budgets, stats, loadingTransactions, fetchTransactions } = useApp()
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">{greeting()},</p>
          <h1 className="text-xl font-bold text-slate-100">
            {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(transactions, currency)}
            className="btn-secondary text-sm px-3 hidden sm:flex"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
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
          <h2 className="text-slate-200 font-semibold text-sm">Recent Transactions</h2>
          <button
            onClick={() => fetchTransactions()}
            disabled={loadingTransactions}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTransactions ? 'animate-spin' : ''}`} />
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

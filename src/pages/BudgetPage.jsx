import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import BudgetPlanner from '../components/budget/BudgetPlanner'
import { formatCurrency, getMonthLabel } from '../lib/utils'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const {
    transactions, budgets, selectedMonth, setSelectedMonth,
    loadingBudgets, cloneLastMonthBudget,
  } = useApp()
  const { currency } = useAuth()
  const [cloning, setCloning] = useState(false)

  const changeMonth = (dir) => {
    const current = parseISO(`${selectedMonth}-01`)
    const next = dir === 'prev' ? subMonths(current, 1) : addMonths(current, 1)
    setSelectedMonth(format(next, 'yyyy-MM'))
  }

  // Filter transactions for selected month
  const monthTransactions = useMemo(() =>
    transactions.filter(t => t.transaction_date?.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  )

  const totalBudget = budgets.reduce((s, b) => s + parseFloat(b.budget_limit), 0)
  const totalSpent = monthTransactions.filter(t => t.type === 'expense')
    .reduce((s, t) => s + parseFloat(t.amount), 0)

  const handleClone = async () => {
    setCloning(true)
    try {
      await cloneLastMonthBudget()
    } catch (err) {
      toast.error(err.message || 'Failed to clone')
    } finally {
      setCloning(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Budget Planner</h1>
        <button
          onClick={handleClone}
          disabled={cloning}
          className="btn-secondary text-sm"
        >
          {cloning
            ? <span className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
            : <Copy className="w-3.5 h-3.5" />
          }
          Copy Last Month
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between card">
        <button onClick={() => changeMonth('prev')} className="btn-secondary text-sm px-3 py-2">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-slate-100 font-semibold">{getMonthLabel(selectedMonth)}</p>
          <p className="text-slate-500 text-xs mt-0.5">{budgets.length} categories budgeted</p>
        </div>
        <button
          onClick={() => changeMonth('next')}
          disabled={selectedMonth >= format(new Date(), 'yyyy-MM')}
          className="btn-secondary text-sm px-3 py-2 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Budget vs Actual Summary */}
      {totalBudget > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card-sm text-center">
            <p className="text-slate-500 text-xs">Budget</p>
            <p className="text-indigo-400 font-bold text-sm mt-0.5">{formatCurrency(totalBudget, currency)}</p>
          </div>
          <div className="card-sm text-center">
            <p className="text-slate-500 text-xs">Spent</p>
            <p className={`font-bold text-sm mt-0.5 ${totalSpent > totalBudget ? 'text-red-400' : 'text-slate-200'}`}>
              {formatCurrency(totalSpent, currency)}
            </p>
          </div>
          <div className="card-sm text-center">
            <p className="text-slate-500 text-xs">Remaining</p>
            <p className={`font-bold text-sm mt-0.5 ${totalBudget - totalSpent < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatCurrency(Math.abs(totalBudget - totalSpent), currency)}
              {totalBudget - totalSpent < 0 && <span className="text-xs font-normal text-red-500 ml-1">over</span>}
            </p>
          </div>
        </div>
      )}

      {/* Budget Planner */}
      <div className="card">
        <h2 className="text-slate-200 font-semibold text-sm mb-4">Category Budgets</h2>
        {loadingBudgets ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <BudgetPlanner transactions={monthTransactions} />
        )}
      </div>
    </div>
  )
}

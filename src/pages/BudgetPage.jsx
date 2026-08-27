import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Copy, Download, Repeat, Sparkles } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import BudgetPlanner from '../components/budget/BudgetPlanner'
import { formatCurrency, getMonthLabel, exportToExcel } from '../lib/utils'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const {
    transactions, budgets, emis, selectedMonth, setSelectedMonth,
    loadingBudgets, cloneLastMonthBudget, autoIncludeRecurringInBudget,
  } = useApp()
  const { profile, updateProfile, currency } = useAuth()
  const [cloning, setCloning] = useState(false)
  const [autoProjecting, setAutoProjecting] = useState(false)
  const [editingIncome, setEditingIncome] = useState(false)
  const [incomeTarget, setIncomeTarget] = useState(profile?.monthly_income_target || '')

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
  const monthIncomeLogged = monthTransactions.filter(t => t.type === 'income')
    .reduce((s, t) => s + parseFloat(t.amount), 0)

  const activeEmiTotal = emis.filter(e => e.is_active).reduce((s, e) => s + parseFloat(e.monthly_amount || 0), 0)

  const handleClone = async () => {
    setCloning(true)
    try {
      await cloneLastMonthBudget()
    } catch (err) {
      toast.error(err.message || 'Failed to copy')
    } finally {
      setCloning(false)
    }
  }

  const handleAutoProject = async () => {
    setAutoProjecting(true)
    try {
      await autoIncludeRecurringInBudget()
    } catch (err) {
      toast.error(err.message || 'No active recurring payments found')
    } finally {
      setAutoProjecting(false)
    }
  }

  const handleSaveIncome = async () => {
    const num = parseFloat(incomeTarget) || 0
    try {
      await updateProfile({ monthly_income_target: num })
      setEditingIncome(false)
      toast.success('Monthly income target saved!')
    } catch {
      toast.error('Failed to update income')
    }
  }

  const handleExcelExport = () => {
    exportToExcel({
      transactions: monthTransactions,
      budgets,
      emis,
      profile,
      selectedMonth,
      currency,
    })
    toast.success('Excel (.xlsx) report downloaded!')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Budget & Financial Planner</h1>
          <p className="text-slate-500 text-sm mt-0.5">Automated monthly money planning</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoProject}
            disabled={autoProjecting}
            className="btn-secondary text-xs"
            title="Auto-calculate baseline budget from EMIs & Subscriptions"
          >
            {autoProjecting
              ? <span className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              : <Repeat className="w-3.5 h-3.5 text-purple-400" />
            }
            Auto-Budget Recurring
          </button>
          <button
            onClick={handleClone}
            disabled={cloning}
            className="btn-secondary text-xs"
          >
            {cloning
              ? <span className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
              : <Copy className="w-3.5 h-3.5" />
            }
            Copy Last Month
          </button>
          <button
            onClick={handleExcelExport}
            className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white"
          >
            <Download className="w-3.5 h-3.5" /> Download Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Start of Month Income / Budget Target Banner */}
      <div className="card bg-slate-900/80 border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-slate-400 text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Start of Month Target Income
          </p>
          {editingIncome ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={incomeTarget}
                onChange={e => setIncomeTarget(e.target.value)}
                placeholder="e.g. 75000"
                className="input text-xs py-1 px-2.5 w-32"
                autoFocus
              />
              <button onClick={handleSaveIncome} className="btn-primary text-xs py-1 px-2.5">Save</button>
              <button onClick={() => setEditingIncome(false)} className="btn-secondary text-xs py-1 px-2">Cancel</button>
            </div>
          ) : (
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-lg font-bold text-slate-100">
                {formatCurrency(profile?.monthly_income_target || 0, currency)}
              </p>
              <button onClick={() => { setIncomeTarget(profile?.monthly_income_target || ''); setEditingIncome(true) }} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium underline">
                Edit Target
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <p className="text-slate-500">Actual Income Logged</p>
            <p className="text-emerald-400 font-semibold">{formatCurrency(monthIncomeLogged, currency)}</p>
          </div>
          <div>
            <p className="text-slate-500">Recurring Commitments</p>
            <p className="text-amber-400 font-semibold">{formatCurrency(activeEmiTotal, currency)}</p>
          </div>
        </div>
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
            <p className="text-slate-500 text-xs">Total Budget Allocated</p>
            <p className="text-indigo-400 font-bold text-sm mt-0.5">{formatCurrency(totalBudget, currency)}</p>
          </div>
          <div className="card-sm text-center">
            <p className="text-slate-500 text-xs">Actual Spent</p>
            <p className={`font-bold text-sm mt-0.5 ${totalSpent > totalBudget ? 'text-red-400' : 'text-slate-200'}`}>
              {formatCurrency(totalSpent, currency)}
            </p>
          </div>
          <div className="card-sm text-center">
            <p className="text-slate-500 text-xs">Remaining Budget</p>
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

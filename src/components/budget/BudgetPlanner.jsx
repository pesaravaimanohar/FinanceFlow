import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { EXPENSE_CATEGORIES } from '../../lib/constants'
import { formatCurrency } from '../../lib/utils'
import ProgressBar from '../ui/ProgressBar'
import toast from 'react-hot-toast'

export default function BudgetPlanner({ transactions }) {
  const { budgets, upsertBudget, deleteBudget } = useApp()
  const { currency } = useAuth()
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [addingCategory, setAddingCategory] = useState('')
  const [addingAmount, setAddingAmount] = useState('')

  // Compute spending per category from transactions
  const spendingByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount)
      return acc
    }, {})

  // Categories that have budgets
  const budgetedCategories = budgets.map(b => b.category)
  // Available to add
  const availableCategories = EXPENSE_CATEGORIES.filter(c => !budgetedCategories.includes(c))

  const handleSaveInline = async (budget) => {
    const val = parseFloat(editValue)
    if (!val || val <= 0) return toast.error('Enter a valid amount')
    try {
      await upsertBudget(budget.category, val)
      setEditingId(null)
      toast.success('Budget updated')
    } catch { toast.error('Failed to update') }
  }

  const handleAddBudget = async () => {
    if (!addingCategory || !addingAmount || parseFloat(addingAmount) <= 0) {
      return toast.error('Select a category and enter amount')
    }
    try {
      await upsertBudget(addingCategory, parseFloat(addingAmount))
      setAddingCategory('')
      setAddingAmount('')
      toast.success('Budget added!')
    } catch { toast.error('Failed to add') }
  }

  return (
    <div className="space-y-3">
      {/* Add Budget Row */}
      <div className="flex gap-2">
        <select
          value={addingCategory}
          onChange={e => setAddingCategory(e.target.value)}
          className="input flex-1 text-sm"
        >
          <option value="">Select category...</option>
          {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="number"
          value={addingAmount}
          onChange={e => setAddingAmount(e.target.value)}
          placeholder={`${currency}0`}
          className="input w-28 text-sm"
          min="0"
        />
        <button onClick={handleAddBudget} className="btn-primary text-sm px-3">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Budget Rows */}
      {budgets.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          Set your first category budget above
        </div>
      ) : (
        <div className="space-y-2">
          {budgets
            .sort((a, b) => {
              const spA = spendingByCategory[a.category] || 0
              const spB = spendingByCategory[b.category] || 0
              return (spB / b.budget_limit) - (spA / a.budget_limit)
            })
            .map(budget => {
              const spent = spendingByCategory[budget.category] || 0
              const pct = (spent / budget.budget_limit) * 100
              const remaining = budget.budget_limit - spent
              const isOver = spent > budget.budget_limit

              return (
                <div key={budget.id} className="card-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm font-medium">{budget.category}</span>
                    <div className="flex items-center gap-2">
                      {editingId === budget.id ? (
                        <div className="flex gap-1.5">
                          <input
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="input text-xs w-24 py-1 px-2"
                            type="number"
                            autoFocus
                          />
                          <button onClick={() => handleSaveInline(budget)} className="text-emerald-400 hover:text-emerald-300 p-1">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(budget.id); setEditValue(String(budget.budget_limit)) }}
                          className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {formatCurrency(budget.budget_limit, currency)}
                        </button>
                      )}
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <ProgressBar value={spent} max={budget.budget_limit} showLabel={false} height="h-1.5" mode="budget" />

                  <div className="flex justify-between mt-1.5 text-xs">
                    <span className="text-slate-500">
                      Spent: <span className={`font-medium ${isOver ? 'text-red-400' : 'text-slate-300'}`}>
                        {formatCurrency(spent, currency)}
                      </span>
                    </span>
                    <span className={`font-medium ${isOver ? 'text-red-400' : remaining < budget.budget_limit * 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isOver ? `${formatCurrency(Math.abs(remaining), currency)} over` : `${formatCurrency(remaining, currency)} left`}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

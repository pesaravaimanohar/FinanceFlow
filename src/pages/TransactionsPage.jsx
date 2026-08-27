import { useState, useMemo } from 'react'
import { Plus, Download, Tag } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import TransactionFilters from '../components/transactions/TransactionFilters'
import TransactionList from '../components/transactions/TransactionList'
import ExpenseForm from '../components/transactions/ExpenseForm'
import QuickPresets from '../components/transactions/QuickPresets'
import { exportToCSV, formatCurrency } from '../lib/utils'

export default function TransactionsPage() {
  const {
    transactions, loadingTransactions,
    dateFilter, setDateFilter,
    customDateRange, setCustomDateRange,
  } = useApp()
  const { currency } = useAuth()

  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [presetData, setPresetData] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  // All unique tags across transactions
  const allTags = useMemo(() => {
    const tagSet = new Set()
    transactions.forEach(t => (t.tags || []).forEach(tag => tagSet.add(tag)))
    return [...tagSet].sort()
  }, [transactions])

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (selectedType !== 'all' && t.type !== selectedType) return false
      if (selectedCategory && t.category !== selectedCategory) return false
      if (selectedTags.length && !selectedTags.every(tag => (t.tags || []).includes(tag))) return false
      if (search) {
        const q = search.toLowerCase()
        const matches =
          (t.notes || '').toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          String(t.amount).includes(q) ||
          (t.tags || []).some(tag => tag.includes(q))
        if (!matches) return false
      }
      return true
    })
  }, [transactions, search, selectedType, selectedCategory, selectedTags])

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)

  const handleEdit = (t) => { setEditData(t); setShowForm(true) }
  const handleTagClick = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }
  const handlePreset = (p) => { setPresetData(p); setShowForm(true) }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Transactions</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(transactions, currency)} className="btn-secondary text-sm px-3 hidden sm:flex">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditData(null); setPresetData(null); setShowForm(true) }} className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-sm">
          <p className="text-slate-500 text-xs">Filtered Income</p>
          <p className="text-emerald-400 font-bold text-sm mt-0.5">{formatCurrency(totalIncome, currency)}</p>
        </div>
        <div className="card-sm">
          <p className="text-slate-500 text-xs">Filtered Expenses</p>
          <p className="text-red-400 font-bold text-sm mt-0.5">{formatCurrency(totalExpenses, currency)}</p>
        </div>
      </div>

      {/* Active Tag Filters Banner */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="tag-chip text-xs"
            >
              #{tag} ×
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <TransactionFilters
            search={search} setSearch={setSearch}
            dateFilter={dateFilter} setDateFilter={setDateFilter}
            customDateRange={customDateRange} setCustomDateRange={setCustomDateRange}
            selectedType={selectedType} setSelectedType={setSelectedType}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            selectedTags={selectedTags} setSelectedTags={setSelectedTags}
            allTags={allTags}
          />
          {loadingTransactions ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <TransactionList
              transactions={filtered}
              onEdit={handleEdit}
              onTagClick={handleTagClick}
              selectedTags={selectedTags}
            />
          )}
        </div>

        {/* Sidebar Presets */}
        <div className="lg:col-span-1">
          <QuickPresets onUsePreset={handlePreset} />
        </div>
      </div>

      <ExpenseForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null); setPresetData(null) }}
        editData={editData}
        presetData={presetData}
      />
    </div>
  )
}

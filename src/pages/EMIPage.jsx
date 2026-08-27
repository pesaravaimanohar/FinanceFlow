import { useState } from 'react'
import { Plus, CreditCard, TrendingDown, Repeat, ToggleLeft, ToggleRight } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import EMICard from '../components/emi/EMICard'
import EMIForm from '../components/emi/EMIForm'
import { formatCurrency } from '../lib/utils'

export default function EMIPage() {
  const { emis, loadingEmis } = useApp()
  const { currency } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [showInactive, setShowInactive] = useState(false)
  const [filterType, setFilterType] = useState('all') // 'all' | 'emi' | 'subscription'

  const activeEmis = emis.filter(e => e.is_active)
  const inactiveEmis = emis.filter(e => !e.is_active)
  
  const activeSubsCount = activeEmis.filter(e => e.recurring_type === 'subscription').length
  const activeEmisCount = activeEmis.filter(e => e.recurring_type !== 'subscription').length

  const filteredItems = (showInactive ? emis : activeEmis).filter(e => {
    if (filterType === 'emi') return e.recurring_type !== 'subscription'
    if (filterType === 'subscription') return e.recurring_type === 'subscription'
    return true
  })

  const totalMonthlyCommitment = activeEmis.reduce((s, e) => s + parseFloat(e.monthly_amount || 0), 0)
  const totalRemainingLoanAmount = activeEmis
    .filter(e => e.recurring_type !== 'subscription' && e.total_tenure_months)
    .reduce((s, e) => {
      const remainingMonths = Math.max(0, (e.total_tenure_months || 0) - (e.paid_tenure_months || 0))
      return s + (parseFloat(e.monthly_amount || 0) * remainingMonths)
    }, 0)

  const handleEdit = (emi) => { setEditData(emi); setShowForm(true) }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Recurring Payments & EMIs</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeEmisCount} active loan(s) • {activeSubsCount} active subscription(s)
          </p>
        </div>
        <button onClick={() => { setEditData(null); setShowForm(true) }} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card gradient-amber">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <p className="text-slate-400 text-xs">Total Monthly Commitment</p>
          </div>
          <p className="text-amber-400 font-bold text-xl">{formatCurrency(totalMonthlyCommitment, currency)}</p>
          <p className="text-slate-500 text-xs mt-1">EMIs & Subscriptions total</p>
        </div>
        <div className="card gradient-expense">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-slate-400 text-xs">Outstanding Loan Principal</p>
          </div>
          <p className="text-red-400 font-bold text-xl">{formatCurrency(totalRemainingLoanAmount, currency)}</p>
          <p className="text-slate-500 text-xs mt-1">across active EMI tenures</p>
        </div>
      </div>

      {/* Filter Tabs & Inactive Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-all ${filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All ({activeEmis.length})
          </button>
          <button
            onClick={() => setFilterType('emi')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-all ${filterType === 'emi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            EMIs ({activeEmisCount})
          </button>
          <button
            onClick={() => setFilterType('subscription')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-all ${filterType === 'subscription' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Subscriptions ({activeSubsCount})
          </button>
        </div>

        {inactiveEmis.length > 0 && (
          <button
            onClick={() => setShowInactive(s => !s)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            {showInactive ? <ToggleRight className="w-4 h-4 text-indigo-400" /> : <ToggleLeft className="w-4 h-4" />}
            {showInactive ? 'Showing inactive items' : `Show ${inactiveEmis.length} inactive`}
          </button>
        )}
      </div>

      {/* EMI & Subscription List */}
      {loadingEmis ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center card">
          <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-4">
            <Repeat className="w-7 h-7 text-slate-500" />
          </div>
          <p className="text-slate-300 font-medium">No recurring payments found</p>
          <p className="text-slate-500 text-sm mt-1">Add your loans or subscriptions (Netflix, Prime, etc.) to project monthly budgets</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm">
            <Plus className="w-4 h-4" /> Add Payment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(emi => (
            <EMICard key={emi.id} emi={emi} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <EMIForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null) }}
        editData={editData}
      />
    </div>
  )
}

import { useState } from 'react'
import { Plus, CreditCard, TrendingDown, ToggleLeft, ToggleRight } from 'lucide-react'
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

  const activeEmis = emis.filter(e => e.is_active)
  const inactiveEmis = emis.filter(e => !e.is_active)
  const displayedEmis = showInactive ? emis : activeEmis

  const totalMonthlyEmi = activeEmis.reduce((s, e) => s + parseFloat(e.monthly_amount), 0)
  const totalRemainingAmount = activeEmis.reduce((s, e) => {
    return s + (parseFloat(e.monthly_amount) * (e.total_tenure_months - e.paid_tenure_months))
  }, 0)

  const handleEdit = (emi) => { setEditData(emi); setShowForm(true) }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">EMI Center</h1>
          <p className="text-slate-500 text-sm mt-0.5">{activeEmis.length} active loans</p>
        </div>
        <button onClick={() => { setEditData(null); setShowForm(true) }} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add EMI
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card gradient-amber">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <p className="text-slate-400 text-xs">Monthly Commitment</p>
          </div>
          <p className="text-amber-400 font-bold text-xl">{formatCurrency(totalMonthlyEmi, currency)}</p>
          <p className="text-slate-500 text-xs mt-1">/month across {activeEmis.length} loans</p>
        </div>
        <div className="card gradient-expense">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-slate-400 text-xs">Total Outstanding</p>
          </div>
          <p className="text-red-400 font-bold text-xl">{formatCurrency(totalRemainingAmount, currency)}</p>
          <p className="text-slate-500 text-xs mt-1">across all active EMIs</p>
        </div>
      </div>

      {/* Toggle inactive */}
      {inactiveEmis.length > 0 && (
        <button
          onClick={() => setShowInactive(s => !s)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          {showInactive ? <ToggleRight className="w-4 h-4 text-indigo-400" /> : <ToggleLeft className="w-4 h-4" />}
          {showInactive ? 'Showing all EMIs' : `Show ${inactiveEmis.length} completed EMI(s)`}
        </button>
      )}

      {/* EMI List */}
      {loadingEmis ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : displayedEmis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <CreditCard className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No EMIs yet</p>
          <p className="text-slate-600 text-sm mt-1">Add your first loan or EMI to track it</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm">
            <Plus className="w-4 h-4" /> Add EMI
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedEmis.map(emi => (
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

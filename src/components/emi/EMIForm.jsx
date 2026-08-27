import { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { EXPENSE_CATEGORIES } from '../../lib/constants'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

const defaultForm = {
  recurring_type: 'emi',
  title: '',
  category: 'EMI & Loans',
  lender_or_source: '',
  monthly_amount: '',
  total_tenure_months: '',
  paid_tenure_months: '0',
  due_day: '',
  interest_rate: '',
  start_date: '',
  end_date: '',
  is_active: true,
}

export default function EMIForm({ isOpen, onClose, editData = null }) {
  const { addEmi, updateEmi } = useApp()
  const { currency } = useAuth()
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editData) {
      setForm({
        recurring_type: editData.recurring_type || 'emi',
        title: editData.title || '',
        category: editData.category || (editData.recurring_type === 'subscription' ? 'Subscriptions' : 'EMI & Loans'),
        lender_or_source: editData.lender_or_source || '',
        monthly_amount: String(editData.monthly_amount || ''),
        total_tenure_months: editData.total_tenure_months ? String(editData.total_tenure_months) : '',
        paid_tenure_months: String(editData.paid_tenure_months || 0),
        due_day: editData.due_day ? String(editData.due_day) : '',
        interest_rate: editData.interest_rate ? String(editData.interest_rate) : '',
        start_date: editData.start_date || '',
        end_date: editData.end_date || '',
        is_active: editData.is_active ?? true,
      })
    } else {
      setForm(defaultForm)
    }
  }, [editData, isOpen])

  const handleChange = (field, value) => {
    setForm(f => {
      const updated = { ...f, [field]: value }
      if (field === 'recurring_type') {
        updated.category = value === 'subscription' ? 'Subscriptions' : 'EMI & Loans'
      }
      return updated
    })
  }

  const isSubscription = form.recurring_type === 'subscription'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.monthly_amount) {
      return toast.error('Title and monthly amount are required')
    }
    if (!isSubscription && !form.total_tenure_months) {
      return toast.error('Total tenure is required for EMIs')
    }

    setLoading(true)
    try {
      const payload = {
        recurring_type: form.recurring_type,
        title: form.title,
        category: form.category || (isSubscription ? 'Subscriptions' : 'EMI & Loans'),
        lender_or_source: form.lender_or_source || null,
        monthly_amount: parseFloat(form.monthly_amount),
        total_tenure_months: isSubscription ? null : (parseInt(form.total_tenure_months) || null),
        paid_tenure_months: parseInt(form.paid_tenure_months || 0),
        due_day: form.due_day ? parseInt(form.due_day) : null,
        interest_rate: (!isSubscription && form.interest_rate) ? parseFloat(form.interest_rate) : null,
        start_date: form.start_date || null,
        end_date: isSubscription ? null : (form.end_date || null),
        is_active: form.is_active,
      }

      if (editData) {
        await updateEmi(editData.id, payload)
        toast.success(isSubscription ? 'Subscription updated!' : 'EMI updated!')
      } else {
        await addEmi(payload)
        toast.success(isSubscription ? 'Subscription added!' : 'EMI added!')
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = !isSubscription && form.monthly_amount && form.total_tenure_months
    ? parseFloat(form.monthly_amount) * parseInt(form.total_tenure_months)
    : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? (isSubscription ? 'Edit Subscription' : 'Edit EMI') : 'Add Recurring Payment / EMI'} size="md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">

        {/* Type Selector Toggle */}
        <div>
          <label className="label">Type *</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleChange('recurring_type', 'emi')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${!isSubscription ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Loan / EMI (Fixed Tenure)
            </button>
            <button
              type="button"
              onClick={() => handleChange('recurring_type', 'subscription')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${isSubscription ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Subscription (Open-ended)
            </button>
          </div>
        </div>

        <div>
          <label className="label">{isSubscription ? 'Subscription Name *' : 'Loan / EMI Title *'}</label>
          <input value={form.title} onChange={e => handleChange('title', e.target.value)}
            placeholder={isSubscription ? 'e.g. Netflix, Amazon Prime, Spotify, Gym' : 'e.g. Home Loan, Car EMI, Laptop Finance'}
            className="input" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="input text-sm">
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{isSubscription ? 'Provider / Merchant' : 'Lender / Source'}</label>
            <input value={form.lender_or_source} onChange={e => handleChange('lender_or_source', e.target.value)}
              placeholder={isSubscription ? 'e.g. Netflix Inc, Amazon' : 'e.g. HDFC Bank, Bajaj Finance'}
              className="input text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Monthly Payment ({currency}) *</label>
            <input type="number" value={form.monthly_amount} onChange={e => handleChange('monthly_amount', e.target.value)}
              placeholder="499" className="input" min="0" step="0.01" required />
          </div>
          <div>
            <label className="label">Due Day of Month</label>
            <input type="number" value={form.due_day} onChange={e => handleChange('due_day', e.target.value)}
              placeholder="15 (15th of each month)" className="input" min="1" max="31" />
          </div>
        </div>

        {!isSubscription ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Total Tenure (mo) *</label>
                <input type="number" value={form.total_tenure_months} onChange={e => handleChange('total_tenure_months', e.target.value)}
                  placeholder="36" className="input" min="1" required={!isSubscription} />
              </div>
              <div>
                <label className="label">Paid Months</label>
                <input type="number" value={form.paid_tenure_months} onChange={e => handleChange('paid_tenure_months', e.target.value)}
                  placeholder="0" className="input" min="0"
                  max={form.total_tenure_months || undefined} />
              </div>
              <div>
                <label className="label">Interest (%)</label>
                <input type="number" value={form.interest_rate} onChange={e => handleChange('interest_rate', e.target.value)}
                  placeholder="8.5" className="input" min="0" step="0.01" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start Date</label>
                <input type="date" value={form.start_date} onChange={e => handleChange('start_date', e.target.value)}
                  className="input text-sm" />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" value={form.end_date} onChange={e => handleChange('end_date', e.target.value)}
                  className="input text-sm" />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="label">Subscription Start Date</label>
            <input type="date" value={form.start_date} onChange={e => handleChange('start_date', e.target.value)}
              className="input text-sm" />
            <p className="text-slate-500 text-xs mt-1">Subscriptions have no end date. Only the monthly fee will be billed each month.</p>
          </div>
        )}

        {totalAmount > 0 && !isSubscription && (
          <div className="bg-slate-800/50 rounded-xl p-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Total Loan Obligation:</span>
              <span className="text-slate-200 font-medium">{currency}{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            {form.paid_tenure_months > 0 && (
              <div className="flex justify-between text-slate-400 mt-1">
                <span>Remaining Outstanding:</span>
                <span className="text-amber-400 font-medium">
                  {currency}{((parseFloat(form.monthly_amount) || 0) * ((parseInt(form.total_tenure_months) || 0) - (parseInt(form.paid_tenure_months) || 0))).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer pt-1">
          <div className="relative">
            <input type="checkbox" checked={form.is_active}
              onChange={e => handleChange('is_active', e.target.checked)} className="sr-only" />
            <div className={`w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-indigo-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </div>
          <span className="text-slate-300 text-sm">Active Recurring Payment</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editData ? 'Save Changes' : (isSubscription ? 'Add Subscription' : 'Add EMI'))}
          </button>
        </div>
      </form>
    </Modal>
  )
}

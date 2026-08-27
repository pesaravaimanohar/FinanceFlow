import { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

const defaultForm = {
  title: '',
  lender_or_source: '',
  monthly_amount: '',
  total_tenure_months: '',
  paid_tenure_months: '0',
  due_day: '',
  interest_rate: '',
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
        title: editData.title,
        lender_or_source: editData.lender_or_source || '',
        monthly_amount: String(editData.monthly_amount),
        total_tenure_months: String(editData.total_tenure_months),
        paid_tenure_months: String(editData.paid_tenure_months || 0),
        due_day: editData.due_day ? String(editData.due_day) : '',
        interest_rate: editData.interest_rate ? String(editData.interest_rate) : '',
        is_active: editData.is_active,
      })
    } else {
      setForm(defaultForm)
    }
  }, [editData, isOpen])

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.monthly_amount || !form.total_tenure_months) {
      return toast.error('Title, amount and tenure are required')
    }
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        lender_or_source: form.lender_or_source || null,
        monthly_amount: parseFloat(form.monthly_amount),
        total_tenure_months: parseInt(form.total_tenure_months),
        paid_tenure_months: parseInt(form.paid_tenure_months || 0),
        due_day: form.due_day ? parseInt(form.due_day) : null,
        interest_rate: form.interest_rate ? parseFloat(form.interest_rate) : null,
        is_active: form.is_active,
      }
      if (editData) {
        await updateEmi(editData.id, payload)
        toast.success('EMI updated!')
      } else {
        await addEmi(payload)
        toast.success('EMI added!')
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = form.monthly_amount && form.total_tenure_months
    ? parseFloat(form.monthly_amount) * parseInt(form.total_tenure_months)
    : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit EMI' : 'Add EMI / Loan'} size="md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="label">Loan / EMI Title *</label>
          <input value={form.title} onChange={e => handleChange('title', e.target.value)}
            placeholder="e.g. Home Loan, Car EMI, Amazon Pay Later"
            className="input" required />
        </div>

        <div>
          <label className="label">Lender / Source</label>
          <input value={form.lender_or_source} onChange={e => handleChange('lender_or_source', e.target.value)}
            placeholder="e.g. HDFC Bank, Bajaj Finance"
            className="input" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Monthly EMI ({currency}) *</label>
            <input type="number" value={form.monthly_amount} onChange={e => handleChange('monthly_amount', e.target.value)}
              placeholder="5000" className="input" min="0" step="0.01" required />
          </div>
          <div>
            <label className="label">Interest Rate (%)</label>
            <input type="number" value={form.interest_rate} onChange={e => handleChange('interest_rate', e.target.value)}
              placeholder="8.5" className="input" min="0" step="0.01" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Total Tenure (months) *</label>
            <input type="number" value={form.total_tenure_months} onChange={e => handleChange('total_tenure_months', e.target.value)}
              placeholder="36" className="input" min="1" required />
          </div>
          <div>
            <label className="label">Paid Months</label>
            <input type="number" value={form.paid_tenure_months} onChange={e => handleChange('paid_tenure_months', e.target.value)}
              placeholder="0" className="input" min="0"
              max={form.total_tenure_months || undefined} />
          </div>
        </div>

        <div>
          <label className="label">Due Day of Month</label>
          <input type="number" value={form.due_day} onChange={e => handleChange('due_day', e.target.value)}
            placeholder="5 (5th of each month)" className="input" min="1" max="31" />
        </div>

        {totalAmount > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Total loan amount:</span>
              <span className="text-slate-200 font-medium">{currency}{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            {form.paid_tenure_months > 0 && (
              <div className="flex justify-between text-slate-400 mt-1">
                <span>Remaining amount:</span>
                <span className="text-amber-400 font-medium">
                  {currency}{((parseFloat(form.monthly_amount) || 0) * ((parseInt(form.total_tenure_months) || 0) - (parseInt(form.paid_tenure_months) || 0))).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input type="checkbox" checked={form.is_active}
              onChange={e => handleChange('is_active', e.target.checked)} className="sr-only" />
            <div className={`w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-indigo-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </div>
          <span className="text-slate-300 text-sm">Active EMI</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editData ? 'Update EMI' : 'Add EMI')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

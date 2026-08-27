import { useState } from 'react'
import { Plus, Zap, Trash2, X } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { EXPENSE_CATEGORIES, PAYMENT_MODES } from '../../lib/constants'
import { formatCurrency } from '../../lib/utils'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

export default function QuickPresets({ onUsePreset }) {
  const { presets, addPreset, deletePreset } = useApp()
  const { currency } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', amount: '', category: 'Food & Dining', payment_mode: 'UPI' })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!form.label || !form.amount) return toast.error('Label and amount required')
    setLoading(true)
    try {
      await addPreset({ ...form, amount: parseFloat(form.amount), type: 'expense' })
      toast.success('Preset added!')
      setShowForm(false)
      setForm({ label: '', amount: '', category: 'Food & Dining', payment_mode: 'UPI' })
    } catch {
      toast.error('Failed to save preset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-slate-200 font-medium text-sm">Quick Presets</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {presets.length === 0 ? (
        <p className="text-slate-600 text-xs text-center py-3">
          Add presets for frequent payments
        </p>
      ) : (
        <div className="space-y-2">
          {presets.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              onClick={() => onUsePreset(p)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-xs font-medium truncate">{p.label}</p>
                <p className="text-slate-500 text-xs">{p.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-xs font-semibold">
                  {formatCurrency(p.amount, currency)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePreset(p.id) }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Quick Preset" size="sm">
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Label</label>
            <input
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Daily Lunch"
              className="input"
            />
          </div>
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="150"
              className="input"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Payment Mode</label>
            <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))} className="input">
              {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Preset'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { X, Plus, Tag, Calendar, DollarSign, FileText, Zap } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_MODES } from '../../lib/constants'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const defaultForm = {
  amount: '',
  type: 'expense',
  category: 'Food & Dining',
  tags: [],
  payment_mode: 'UPI',
  notes: '',
  transaction_date: format(new Date(), 'yyyy-MM-dd'),
  transaction_time: format(new Date(), 'HH:mm'),
  is_recurring: false,
}

export default function ExpenseForm({ isOpen, onClose, editData = null, presetData = null }) {
  const { addTransaction, updateTransaction, presets } = useApp()
  const { currency } = useAuth()

  const [form, setForm] = useState(defaultForm)
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const tagInputRef = useRef(null)

  useEffect(() => {
    if (editData) {
      setForm({
        amount: String(editData.amount),
        type: editData.type,
        category: editData.category,
        tags: editData.tags || [],
        payment_mode: editData.payment_mode || 'UPI',
        notes: editData.notes || '',
        transaction_date: editData.transaction_date,
        transaction_time: editData.transaction_time || format(new Date(), 'HH:mm'),
        is_recurring: editData.is_recurring || false,
      })
    } else if (presetData) {
      setForm({
        ...defaultForm,
        amount: String(presetData.amount),
        type: presetData.type || 'expense',
        category: presetData.category,
        tags: presetData.tags || [],
        payment_mode: presetData.payment_mode || 'UPI',
      })
    } else {
      setForm(defaultForm)
      setTagInput('')
    }
  }, [editData, presetData, isOpen])

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleChange = (field, value) => {
    setForm(f => ({
      ...f,
      [field]: value,
      ...(field === 'type' ? { category: value === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0] } : {}),
    }))
  }

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-')
    if (!tag || form.tags.includes(tag)) return
    setForm(f => ({ ...f, tags: [...f.tags, tag] }))
    setTagInput('')
  }

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
    if (e.key === 'Backspace' && !tagInput && form.tags.length) {
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editData) {
        await updateTransaction(editData.id, payload)
        toast.success('Transaction updated!')
      } else {
        await addTransaction(payload)
        toast.success('Transaction added!')
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Quick Presets */}
        {!editData && presets.length > 0 && (
          <div>
            <p className="label flex items-center gap-1"><Zap className="w-3 h-3" /> Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {presets.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm(f => ({
                    ...f,
                    amount: String(p.amount),
                    category: p.category,
                    tags: p.tags || [],
                    type: p.type || 'expense',
                    payment_mode: p.payment_mode || f.payment_mode,
                  }))}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs transition-all"
                >
                  {p.label} · {currency}{p.amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1">
          {['expense', 'income'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => handleChange('type', t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                form.type === t
                  ? t === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{currency}</span>
            <input
              type="number"
              value={form.amount}
              onChange={e => handleChange('amount', e.target.value)}
              placeholder="0.00"
              className="input pl-8 text-lg font-semibold"
              step="0.01"
              min="0"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Category + Payment Mode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
              className="input"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Payment Mode</label>
            <select
              value={form.payment_mode}
              onChange={e => handleChange('payment_mode', e.target.value)}
              className="input"
            >
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</label>
          <div
            className="input flex flex-wrap gap-1.5 min-h-[42px] cursor-text"
            onClick={() => tagInputRef.current?.focus()}
          >
            {form.tags.map(tag => (
              <span key={tag} className="tag-chip flex-shrink-0">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-white ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder={form.tags.length ? '' : 'Type tag + Enter (e.g. #food)'}
              className="bg-transparent outline-none text-slate-200 placeholder-slate-600 text-sm flex-1 min-w-[80px]"
            />
          </div>
          <p className="text-slate-600 text-xs mt-1">Press Enter or comma to add a tag</p>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label flex items-center gap-1"><Calendar className="w-3 h-3" /> Date *</label>
            <input
              type="date"
              value={form.transaction_date}
              onChange={e => handleChange('transaction_date', e.target.value)}
              className="input text-sm"
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>
          <div>
            <label className="label flex items-center gap-1">Time</label>
            <input
              type="time"
              value={form.transaction_time || ''}
              onChange={e => handleChange('transaction_time', e.target.value)}
              className="input text-sm"
            />
          </div>
        </div>

        {/* Description / What you did */}
        <div>
          <label className="label flex items-center gap-1">
            <FileText className="w-3 h-3" /> Description / What you spent on *
          </label>
          <input
            type="text"
            value={form.notes}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="e.g. Dinner at Bistro, Petrol refill, Grocery shopping"
            className="input text-sm"
            required={form.type === 'expense'}
          />
        </div>

        {/* Recurring */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={e => handleChange('is_recurring', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-10 h-5 rounded-full transition-colors ${form.is_recurring ? 'bg-indigo-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${form.is_recurring ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </div>
          <span className="text-slate-300 text-sm">Mark as recurring</span>
        </label>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              editData ? 'Update' : <><Plus className="w-4 h-4" /> Add</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

import { useState } from 'react'
import {
  CreditCard, CheckCircle, Trash2, Pencil, ChevronDown, ChevronUp, Calendar, Repeat,
  Bike, Smartphone, Car, Home, Laptop, Tv, GraduationCap, HeartPulse, Film, CheckCircle2, Sparkles,
} from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, getDaysUntilDue, formatDate } from '../../lib/utils'
import ProgressBar from '../ui/ProgressBar'
import toast from 'react-hot-toast'

const getEmiIcon = (title = '', category = '', isSub = false) => {
  const q = `${title} ${category}`.toLowerCase()
  if (/\b(bike|motorcycle|scooter|two-wheeler|vespa|bullet)\b/.test(q)) return Bike
  if (/\b(mobile|phone|smartphone|iphone|apple|samsung|pixel|redmi|oneplus)\b/.test(q)) return Smartphone
  if (/\b(car|auto|vehicle|suv|sedan)\b/.test(q)) return Car
  if (/\b(home|housing|house|rent|flat|apartment|mortgage)\b/.test(q)) return Home
  if (/\b(laptop|pc|computer|mac|macbook|dell|lenovo|asus|hp)\b/.test(q)) return Laptop
  if (/\b(tv|television|appliance|fridge|washer|ac)\b/.test(q)) return Tv
  if (/\b(education|school|college|tuition|course)\b/.test(q)) return GraduationCap
  if (/\b(health|medical|doctor|hospital|insurance)\b/.test(q)) return HeartPulse
  if (isSub || /\b(netflix|prime|amazon|spotify|hotstar|youtube)\b/.test(q)) return Film
  return CreditCard
}

export default function EMICard({ emi, onEdit }) {
  const { markEmiPaid, deleteEmi } = useApp()
  const { currency } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [paying, setPaying] = useState(false)

  const isSub = emi.recurring_type === 'subscription'
  const daysUntilDue = getDaysUntilDue(emi.due_day)
  
  const hasTenure = !isSub && emi.total_tenure_months > 0
  const paidPct = hasTenure ? Math.min(100, (emi.paid_tenure_months / emi.total_tenure_months) * 100) : 0
  const remainingMonths = hasTenure ? Math.max(0, emi.total_tenure_months - emi.paid_tenure_months) : 0
  const totalAmount = hasTenure ? emi.monthly_amount * emi.total_tenure_months : 0
  const paidAmount = emi.monthly_amount * (emi.paid_tenure_months || 0)
  const remainingAmount = hasTenure ? totalAmount - paidAmount : 0
  const isCompleted = hasTenure && emi.paid_tenure_months >= emi.total_tenure_months

  const IconComponent = getEmiIcon(emi.title, emi.category, isSub)

  // 4-Stage Progress Bar Colors
  const getProgressColor = () => {
    if (isCompleted || paidPct >= 100) return 'bg-emerald-500'
    if (paidPct >= 75) return 'bg-lime-400'
    if (paidPct >= 50) return 'bg-cyan-500'
    if (paidPct >= 25) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  const handlePay = async () => {
    if (isCompleted) return toast('This EMI is already complete! 🎉')
    setPaying(true)
    try {
      await markEmiPaid(emi)
    } catch {
      toast.error('Failed to record payment')
    } finally {
      setPaying(false)
    }
  }

  const handleDelete = async () => {
    const itemLabel = isSub ? 'Subscription' : 'EMI'
    if (!window.confirm(`Delete "${emi.title}" ${itemLabel}?`)) return
    try {
      await deleteEmi(emi.id)
      toast.success(`${itemLabel} removed`)
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className={`card border transition-all duration-200 ${
      isCompleted
        ? 'border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-950/30'
        : !emi.is_active
        ? 'border-slate-700/50 opacity-60'
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Header */}
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
          isCompleted
            ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40'
            : isSub
            ? 'bg-purple-500/20 text-purple-400'
            : paidPct >= 75
            ? 'bg-lime-500/20 text-lime-400'
            : paidPct >= 50
            ? 'bg-cyan-500/20 text-cyan-400'
            : paidPct >= 25
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-rose-500/20 text-rose-400'
        }`}>
          {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" /> : <IconComponent className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-slate-100 font-semibold text-sm truncate">{emi.title}</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isSub
                ? 'bg-purple-900/40 text-purple-300 border-purple-800/50'
                : 'bg-indigo-900/40 text-indigo-300 border-indigo-800/50'
            }`}>
              {isSub ? 'Subscription' : 'EMI'}
            </span>
            {isCompleted && (
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Fully Paid Off!
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            {emi.lender_or_source ? `${emi.lender_or_source} • ` : ''}
            <span className="text-slate-300 font-medium">{emi.category || (isSub ? 'Subscriptions' : 'EMI & Loans')}</span>
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-slate-100 font-bold text-sm">{formatCurrency(emi.monthly_amount, currency)}</p>
          <p className="text-slate-500 text-xs">/month</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" />}
      </div>

      {/* Progress or Subscription Indicator */}
      <div className="mt-3">
        {hasTenure ? (
          <>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">{emi.paid_tenure_months} of {emi.total_tenure_months} months paid</span>
              <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-slate-300'}`}>
                {paidPct.toFixed(0)}%
              </span>
            </div>
            <ProgressBar value={emi.paid_tenure_months} max={emi.total_tenure_months} showLabel={false} height="h-2.5"
              colorClass={getProgressColor()}
            />
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-slate-400">Paid: <strong className="text-slate-200">{formatCurrency(paidAmount, currency)}</strong></span>
              {!isCompleted && (
                <span className="text-slate-400">Remaining: <strong className="text-amber-400">{formatCurrency(remainingAmount, currency)}</strong></span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-purple-400" />
              <span>Open-ended Billing (No End Date)</span>
            </span>
            <span className="text-purple-300 font-medium">Auto-Recurring</span>
          </div>
        )}
      </div>

      {/* Prominent Dates Summary */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {emi.start_date && (
            <span>Start: <strong className="text-slate-200">{formatDate(emi.start_date)}</strong></span>
          )}
          <span>End: <strong className="text-slate-200">{isSub ? 'Indefinite' : (emi.end_date ? formatDate(emi.end_date) : 'N/A')}</strong></span>
        </div>

        {emi.due_day && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Due Day {emi.due_day}</span>
            {daysUntilDue !== null && (
              <span className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${
                daysUntilDue <= 2 ? 'bg-red-900/40 text-red-400' :
                daysUntilDue <= 7 ? 'bg-amber-900/40 text-amber-400' :
                'text-slate-400'
              }`}>
                {daysUntilDue === 0 ? 'Today' : `in ${daysUntilDue}d`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {!isSub && emi.interest_rate && (
              <div className="card-sm">
                <p className="text-slate-500">Interest Rate</p>
                <p className="text-slate-200 font-medium">{emi.interest_rate}%</p>
              </div>
            )}
            {hasTenure && (
              <div className="card-sm">
                <p className="text-slate-500">Total Obligation</p>
                <p className="text-slate-200 font-medium">{formatCurrency(totalAmount, currency)}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {(!isCompleted || isSub) && emi.is_active && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-emerald flex-1 justify-center text-xs py-2"
              >
                {paying
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><CheckCircle className="w-3.5 h-3.5" /> {isSub ? 'Record Subscription Payment' : 'Mark This Month Paid'}</>
                }
              </button>
            )}
            <button onClick={() => onEdit(emi)} className="btn-secondary text-xs py-2 px-3">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleDelete} className="btn-danger text-xs py-2 px-3">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

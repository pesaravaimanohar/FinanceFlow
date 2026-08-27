import { useState } from 'react'
import { CreditCard, CheckCircle, Trash2, Pencil, ChevronDown, ChevronUp, Calendar, Repeat } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, getDaysUntilDue, formatDate } from '../../lib/utils'
import ProgressBar from '../ui/ProgressBar'
import toast from 'react-hot-toast'

export default function EMICard({ emi, onEdit }) {
  const { markEmiPaid, deleteEmi } = useApp()
  const { currency } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [paying, setPaying] = useState(false)

  const isSub = emi.recurring_type === 'subscription'
  const daysUntilDue = getDaysUntilDue(emi.due_day)
  
  const hasTenure = !isSub && emi.total_tenure_months > 0
  const paidPct = hasTenure ? (emi.paid_tenure_months / emi.total_tenure_months) * 100 : 0
  const remainingMonths = hasTenure ? Math.max(0, emi.total_tenure_months - emi.paid_tenure_months) : 0
  const totalAmount = hasTenure ? emi.monthly_amount * emi.total_tenure_months : 0
  const paidAmount = emi.monthly_amount * (emi.paid_tenure_months || 0)
  const remainingAmount = hasTenure ? totalAmount - paidAmount : 0
  const isCompleted = hasTenure && emi.paid_tenure_months >= emi.total_tenure_months

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
        ? 'border-emerald-800/40 bg-emerald-900/10'
        : !emi.is_active
        ? 'border-slate-700/50 opacity-60'
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Header */}
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isSub ? 'bg-purple-500/20 text-purple-400' : (isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400')
        }`}>
          {isSub ? <Repeat className="w-5 h-5" /> : (isCompleted ? <CheckCircle className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />)}
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
              <span className="text-[10px] font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-full">
                Paid Off!
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            {emi.lender_or_source ? `${emi.lender_or_source} • ` : ''}
            <span className="text-slate-400">{emi.category || (isSub ? 'Subscriptions' : 'EMI & Loans')}</span>
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
              <span className="text-slate-500">{emi.paid_tenure_months} of {emi.total_tenure_months} months paid</span>
              <span className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                {paidPct.toFixed(0)}%
              </span>
            </div>
            <ProgressBar value={emi.paid_tenure_months} max={emi.total_tenure_months} showLabel={false} height="h-2.5"
              colorClass={isCompleted ? 'bg-emerald-500' : undefined}
            />
            <div className="flex justify-between mt-1.5 text-xs">
              <span className="text-slate-500">Paid: {formatCurrency(paidAmount, currency)}</span>
              {!isCompleted && (
                <span className="text-slate-500">Remaining: {formatCurrency(remainingAmount, currency)}</span>
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

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {emi.start_date && (
              <div className="card-sm">
                <p className="text-slate-500">Start Date</p>
                <p className="text-slate-200 font-medium">{formatDate(emi.start_date)}</p>
              </div>
            )}
            <div className="card-sm">
              <p className="text-slate-500">End Date</p>
              <p className="text-slate-200 font-medium">
                {isSub ? 'Indefinite (No End Date)' : (emi.end_date ? formatDate(emi.end_date) : 'N/A')}
              </p>
            </div>
            {emi.due_day && (
              <div className="card-sm">
                <p className="text-slate-500">Due Day</p>
                <p className="text-slate-200 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" /> Day {emi.due_day}
                  {daysUntilDue !== null && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full ${
                      daysUntilDue <= 2 ? 'bg-red-900/40 text-red-400' :
                      daysUntilDue <= 7 ? 'bg-amber-900/40 text-amber-400' :
                      'text-slate-500'
                    }`}>
                      {daysUntilDue === 0 ? 'Today' : `in ${daysUntilDue}d`}
                    </span>
                  )}
                </p>
              </div>
            )}
            {!isSub && emi.interest_rate && (
              <div className="card-sm">
                <p className="text-slate-500">Interest Rate</p>
                <p className="text-slate-200 font-medium">{emi.interest_rate}%</p>
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

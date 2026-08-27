import { useState } from 'react'
import { CreditCard, CheckCircle, Clock, Trash2, Pencil, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, getDaysUntilDue } from '../../lib/utils'
import ProgressBar from '../ui/ProgressBar'
import toast from 'react-hot-toast'

export default function EMICard({ emi, onEdit }) {
  const { markEmiPaid, deleteEmi } = useApp()
  const { currency } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [paying, setPaying] = useState(false)

  const daysUntilDue = getDaysUntilDue(emi.due_day)
  const paidPct = emi.total_tenure_months > 0
    ? (emi.paid_tenure_months / emi.total_tenure_months) * 100
    : 0
  const remainingMonths = emi.total_tenure_months - emi.paid_tenure_months
  const totalAmount = emi.monthly_amount * emi.total_tenure_months
  const paidAmount = emi.monthly_amount * emi.paid_tenure_months
  const remainingAmount = totalAmount - paidAmount
  const isCompleted = emi.paid_tenure_months >= emi.total_tenure_months

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
    if (!window.confirm(`Delete "${emi.title}" EMI?`)) return
    try {
      await deleteEmi(emi.id)
      toast.success('EMI removed')
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
          isCompleted ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
        }`}>
          {isCompleted
            ? <CheckCircle className="w-5 h-5 text-emerald-400" />
            : <CreditCard className="w-5 h-5 text-indigo-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-slate-100 font-semibold text-sm truncate">{emi.title}</h3>
            {isCompleted && (
              <span className="text-[10px] font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-full">
                Paid Off!
              </span>
            )}
          </div>
          {emi.lender_or_source && (
            <p className="text-slate-500 text-xs">{emi.lender_or_source}</p>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-slate-100 font-bold text-sm">{formatCurrency(emi.monthly_amount, currency)}</p>
          <p className="text-slate-500 text-xs">/month</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" />}
      </div>

      {/* Progress */}
      <div className="mt-3">
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
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {emi.interest_rate && (
              <div className="card-sm">
                <p className="text-slate-500">Interest Rate</p>
                <p className="text-slate-200 font-medium">{emi.interest_rate}%</p>
              </div>
            )}
            {emi.due_day && (
              <div className="card-sm">
                <p className="text-slate-500">Due Date</p>
                <p className="text-slate-200 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Day {emi.due_day}
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
            <div className="card-sm">
              <p className="text-slate-500">Total Amount</p>
              <p className="text-slate-200 font-medium">{formatCurrency(totalAmount, currency)}</p>
            </div>
            <div className="card-sm">
              <p className="text-slate-500">Remaining</p>
              <p className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-slate-200'}`}>
                {isCompleted ? 'Done!' : `${remainingMonths} months`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {!isCompleted && emi.is_active && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-emerald flex-1 justify-center text-xs py-2"
              >
                {paying
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><CheckCircle className="w-3.5 h-3.5" /> Mark This Month Paid</>
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

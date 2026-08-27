import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp, Tag, RefreshCw } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, formatDate } from '../../lib/utils'
import { CATEGORY_COLORS } from '../../lib/constants'
import toast from 'react-hot-toast'

export default function TransactionList({ transactions, onEdit, onTagClick, selectedTags }) {
  const { deleteTransaction } = useApp()
  const { currency } = useAuth()
  const [expandedId, setExpandedId] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await deleteTransaction(id)
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <Tag className="w-7 h-7 text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">No transactions found</p>
        <p className="text-slate-600 text-sm mt-1">Add your first transaction to get started</p>
      </div>
    )
  }

  // Group by date
  const grouped = transactions.reduce((acc, t) => {
    const date = t.transaction_date
    if (!acc[date]) acc[date] = []
    acc[date].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, txns]) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500">{formatDate(date)}</span>
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">
              {txns.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0) > 0
                ? `-${formatCurrency(txns.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0), currency)}`
                : ''}
            </span>
          </div>

          <div className="space-y-2">
            {txns.map(t => {
              const isExpanded = expandedId === t.id
              const catColor = CATEGORY_COLORS[t.category] || '#94a3b8'
              return (
                <div
                  key={t.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-200 animate-fade-in"
                >
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  >
                    {/* Category dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: catColor }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 text-sm font-medium truncate">
                          {t.notes || t.category}
                        </span>
                        {t.is_recurring && (
                          <RefreshCw className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-500">{t.category}</span>
                        {t.payment_mode && (
                          <span className="text-xs text-slate-600">· {t.payment_mode}</span>
                        )}
                        {(t.tags || []).slice(0, 3).map(tag => (
                          <button
                            key={tag}
                            onClick={e => { e.stopPropagation(); onTagClick?.(tag) }}
                            className={`text-xs px-1.5 py-0.5 rounded-md transition-colors ${
                              selectedTags?.includes(tag)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-indigo-400 hover:bg-indigo-900/40'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                        {(t.tags || []).length > 3 && (
                          <span className="text-xs text-slate-600">+{t.tags.length - 3}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-semibold text-sm ${
                        t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Actions */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 px-3 py-2.5 flex items-center justify-between bg-slate-900/50 animate-fade-in">
                      {(t.tags || []).length > 3 && (
                        <div className="flex gap-1 flex-wrap">
                          {(t.tags || []).slice(3).map(tag => (
                            <span key={tag} className="tag-chip text-[11px]">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => onEdit(t)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-indigo-900/20"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

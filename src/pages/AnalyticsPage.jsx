import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import AnalyticsCharts from '../components/analytics/AnalyticsCharts'
import { DATE_FILTERS } from '../lib/constants'

export default function AnalyticsPage() {
  const {
    transactions, dateFilter, setDateFilter,
    customDateRange, setCustomDateRange, loadingTransactions,
  } = useApp()

  // For analytics, use last 6 months always for bar chart
  // but respect filter for pie/category charts
  const filteredTransactions = transactions

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Visual insights into your spending</p>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex gap-2 flex-wrap">
        {DATE_FILTERS.slice(0, 5).map(f => (
          <button
            key={f.value}
            onClick={() => setDateFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loadingTransactions ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No data to analyze</p>
          <p className="text-slate-600 text-sm mt-1">Add some transactions to see insights</p>
        </div>
      ) : (
        <AnalyticsCharts transactions={filteredTransactions} />
      )}
    </div>
  )
}

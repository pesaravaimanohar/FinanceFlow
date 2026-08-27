import { useMemo } from 'react'
import { BarChart3, Download, Landmark, PiggyBank, CreditCard, ChevronDown } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import AnalyticsCharts from '../components/analytics/AnalyticsCharts'
import { DATE_FILTERS } from '../lib/constants'
import { formatCurrency } from '../lib/utils'

export default function AnalyticsPage() {
  const {
    transactions, dateFilter, setDateFilter,
    loadingTransactions,
  } = useApp()
  const { currency } = useAuth()

  // For analytics, use last 6 months always for bar chart
  // but respect filter for pie/category charts
  const filteredTransactions = transactions

  // Computed metrics
  const { totalWealth, savingsRate, topCategory, topCategoryAmount } = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
    const wealth = allIncome - allExpense

    const filteredIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
    const filteredExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
    
    let rate = 0
    if (filteredIncome > 0) {
      rate = (((filteredIncome - filteredExpense) / filteredIncome) * 100)
    }

    const catSpending = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount || 0)
      return acc
    }, {})
    
    let topCat = 'None'
    let topCatAmt = 0
    Object.entries(catSpending).forEach(([cat, amt]) => {
      if (amt > topCatAmt) {
        topCat = cat
        topCatAmt = amt
      }
    })

    return {
      totalWealth: wealth,
      savingsRate: rate.toFixed(1),
      topCategory: topCat,
      topCategoryAmount: topCatAmt
    }
  }, [transactions, filteredTransactions])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-1">Financial Analysis</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">High-level overview of your financial health and trajectories.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-primary font-label-caps text-label-caps hover:bg-surface-container transition-colors shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <div className="relative">
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-10 py-2 text-primary font-label-caps text-[13px] font-semibold tracking-wide focus:border-secondary focus:ring-1 focus:ring-secondary outline-none shadow-sm cursor-pointer"
            >
              {DATE_FILTERS.slice(0, 5).map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
        </div>
      </div>

      {loadingTransactions ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />)}
          </div>
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-surface border border-outline-variant rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7 text-on-surface-variant" />
          </div>
          <p className="text-on-surface font-medium">No data to analyze</p>
          <p className="text-on-surface-variant text-sm mt-1">Add some transactions to see insights</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1: Total Wealth */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed/20 flex items-center justify-center text-primary">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Total Wealth</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-data-lg text-[32px] font-semibold text-primary tracking-tight">{formatCurrency(totalWealth, currency)}</span>
              </div>
            </div>

            {/* Metric 2: Monthly Savings Rate */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Savings Rate</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-data-lg text-[32px] font-semibold text-primary tracking-tight">{savingsRate}%</span>
              </div>
            </div>

            {/* Metric 3: Top Spending Category */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-error-container/50 flex items-center justify-center text-error">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Top Spend Category</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-md text-headline-md text-primary">{topCategory}</span>
              </div>
              <div className="mt-1 font-data-md text-data-md text-on-surface-variant">
                {formatCurrency(topCategoryAmount, currency)} this period
              </div>
            </div>
          </div>

          <AnalyticsCharts transactions={filteredTransactions} allTransactions={transactions} />
        </>
      )}
    </div>
  )
}

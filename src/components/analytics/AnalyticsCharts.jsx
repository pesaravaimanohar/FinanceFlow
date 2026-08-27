import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { CATEGORY_COLORS } from '../../lib/constants'
import { formatCurrency, getLast6Months, getMonthLabel } from '../../lib/utils'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="text-slate-100 font-semibold">{formatCurrency(p.value, currency)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsCharts({ transactions }) {
  const { currency } = useAuth()

  // ── 6-Month Bar Chart ─────────────────────────────────────
  const months = getLast6Months()
  const barData = months.map(m => {
    const monthTxns = transactions.filter(t => t.transaction_date?.startsWith(m))
    return {
      month: getMonthLabel(m).split(' ')[0], // Short month name
      Income: monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0),
      Expenses: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0),
    }
  })

  // ── Tag Distribution Donut ────────────────────────────────
  const tagSpending = {}
  transactions
    .filter(t => t.type === 'expense' && t.tags?.length)
    .forEach(t => {
      t.tags.forEach(tag => {
        tagSpending[tag] = (tagSpending[tag] || 0) + parseFloat(t.amount)
      })
    })
  const tagData = Object.entries(tagSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const tagColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6']

  // ── Category Spending Bar ─────────────────────────────────
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount)
      return acc
    }, {})

  const categoryData = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, amount]) => ({ category, amount, color: CATEGORY_COLORS[category] || '#94a3b8' }))

  const maxCatAmount = categoryData[0]?.amount || 1

  const pieLabelRenderer = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="600">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6">
      {/* Income vs Expenses - 6 Month Bar Chart */}
      <div className="card">
        <h3 className="text-slate-200 font-semibold text-sm mb-4">Income vs Expenses (6 months)</h3>
        {barData.every(d => d.Income === 0 && d.Expenses === 0) ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
            No data for the last 6 months
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={v => `${currency}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} width={55} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '8px' }} />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tag Distribution Donut */}
      <div className="card">
        <h3 className="text-slate-200 font-semibold text-sm mb-4">Tag Distribution</h3>
        {tagData.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
            <p>No tagged transactions yet</p>
            <p className="text-xs text-slate-600">Add tags when logging expenses to see distribution</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={tagData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={pieLabelRenderer}
                >
                  {tagData.map((_, i) => (
                    <Cell key={i} fill={tagColors[i % tagColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value, currency)}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  itemStyle={{ color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {tagData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: tagColors[i % tagColors.length] }} />
                    <span className="text-slate-400 text-xs truncate">#{item.name}</span>
                  </div>
                  <span className="text-slate-300 text-xs font-medium flex-shrink-0">
                    {formatCurrency(item.value, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Spending Ranked */}
      <div className="card">
        <h3 className="text-slate-200 font-semibold text-sm mb-4">Top Spending Categories</h3>
        {categoryData.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-slate-500 text-sm">
            No expense data for this period
          </div>
        ) : (
          <div className="space-y-3">
            {categoryData.map((cat, i) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-xs w-4">{i + 1}</span>
                    <span className="text-slate-300 text-sm">{cat.category}</span>
                  </div>
                  <span className="text-slate-300 text-sm font-medium">
                    {formatCurrency(cat.amount, currency)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(cat.amount / maxCatAmount) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { CATEGORY_COLORS } from '../../lib/constants'
import { formatCurrency, getLast6Months, getMonthLabel } from '../../lib/utils'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-3 shadow-xl text-xs">
        <p className="text-on-surface font-medium mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-on-surface-variant">{p.name}:</span>
            <span className="text-primary font-semibold">{formatCurrency(p.value, currency)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsCharts({ transactions, allTransactions }) {
  const { currency } = useAuth()

  // ── 6-Month Income vs Expense Bar Chart Data ─────────────────
  const months = getLast6Months().reverse() // Show oldest first to newest left-to-right
  const barData = months.map(m => {
    const monthTxns = (allTransactions || transactions).filter(t => t.transaction_date?.startsWith(m))
    return {
      month: getMonthLabel(m).split(' ')[0], // Short month name
      Income: monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0),
      Expenses: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0),
    }
  })

  // ── Wealth Overview Line Chart Data (Cumulative over 6 months) ──
  // Calculate starting wealth before the 6 month window
  const oldestMonth = months[0]
  const before6MonthsTxns = (allTransactions || transactions).filter(t => t.transaction_date < `${oldestMonth}-01`)
  let cumulativeWealth = before6MonthsTxns.reduce((acc, t) => {
    const amt = parseFloat(t.amount || 0)
    return t.type === 'income' ? acc + amt : acc - amt
  }, 0)
  
  const wealthData = months.map(m => {
    const monthTxns = (allTransactions || transactions).filter(t => t.transaction_date?.startsWith(m))
    const inc = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)
    const exp = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)
    cumulativeWealth += (inc - exp)
    return {
      month: getMonthLabel(m).split(' ')[0],
      Wealth: cumulativeWealth
    }
  })

  // ── Category Distribution Donut ───────────────────────────────
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount)
      return acc
    }, {})

  const categoryData = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, value]) => ({ name, value }))

  // Calculate total for center overlay
  const totalCategorySpend = categoryData.reduce((sum, item) => sum + item.value, 0)
  const catColors = ['#0F172A', '#2170e4', '#bec6e0', '#e0e3e5']

  const pieLabelRenderer = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill={percent > 0.3 ? "white" : "#191c1e"} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="600">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Wealth Overview Line Chart (Spans 2 cols) */}
      <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/50 flex flex-col h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline-sm text-headline-sm text-primary">Wealth Overview</h3>
        </div>
        <div className="flex-grow w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0058be" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0058be" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45464d' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45464d' }} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area type="monotone" dataKey="Wealth" stroke="#0058be" strokeWidth={2} fillOpacity={1} fill="url(#wealthGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Distribution Pie Chart */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/50 flex flex-col h-[400px]">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-6">Spending Distribution</h3>
        {categoryData.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-on-surface-variant text-sm">
            No expense data
          </div>
        ) : (
          <>
            <div className="flex-grow flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={pieLabelRenderer}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={catColors[i % catColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value, currency)}
                    contentStyle={{ background: '#ffffff', border: '1px solid #e0e3e5', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
                <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant">Total Spend</span>
                <span className="font-data-lg text-lg text-primary mt-1">{formatCurrency(totalCategorySpend, currency)}</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-col gap-2">
              {categoryData.map((item, i) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: catColors[i % catColors.length] }}></div>
                    <span className="text-on-surface truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-data-md text-on-surface font-medium">
                    {((item.value / totalCategorySpend) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Expenditure vs Income Bar Chart (Full Width) */}
      <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/50 flex flex-col h-[350px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline-sm text-headline-sm text-primary">Income vs. Expenditure</h3>
        </div>
        <div className="flex-grow w-full relative">
          {barData.every(d => d.Income === 0 && d.Expenses === 0) ? (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
              No data for the last 6 months
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45464d' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45464d' }}
                  tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'transparent' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#45464d', paddingTop: '16px' }} iconType="rect" />
                <Bar dataKey="Income" fill="#0F172A" radius={[4, 4, 4, 4]} barSize={24} />
                <Bar dataKey="Expenses" fill="#d8e2ff" radius={[4, 4, 4, 4]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

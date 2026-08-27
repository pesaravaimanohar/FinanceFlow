import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns'
import * as XLSX from 'xlsx'

export const formatCurrency = (amount, currency = '₹') => {
  const num = parseFloat(amount) || 0
  if (currency === '$' || currency === 'A$' || currency === 'S$') {
    return `${currency}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  if (currency === '€' || currency === '£') {
    return `${currency}${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = (date) => {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd MMM yyyy')
  } catch {
    return date
  }
}

export const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const [h, m] = timeStr.split(':')
    const d = new Date()
    d.setHours(parseInt(h, 10), parseInt(m, 10))
    return format(d, 'hh:mm a')
  } catch {
    return timeStr
  }
}

export const formatMonthYear = (date = new Date()) => {
  return format(date, 'yyyy-MM')
}

export const getMonthLabel = (monthYear) => {
  try {
    return format(parseISO(`${monthYear}-01`), 'MMMM yyyy')
  } catch {
    return monthYear
  }
}

export const getLast6Months = () => {
  const months = []
  for (let i = 5; i >= 0; i--) {
    months.push(formatMonthYear(subMonths(new Date(), i)))
  }
  return months
}

export const getDateRangeFromFilter = (filter, customStart, customEnd) => {
  const now = new Date()
  switch (filter) {
    case 'today':
      return { start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
    case 'week':
      return {
        start: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        end: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      }
    case 'month':
      return {
        start: format(startOfMonth(now), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd'),
      }
    case '3months':
      return {
        start: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd'),
      }
    case 'year':
      return {
        start: format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'),
        end: format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd'),
      }
    case 'custom':
      return { start: customStart, end: customEnd }
    default:
      return {
        start: format(startOfMonth(now), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd'),
      }
  }
}

export const getDaysUntilDue = (dueDay) => {
  if (!dueDay) return null
  const now = new Date()
  let dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay)
  if (dueDate < now) {
    dueDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay)
  }
  const diff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
  return diff
}

export const exportToExcel = ({
  transactions = [],
  budgets = [],
  emis = [],
  profile = null,
  selectedMonth = format(new Date(), 'yyyy-MM'),
  currency = '₹',
}) => {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Financial Summary ─────────────────────────────
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
  const totalBudget = budgets.reduce((s, b) => s + parseFloat(b.budget_limit || 0), 0)
  const activeEmis = emis.filter(e => e.is_active)
  const totalEmiCommitment = activeEmis.reduce((s, e) => s + parseFloat(e.monthly_amount || 0), 0)

  const summaryData = [
    ['PERSONAL FINANCE EXECUTIVE SUMMARY'],
    ['Report Period', getMonthLabel(selectedMonth)],
    ['Currency Symbol', currency],
    ['Generated On', format(new Date(), 'dd MMM yyyy, HH:mm')],
    [],
    ['Financial Metric', 'Amount'],
    ['Monthly Income Target', profile?.monthly_income_target ? parseFloat(profile.monthly_income_target) : 0],
    ['Actual Total Income Logged', totalIncome],
    ['Actual Total Expenses Logged', totalExpenses],
    ['Total Category Budget Allocated', totalBudget],
    ['Monthly Recurring Commitment (EMIs + Subscriptions)', totalEmiCommitment],
    ['Net Savings (Income - Expenses)', totalIncome - totalExpenses],
    ['Budget Variance (Budget - Expenses)', totalBudget - totalExpenses],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 45 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary')

  // ── Sheet 2: Transactions Log ──────────────────────────────
  const txHeaders = ['Date', 'Type', 'Category', `Amount (${currency})`, 'Payment Mode', 'Tags', 'Notes']
  const txRows = transactions.map(t => [
    t.transaction_date,
    t.type?.toUpperCase(),
    t.category,
    parseFloat(t.amount || 0),
    t.payment_mode || 'N/A',
    Array.isArray(t.tags) ? t.tags.join(', ') : '',
    t.notes || '',
  ])
  const wsTx = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows])
  wsTx['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions')

  // ── Sheet 3: Monthly Budget vs Actual ─────────────────────
  const categorySpent = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount || 0)
    return acc
  }, {})

  const budgetHeaders = ['Category', `Budget Limit (${currency})`, `Actual Spent (${currency})`, `Remaining (${currency})`, '% Used', 'Status']
  const budgetRows = budgets.map(b => {
    const spent = categorySpent[b.category] || 0
    const limit = parseFloat(b.budget_limit || 0)
    const remaining = limit - spent
    const pct = limit > 0 ? (spent / limit) * 100 : 0
    const status = spent > limit ? 'Over Budget' : remaining < limit * 0.2 ? 'Warning' : 'Within Budget'
    return [b.category, limit, spent, remaining, `${pct.toFixed(1)}%`, status]
  })
  const wsBudget = XLSX.utils.aoa_to_sheet([budgetHeaders, ...budgetRows])
  wsBudget['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget vs Actual')

  // ── Sheet 4: Recurring Payments & Subscriptions ────────────
  const recHeaders = ['Title', 'Type', 'Category', 'Lender / Provider', `Monthly Amount (${currency})`, 'Due Day', 'Start Date', 'End Date', 'Paid / Total Months', 'Status']
  const recRows = emis.map(e => {
    const typeLabel = e.recurring_type === 'subscription' ? 'Subscription' : 'EMI / Loan'
    const tenureLabel = e.recurring_type === 'subscription'
      ? 'Indefinite (No End Date)'
      : `${e.paid_tenure_months || 0} / ${e.total_tenure_months || 'N/A'}`
    const endDateLabel = e.recurring_type === 'subscription' || !e.end_date
      ? 'No End Date'
      : e.end_date
    return [
      e.title,
      typeLabel,
      e.category || 'EMI & Loans',
      e.lender_or_source || 'N/A',
      parseFloat(e.monthly_amount || 0),
      e.due_day ? `Day ${e.due_day}` : 'N/A',
      e.start_date || 'N/A',
      endDateLabel,
      tenureLabel,
      e.is_active ? 'Active' : 'Completed / Inactive',
    ]
  })
  const wsRec = XLSX.utils.aoa_to_sheet([recHeaders, ...recRows])
  wsRec['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsRec, 'Recurring & Subscriptions')

  // Trigger download
  const filename = `Finance_Report_${selectedMonth}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`
  XLSX.writeFile(wb, filename)
}

export const exportToCSV = (transactions, currency = '₹') => {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Mode', 'Tags', 'Notes']
  const rows = transactions.map(t => [
    t.transaction_date,
    t.type,
    t.category,
    t.amount,
    t.payment_mode || '',
    (t.tags || []).join('; '),
    t.notes || '',
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')

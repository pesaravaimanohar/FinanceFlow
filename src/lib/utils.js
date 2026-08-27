import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns'

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

// Shared constants across the application

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Utilities & Bills',
  'Healthcare',
  'Education',
  'Housing & Rent',
  'EMI & Loans',
  'Personal Care',
  'Travel',
  'Subscriptions',
  'Investments',
  'Other',
]

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment Returns',
  'Rental Income',
  'Gift',
  'Refund',
  'Other Income',
]

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export const PAYMENT_MODES = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Net Banking',
  'Other',
]

export const CURRENCIES = [
  { symbol: '₹', label: 'Indian Rupee (INR)', code: 'INR' },
  { symbol: '$', label: 'US Dollar (USD)', code: 'USD' },
  { symbol: '€', label: 'Euro (EUR)', code: 'EUR' },
  { symbol: '£', label: 'British Pound (GBP)', code: 'GBP' },
  { symbol: '¥', label: 'Japanese Yen (JPY)', code: 'JPY' },
  { symbol: 'A$', label: 'Australian Dollar (AUD)', code: 'AUD' },
  { symbol: 'S$', label: 'Singapore Dollar (SGD)', code: 'SGD' },
  { symbol: 'AED', label: 'UAE Dirham (AED)', code: 'AED' },
]

export const DATE_FILTERS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
]

export const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  'Groceries': '#84cc16',
  'Shopping': '#ec4899',
  'Transportation': '#3b82f6',
  'Entertainment': '#a855f7',
  'Utilities & Bills': '#06b6d4',
  'Healthcare': '#ef4444',
  'Education': '#8b5cf6',
  'Housing & Rent': '#64748b',
  'EMI & Loans': '#f59e0b',
  'Personal Care': '#f472b6',
  'Travel': '#10b981',
  'Subscriptions': '#6366f1',
  'Investments': '#22c55e',
  'Other': '#94a3b8',
  'Salary': '#10b981',
  'Freelance': '#22c55e',
  'Business': '#16a34a',
  'Investment Returns': '#15803d',
  'Rental Income': '#166534',
  'Gift': '#86efac',
  'Refund': '#4ade80',
  'Other Income': '#bbf7d0',
}

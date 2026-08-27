import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { formatMonthYear, getDateRangeFromFilter } from '../lib/utils'
import toast from 'react-hot-toast'

const AppContext = createContext({})

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export const AppProvider = ({ children }) => {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState([])
  const [emis, setEmis] = useState([])
  const [budgets, setBudgets] = useState([])
  const [presets, setPresets] = useState([])

  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [loadingEmis, setLoadingEmis] = useState(false)
  const [loadingBudgets, setLoadingBudgets] = useState(false)

  const [dateFilter, setDateFilter] = useState('month')
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })
  const [selectedMonth, setSelectedMonth] = useState(formatMonthYear(new Date()))

  // ── Transactions ──────────────────────────────────────────
  const fetchTransactions = useCallback(async (filter = dateFilter, custom = customDateRange) => {
    if (!user) return
    setLoadingTransactions(true)
    try {
      const { start, end } = getDateRangeFromFilter(filter, custom.start, custom.end)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', start)
        .lte('transaction_date', end)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      toast.error('Failed to load transactions')
      console.error(err)
    } finally {
      setLoadingTransactions(false)
    }
  }, [user, dateFilter, customDateRange])

  const addTransaction = async (txData) => {
    if (!user) return
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...txData, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    await fetchTransactions()
    return data
  }

  const updateTransaction = async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  // ── EMIs ──────────────────────────────────────────────────
  const fetchEmis = useCallback(async () => {
    if (!user) return
    setLoadingEmis(true)
    try {
      const { data, error } = await supabase
        .from('emis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setEmis(data || [])
    } catch (err) {
      toast.error('Failed to load EMIs')
    } finally {
      setLoadingEmis(false)
    }
  }, [user])

  const addEmi = async (emiData) => {
    const { data, error } = await supabase
      .from('emis')
      .insert({ ...emiData, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setEmis(prev => [data, ...prev])
    return data
  }

  const updateEmi = async (id, updates) => {
    const { data, error } = await supabase
      .from('emis')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setEmis(prev => prev.map(e => e.id === id ? data : e))
    return data
  }

  const deleteEmi = async (id) => {
    const { error } = await supabase.from('emis').delete().eq('id', id)
    if (error) throw error
    setEmis(prev => prev.filter(e => e.id !== id))
  }

  const markEmiPaid = async (emi) => {
    // Create transaction for EMI payment
    await addTransaction({
      amount: emi.monthly_amount,
      type: 'expense',
      category: 'EMI & Loans',
      tags: ['emi', emi.title.toLowerCase().replace(/\s+/g, '-')],
      notes: `EMI payment: ${emi.title}`,
      payment_mode: 'Net Banking',
      transaction_date: new Date().toISOString().split('T')[0],
    })
    // Increment paid months
    const newPaid = emi.paid_tenure_months + 1
    const isCompleted = newPaid >= emi.total_tenure_months
    await updateEmi(emi.id, {
      paid_tenure_months: newPaid,
      is_active: !isCompleted,
    })
    toast.success(isCompleted ? `🎉 ${emi.title} fully paid off!` : `EMI payment recorded!`)
  }

  // ── Budgets ───────────────────────────────────────────────
  const fetchBudgets = useCallback(async (month = selectedMonth) => {
    if (!user) return
    setLoadingBudgets(true)
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', month)
      if (error) throw error
      setBudgets(data || [])
    } catch (err) {
      toast.error('Failed to load budgets')
    } finally {
      setLoadingBudgets(false)
    }
  }, [user, selectedMonth])

  const upsertBudget = async (category, budget_limit) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: user.id,
        month_year: selectedMonth,
        category,
        budget_limit,
      }, { onConflict: 'user_id,month_year,category' })
      .select()
      .single()
    if (error) throw error
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category)
      if (exists) return prev.map(b => b.category === category ? data : b)
      return [...prev, data]
    })
    return data
  }

  const deleteBudget = async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  const cloneLastMonthBudget = async () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const lastMonth = month === 1
      ? `${year - 1}-12`
      : `${year}-${String(month - 1).padStart(2, '0')}`

    const { data: lastBudgets, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', lastMonth)

    if (error) throw error
    if (!lastBudgets?.length) throw new Error('No budgets found for last month')

    const newBudgets = lastBudgets.map(b => ({
      user_id: user.id,
      month_year: selectedMonth,
      category: b.category,
      budget_limit: b.budget_limit,
    }))

    const { error: insertError } = await supabase
      .from('budgets')
      .upsert(newBudgets, { onConflict: 'user_id,month_year,category' })

    if (insertError) throw insertError
    await fetchBudgets(selectedMonth)
    toast.success('Last month\'s budget copied!')
  }

  // ── Presets ───────────────────────────────────────────────
  const fetchPresets = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) return
    setPresets(data || [])
  }, [user])

  const addPreset = async (presetData) => {
    const { data, error } = await supabase
      .from('presets')
      .insert({ ...presetData, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setPresets(prev => [data, ...prev])
    return data
  }

  const deletePreset = async (id) => {
    const { error } = await supabase.from('presets').delete().eq('id', id)
    if (error) throw error
    setPresets(prev => prev.filter(p => p.id !== id))
  }

  // ── Computed Stats ────────────────────────────────────────
  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0),
    totalExpenses: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0),
    activeEmiTotal: emis.filter(e => e.is_active).reduce((s, e) => s + parseFloat(e.monthly_amount), 0),
    get netSavings() { return this.totalIncome - this.totalExpenses },
  }

  // ── Load data on user change ──────────────────────────────
  useEffect(() => {
    if (user) {
      fetchTransactions()
      fetchEmis()
      fetchBudgets()
      fetchPresets()
    }
  }, [user])

  useEffect(() => {
    if (user) fetchTransactions(dateFilter, customDateRange)
  }, [dateFilter, customDateRange])

  useEffect(() => {
    if (user) fetchBudgets(selectedMonth)
  }, [selectedMonth])

  return (
    <AppContext.Provider value={{
      // Data
      transactions, emis, budgets, presets, stats,
      // Loading
      loadingTransactions, loadingEmis, loadingBudgets,
      // Filter state
      dateFilter, setDateFilter,
      customDateRange, setCustomDateRange,
      selectedMonth, setSelectedMonth,
      // Transaction actions
      addTransaction, updateTransaction, deleteTransaction,
      fetchTransactions,
      // EMI actions
      addEmi, updateEmi, deleteEmi, markEmiPaid,
      fetchEmis,
      // Budget actions
      upsertBudget, deleteBudget, cloneLastMonthBudget,
      fetchBudgets,
      // Preset actions
      addPreset, deletePreset, fetchPresets,
    }}>
      {children}
    </AppContext.Provider>
  )
}

import { useState } from 'react'
import { User, Wallet, Target, Shield, LogOut, ChevronRight, Download, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { CURRENCIES } from '../lib/constants'
import { exportToCSV } from '../lib/utils'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { profile, updateProfile, signOut, currency } = useAuth()
  const { transactions } = useApp()

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    monthly_income_target: profile?.monthly_income_target || '',
    currency: profile?.currency || '₹',
  })
  const [saving, setSaving] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile({
        full_name: profileForm.full_name,
        monthly_income_target: parseFloat(profileForm.monthly_income_target) || 0,
        currency: profileForm.currency,
      })
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    exportToCSV(transactions, currency)
    toast.success('Transactions exported!')
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {profileForm.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-slate-200 font-semibold">{profile?.full_name || 'User'}</p>
            <p className="text-slate-500 text-sm">{profile?.email}</p>
          </div>
        </div>

        <div>
          <label className="label">Full Name</label>
          <input
            value={profileForm.full_name}
            onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
            className="input"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="label">Monthly Income Target</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{profileForm.currency}</span>
            <input
              type="number"
              value={profileForm.monthly_income_target}
              onChange={e => setProfileForm(f => ({ ...f, monthly_income_target: e.target.value }))}
              className="input pl-8"
              placeholder="50000"
              min="0"
            />
          </div>
          <p className="text-slate-600 text-xs mt-1">Used for savings target calculation</p>
        </div>

        <div>
          <label className="label">Currency</label>
          <select
            value={profileForm.currency}
            onChange={e => setProfileForm(f => ({ ...f, currency: e.target.value }))}
            className="input"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.symbol}>{c.symbol} — {c.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="btn-primary w-full justify-center"
        >
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
        </button>
      </div>

      {/* Data Section */}
      <div className="card space-y-2">
        <h2 className="text-slate-200 font-semibold text-sm mb-1">Data & Export</h2>

        <button
          onClick={handleExport}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-slate-200 text-sm font-medium">Export Transactions</p>
              <p className="text-slate-500 text-xs">Download all {transactions.length} transactions as CSV</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
      </div>

      {/* Account Section */}
      <div className="card">
        <h2 className="text-slate-200 font-semibold text-sm mb-3">Account</h2>
        <button
          onClick={() => {
            if (window.confirm('Sign out?')) signOut()
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-900/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-red-400 text-sm font-medium">Sign Out</p>
              <p className="text-slate-500 text-xs">You'll need to sign in again</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
        </button>
      </div>

      {/* App Info */}
      <div className="text-center text-slate-600 text-xs py-2">
        FinanceFlow v1.0.0 • Built with ❤️ using React & Supabase
      </div>
    </div>
  )
}

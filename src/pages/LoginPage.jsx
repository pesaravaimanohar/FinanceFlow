import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Wallet, Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = { SIGNIN: 'signin', SIGNUP: 'signup', FORGOT: 'forgot' }

export default function LoginPage() {
  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const [tab, setTab] = useState(TABS.SIGNIN)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })

  if (user) return <Navigate to="/dashboard" replace />

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === TABS.SIGNIN) {
        await signIn(form.email, form.password)
        toast.success('Welcome back!')
      } else if (tab === TABS.SIGNUP) {
        await signUp(form.email, form.password, form.fullName)
        toast.success('Account created! Check your email to verify.')
      } else {
        await resetPassword(form.email)
        toast.success('Password reset email sent!')
        setTab(TABS.SIGNIN)
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error(err.message || 'Google sign in failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 border-r border-slate-800 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/60">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-100">FinanceFlow</span>
          </div>

          <h2 className="text-4xl font-bold text-slate-100 leading-tight mb-4">
            Take control of your<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              financial future.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Track expenses, manage EMIs, and plan budgets — all in one beautiful dashboard.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: '💡', text: 'Smart multi-tag expense tracking' },
            { icon: '📊', text: 'Visual analytics & spending insights' },
            { icon: '💳', text: 'EMI & loan management center' },
            { icon: '🎯', text: 'Monthly budget planner' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-400">
              <span className="text-lg">{f.icon}</span>
              <span className="text-sm">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-100">FinanceFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">
              {tab === TABS.SIGNIN && 'Welcome back'}
              {tab === TABS.SIGNUP && 'Create your account'}
              {tab === TABS.FORGOT && 'Reset your password'}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {tab === TABS.SIGNIN && "Sign in to manage your finances"}
              {tab === TABS.SIGNUP && "Start your financial journey today"}
              {tab === TABS.FORGOT && "We'll send you a reset link"}
            </p>
          </div>

          {/* Tab Switcher */}
          {tab !== TABS.FORGOT && (
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6">
              {[
                { key: TABS.SIGNIN, label: 'Sign In' },
                { key: TABS.SIGNUP, label: 'Sign Up' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    tab === key
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Google Auth */}
          {tab !== TABS.FORGOT && (
            <>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 text-sm font-medium transition-all duration-200 mb-4 active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-600 text-xs">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === TABS.SIGNUP && (
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input pl-9"
                    required={tab === TABS.SIGNUP}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-9"
                  required
                />
              </div>
            </div>

            {tab !== TABS.FORGOT && (
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={tab === TABS.SIGNUP ? 'Min. 6 characters' : '••••••••'}
                    className="input pl-9 pr-10"
                    required
                    minLength={tab === TABS.SIGNUP ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {tab === TABS.SIGNIN && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setTab(TABS.FORGOT)}
                  className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {tab === TABS.SIGNIN && 'Sign In'}
                  {tab === TABS.SIGNUP && 'Create Account'}
                  {tab === TABS.FORGOT && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {tab === TABS.FORGOT && (
              <button
                type="button"
                onClick={() => setTab(TABS.SIGNIN)}
                className="w-full text-slate-400 hover:text-slate-200 text-sm py-2 transition-colors"
              >
                ← Back to sign in
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

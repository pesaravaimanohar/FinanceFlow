import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import EMIPage from './pages/EMIPage'
import BudgetPage from './pages/BudgetPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import { isMissingConfig } from './lib/supabase'

function SetupBanner() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full card border-amber-800/60 bg-amber-900/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-xl">⚙️</div>
          <div>
            <h1 className="text-slate-100 font-bold">Setup Required</h1>
            <p className="text-amber-400 text-xs">Supabase credentials missing</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Create a <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">.env</code> file
          in the project root with your Supabase credentials:
        </p>
        <div className="bg-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 mb-4">
          VITE_SUPABASE_URL=https://your-project.supabase.co<br/>
          VITE_SUPABASE_ANON_KEY=your-anon-key
        </div>
        <p className="text-slate-500 text-xs">
          Get these from your <strong className="text-slate-400">Supabase Dashboard → Settings → API</strong>.
          Then restart the dev server with <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">npm run dev</code>.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (isMissingConfig) return <SetupBanner />

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/emi" element={<EMIPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

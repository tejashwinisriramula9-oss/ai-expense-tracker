import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="mt-3 text-sm text-slate-300">
              {this.state.errorMessage || 'A runtime error occurred while rendering the app.'}
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            {/* react-hot-toast — dark glassmorphism style, top-right */}
            <Toaster
              position="top-right"
              gutter={10}
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'rgba(15,23,42,0.92)',
                  color: '#f1f5f9',
                  border: '1px solid rgba(99,102,241,0.25)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '14px',
                  fontSize: '13px',
                  boxShadow: '0 0 20px rgba(99,102,241,0.12), 0 4px 24px rgba(0,0,0,0.4)',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: { primary: '#34d399', secondary: '#0f172a' },
                },
                error: {
                  iconTheme: { primary: '#fb7185', secondary: '#0f172a' },
                },
              }}
            />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

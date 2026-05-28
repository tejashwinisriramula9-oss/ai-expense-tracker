import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axiosConfig'

export default function ForgotPassword() {
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (err) {
      toast.error(err.userMessage || 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/90 p-10 backdrop-blur-xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-2xl">
          🔑
        </div>

        <h1 className="text-3xl font-semibold">Forgot password?</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your registered email and we'll send you a secure reset link.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-5">
            <p className="text-sm font-semibold text-emerald-300">✅ Reset link sent!</p>
            <p className="mt-1 text-xs text-slate-400">
              Check your inbox at <span className="text-white font-medium">{email}</span>.
              The link expires in 1 hour.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Didn't receive it?{' '}
              <button
                onClick={() => setSent(false)}
                className="text-indigo-400 hover:text-indigo-300 transition"
              >
                Try again
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm text-slate-300">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="your@email.com"
                className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-white outline-none transition focus:border-indigo-500"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-400 py-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Sending…
                </span>
              ) : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="text-slate-400 hover:text-white transition">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}

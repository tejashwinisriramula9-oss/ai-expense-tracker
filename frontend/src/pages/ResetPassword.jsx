import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axiosConfig'

export default function ResetPassword() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const token           = searchParams.get('token') || ''
  const email           = searchParams.get('email') || ''

  const [newPassword,    setNewPassword]    = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew,        setShowNew]        = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [done,           setDone]           = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (!token || !email) {
      toast.error('Invalid reset link. Please request a new one.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, token, newPassword })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      toast.error(err.userMessage || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-white outline-none transition focus:border-indigo-500 pr-14'

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-[2rem] border border-rose-500/30 bg-slate-900/90 p-10 text-center">
          <p className="text-2xl mb-3">⚠️</p>
          <h2 className="text-xl font-semibold">Invalid reset link</h2>
          <p className="mt-2 text-sm text-slate-400">This link is missing required parameters.</p>
          <Link to="/forgot-password" className="mt-5 inline-block text-sm text-indigo-400 hover:text-indigo-300">
            Request a new reset link →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/90 p-10 backdrop-blur-xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-2xl">
          🔒
        </div>

        <h1 className="text-3xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create a new password for <span className="text-white font-medium">{email}</span>.
        </p>

        {done ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-5">
            <p className="text-sm font-semibold text-emerald-300">✅ Password reset successfully!</p>
            <p className="mt-1 text-xs text-slate-400">Redirecting you to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* New password */}
            <label className="block">
              <span className="text-sm text-slate-300">New password</span>
              <div className="relative mt-3">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required minLength={6}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  className={inp}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition text-sm"
                >
                  {showNew ? '🙈' : '👁'}
                </button>
              </div>
            </label>

            {/* Confirm password */}
            <label className="block">
              <span className="text-sm text-slate-300">Confirm password</span>
              <div className="relative mt-3">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={inp}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition text-sm"
                >
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-400">Passwords do not match.</p>
              )}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-400 py-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Resetting…
                </span>
              ) : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-slate-400 hover:text-white transition">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}

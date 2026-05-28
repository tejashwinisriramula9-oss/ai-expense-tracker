import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axiosConfig'

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm ${className}`}>{children}</div>
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password
      const r = await api.put('/auth/profile', payload)
      updateUser(r.data.user || payload)
      toast.success('Profile updated successfully!')
      setEditing(false)
      setForm((s) => ({ ...s, password: '', confirmPassword: '' }))
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Update failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white outline-none placeholder-slate-500 focus:border-indigo-500 transition'

  return (
    <div className="flex justify-center py-4">
      <Card className="w-full max-w-md p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-2xl font-bold text-slate-950 select-none">
              {initials}
            </div>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        {!editing ? (
          <>
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between rounded-xl bg-slate-800/50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">Name</p>
                <p className="text-sm font-medium text-white">{user?.name}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-800/50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
                <p className="text-sm font-medium text-white">{user?.email}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-800/50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">Account</p>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">Active</span>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Name</label>
              <input className={inp} value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Email</label>
              <input type="email" className={inp} value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">New password <span className="text-slate-600">(leave blank to keep current)</span></label>
              <input type="password" className={inp} placeholder="••••••" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Confirm password</label>
              <input type="password" className={inp} placeholder="••••••" value={form.confirmPassword} onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))} />
            </div>
            {error && <p className="text-xs text-rose-300">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setEditing(false); setError('') }}
                className="flex-1 rounded-xl border border-white/10 bg-slate-800/60 py-2.5 text-sm text-slate-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 py-2.5 text-sm font-semibold text-slate-950 hover:brightness-110 transition disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

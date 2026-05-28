import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm ${className}`}>{children}</div>
}

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [email, setEmail] = useState(user?.email || '')

  useEffect(() => { setEmail(user?.email || '') }, [user])

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Appearance */}
      <Card>
        <div className="border-b border-white/5 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appearance</p>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-white">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            <p className="text-xs text-slate-500 mt-0.5">Switch the interface theme</p>
          </div>
          <Toggle enabled={theme === 'dark'} onToggle={toggleTheme} />
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="border-b border-white/5 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notifications</p>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-white">Budget alerts</p>
            <p className="text-xs text-slate-500 mt-0.5">Get notified when you're near a budget limit</p>
          </div>
          <Toggle enabled={notifications} onToggle={() => setNotifications((n) => !n)} />
        </div>
      </Card>

      {/* Account */}
      <Card>
        <div className="border-b border-white/5 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account</p>
        </div>
        <div className="space-y-3 p-5">
          <div className="rounded-xl bg-slate-800/50 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-1">Name</p>
            <p className="text-sm font-medium text-white">{user?.name}</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-1">Email</p>
            <p className="text-sm font-medium text-white">{email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-xl border border-rose-700/30 bg-rose-950/20 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-950/40 transition"
          >
            Sign out
          </button>
        </div>
      </Card>
    </div>
  )
}

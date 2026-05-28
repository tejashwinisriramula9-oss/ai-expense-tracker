import { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const navItems = [
  { label: 'Dashboard',    path: '/dashboard',    icon: '▦' },
  { label: 'Transactions', path: '/transactions', icon: '↕' },
  { label: 'Analytics',   path: '/analytics',    icon: '◈' },
  { label: 'Budget',      path: '/budget',        icon: '◎' },
  { label: 'Goals',       path: '/goals',         icon: '◆' },
  { label: 'Profile',     path: '/profile',       icon: '◉' },
  { label: 'Settings',    path: '/settings',      icon: '⚙' },
]

function getGreeting(name) {
  const h = new Date().getHours()
  if (h >= 5 && h < 12)  return { text: `Good Morning, ${name} 👋`, emoji: '☀️' }
  if (h >= 12 && h < 17) return { text: `Good Afternoon, ${name} 👋`, emoji: '🌤️' }
  return { text: `Good Evening, ${name} 👋`, emoji: '🌙' }
}

function SidebarContent({ onNavClick }) {
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-bold text-slate-950 shadow-[0_0_16px_rgba(99,102,241,0.4)]">
          AI
        </div>
        <div>
          <p className="text-xs font-semibold leading-none text-white">Expense Tracker</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Fintech Suite</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.18)]'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 hover:translate-x-0.5'
              }`
            }
          >
            <span className="w-4 text-center text-base leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-xs font-bold text-white uppercase">
            {user?.name?.[0] || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
            <p className="truncate text-[10px] text-slate-400">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 rounded-lg bg-slate-800 py-1.5 text-[11px] text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
          <button
            onClick={logout}
            className="flex-1 rounded-lg bg-rose-500/10 py-1.5 text-[11px] text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const greeting = getGreeting(user?.name?.split(' ')[0] || 'there')

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">

      {/* ── Desktop Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-white/5 bg-slate-900/90 backdrop-blur-xl md:flex">
        <SidebarContent onNavClick={undefined} />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-slate-900/95 backdrop-blur-xl md:hidden"
            >
              <SidebarContent onNavClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col md:pl-56">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-slate-950/80 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-800/60 text-slate-300 hover:text-white transition md:hidden"
              aria-label="Open menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <p className="text-sm font-medium text-slate-300">
              <span className="text-white">{greeting.text}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300">Live</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

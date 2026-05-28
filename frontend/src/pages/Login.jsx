import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Status phases shown during a cold-start wake sequence
const WAKE_PHASES = [
  { label: 'Connecting securely…',   duration: 6000  },
  { label: 'Server is waking up…',   duration: 8000  },
  { label: 'Almost ready…',          duration: 8000  },
  { label: 'Retrying request…',      duration: 99999 }, // stays until resolved
]

export default function Login() {
  const { login, authLoading } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // Wake-up UX state
  const [waking,      setWaking]      = useState(false)   // true while cold-start retry is running
  const [phaseIndex,  setPhaseIndex]  = useState(0)       // which WAKE_PHASES label to show
  const [countdown,   setCountdown]   = useState(0)       // seconds until next auto-retry
  const timerRef  = useRef(null)
  const phaseRef  = useRef(null)

  // Clean up timers on unmount
  useEffect(() => () => {
    clearTimeout(timerRef.current)
    clearInterval(phaseRef.current)
  }, [])

  const clearWake = () => {
    setWaking(false)
    setPhaseIndex(0)
    setCountdown(0)
    clearTimeout(timerRef.current)
    clearInterval(phaseRef.current)
  }

  // Advance through WAKE_PHASES labels while waiting
  const startPhaseAdvance = () => {
    let idx = 0
    phaseRef.current = setInterval(() => {
      idx = Math.min(idx + 1, WAKE_PHASES.length - 1)
      setPhaseIndex(idx)
    }, WAKE_PHASES[idx]?.duration ?? 6000)
  }

  // Countdown ticker (shows "Retrying in Xs")
  const startCountdown = (seconds, onDone) => {
    setCountdown(seconds)
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(tick); onDone(); return 0 }
        return c - 1
      })
    }, 1000)
    timerRef.current = tick
  }

  const attemptLogin = async () => {
    try {
      await login(email, password)
      clearWake()           // success — clean up
    } catch (err) {
      const isNetworkOrTimeout =
        err?.code === 'ECONNABORTED' ||
        err?.message === 'Network Error' ||
        err?.message?.includes('timeout') ||
        !err?.response

      if (isNetworkOrTimeout) {
        // Backend is sleeping — start wake-up UX and retry after 12 s
        setWaking(true)
        setPhaseIndex(0)
        startPhaseAdvance()
        startCountdown(12, async () => {
          clearInterval(phaseRef.current)
          setPhaseIndex(WAKE_PHASES.length - 1)   // "Retrying request…"
          await attemptLogin()                     // recursive retry
        })
      } else {
        // Real error (wrong password, etc.) — stop wake UX, toast already shown
        clearWake()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearWake()
    await attemptLogin()
  }

  const isDisabled = authLoading || waking

  const buttonContent = () => {
    if (authLoading && !waking) {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
          Signing in…
        </span>
      )
    }
    if (waking) {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
          {WAKE_PHASES[phaseIndex]?.label}
        </span>
      )
    }
    return 'Sign in'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-10 backdrop-blur-xl">
        <h1 className="text-4xl font-semibold">Sign in</h1>
        <p className="mt-3 text-slate-400">Access your AI expense dashboard and manage your finances.</p>

        {/* Cold-start notice — always visible, upgrades to live status when waking */}
        <div className={`mt-5 rounded-xl border px-4 py-3 transition-all duration-300
          ${waking
            ? 'border-amber-500/30 bg-amber-950/20'
            : 'border-sky-500/20 bg-sky-950/20'}`}>
          {waking ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-amber-400" />
                <p className="text-xs font-medium text-amber-300">
                  {WAKE_PHASES[phaseIndex]?.label}
                </p>
              </div>
              {countdown > 0 && (
                <p className="text-[11px] text-slate-400 pl-5">
                  Auto-retrying in <span className="font-semibold text-white">{countdown}s</span>
                  {' '}— free server takes ~30s to wake up
                </p>
              )}
              {/* Progress bar */}
              <div className="ml-5 h-1 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((30 - countdown) / 30) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-sky-300">
              ℹ️ First login may take up to 30 seconds while the server wakes up. Please be patient.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isDisabled}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isDisabled}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-400 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {buttonContent()}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          New to the platform?{' '}
          <Link to="/signup" className="font-semibold text-white hover:text-indigo-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

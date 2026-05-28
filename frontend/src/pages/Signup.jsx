import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const { register, authLoading } = useAuth()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    await register(name, email, password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-10 backdrop-blur-xl">
        <h1 className="text-4xl font-semibold">Create account</h1>
        <p className="mt-3 text-slate-400">Secure signup for your AI-enhanced finance workspace.</p>

        {/* Render cold-start notice */}
        <div className="mt-5 rounded-xl border border-sky-500/20 bg-sky-950/20 px-4 py-3">
          <p className="text-xs text-sky-300">
            ℹ️ First request may take up to 30 seconds while the server wakes up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-slate-300">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-white outline-none transition focus:border-indigo-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-white outline-none transition focus:border-indigo-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-white outline-none transition focus:border-indigo-500"
            />
          </label>
          <button
            type="submit"
            disabled={authLoading}
            className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-400 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {authLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-white hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axiosConfig'

const OTP_RESEND_COOLDOWN = 60 // seconds

export default function VerifyEmail() {
  const location = useLocation()
  const navigate  = useNavigate()

  // Email passed from signup via navigation state
  const [email,    setEmail]    = useState(location.state?.email || '')
  const [otp,      setOtp]      = useState(['', '', '', '', '', ''])
  const [loading,  setLoading]  = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef([])
  const timerRef  = useRef(null)

  // Start cooldown timer
  const startCooldown = () => {
    setCooldown(OTP_RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0 }
        return c - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  // Handle individual OTP digit input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) { toast.error('Enter the 6-digit OTP.'); return }
    if (!email) { toast.error('Email is required.'); return }

    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp: otpString })
      toast.success('Email verified! You can now sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.userMessage || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) { toast.error('Enter your email first.'); return }
    if (cooldown > 0) return
    setResending(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('New OTP sent to your email.')
      startCooldown()
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.userMessage || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/90 p-10 backdrop-blur-xl">
        {/* Icon */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-2xl">
          📧
        </div>

        <h1 className="text-3xl font-semibold">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-400">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-white">{email || 'your email'}</span>.
          Enter it below to activate your account.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          {/* Email field (editable if not pre-filled) */}
          {!location.state?.email && (
            <label className="block">
              <span className="text-sm text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                placeholder="your@email.com"
              />
            </label>
          )}

          {/* OTP boxes */}
          <div>
            <p className="mb-3 text-sm text-slate-300">Verification code</p>
            <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-14 w-12 rounded-xl border border-slate-700 bg-slate-950/90 text-center text-xl font-bold text-white outline-none transition focus:border-indigo-500 focus:shadow-[0_0_0_2px_rgba(99,102,241,0.3)]"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-400 py-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                Verifying…
              </span>
            ) : 'Verify Email'}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-5 text-center">
          <p className="text-sm text-slate-400">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="mt-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {resending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="text-slate-400 hover:text-white transition">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}

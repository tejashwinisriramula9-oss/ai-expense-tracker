import axios from 'axios'

// ---------------------------------------------------------------------------
// VITE_API_URL is set in Vercel → Project Settings → Environment Variables.
// It must be the full Render URL with NO trailing slash.
// e.g.  VITE_API_URL=https://ai-expense-tracker-api.onrender.com
// ---------------------------------------------------------------------------
const RAW_URL = import.meta.env.VITE_API_URL || ''
const API_BASE_URL = RAW_URL.replace(/\/+$/, '') || 'http://localhost:5000'

// Always log in production so Vercel function logs show the real URL being used
console.log('[API] base URL:', API_BASE_URL)

if (!import.meta.env.VITE_API_URL) {
  console.warn(
    '[API] ⚠️  VITE_API_URL is not set. ' +
    'Add it in Vercel → Project Settings → Environment Variables. ' +
    'Falling back to localhost — this will fail in production.',
  )
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  // 30-second timeout — handles Render free-tier cold start (can take ~20s)
  timeout: 30000,
})

// ── Request interceptor ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expense-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Log every request in all environments
    console.log(`[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor ──────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`[API ←] ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    const status  = error.response?.status
    const url     = error.config?.url ?? '?'
    const method  = error.config?.method?.toUpperCase() ?? '?'
    const message = error.response?.data?.message || error.message || 'Unknown error'

    // Detect Render cold-start timeout specifically
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
    const isNetwork = error.message === 'Network Error' || !error.response

    if (isTimeout) {
      console.error(`[API TIMEOUT] ${method} ${url} — backend may be waking up, please retry`)
      error.userMessage = 'Server is waking up — please wait a moment and try again.'
    } else if (isNetwork) {
      console.error(`[API NETWORK ERROR] ${method} ${url} — no response from server`)
      error.userMessage = 'Cannot reach the server. Check your connection and try again.'
    } else {
      console.error(`[API ERROR] ${status} ${method} ${url} — ${message}`)
      error.userMessage = message
    }

    return Promise.reject(error)
  },
)

export default api

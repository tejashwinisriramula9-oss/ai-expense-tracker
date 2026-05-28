import axios from 'axios'

// ─────────────────────────────────────────────────────────────
// VITE_API_URL must be set in Vercel → Project Settings → Environment Variables
// Value: https://your-service.onrender.com  (no trailing slash)
//
// If missing, the build falls back to localhost which WILL FAIL in production.
// ─────────────────────────────────────────────────────────────
const RAW_URL = import.meta.env.VITE_API_URL || ''
const API_BASE_URL = RAW_URL.replace(/\/+$/, '') || 'http://localhost:5000'

// Log the URL on every page load — visible in browser DevTools console
console.log('[API] base URL:', API_BASE_URL)
console.log('[API] env VITE_API_URL:', import.meta.env.VITE_API_URL || 'NOT SET — falling back to localhost')

if (!import.meta.env.VITE_API_URL) {
  console.error(
    '[API] ❌ VITE_API_URL is NOT set in Vercel environment variables.\n' +
    'Go to: Vercel → Project → Settings → Environment Variables\n' +
    'Add: VITE_API_URL = https://your-render-service.onrender.com\n' +
    'Then redeploy. Without this, ALL API calls will fail in production.'
  )
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 35000,  // 35s — Render free tier cold start can take ~25s
})

// ── Request interceptor ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expense-token')
    if (token) config.headers.Authorization = `Bearer ${token}`
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
    const backendMsg = error.response?.data?.message

    // Classify the error precisely
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
    const isNetwork = !error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')

    if (isTimeout) {
      console.error(`[API TIMEOUT] ${method} ${url} — took >35s, backend cold-starting`)
      error.userMessage = 'Server is waking up — please wait a moment and try again.'
      error.isWakeUp = true
    } else if (isNetwork) {
      // Network error in production almost always means VITE_API_URL is wrong
      const isLocalhost = API_BASE_URL.includes('localhost')
      console.error(`[API NETWORK ERROR] ${method} ${url}`)
      console.error(`[API] baseURL = ${API_BASE_URL}`)
      if (isLocalhost) {
        console.error('[API] ❌ Calling localhost in production! Set VITE_API_URL in Vercel.')
        error.userMessage = 'Configuration error: API URL not set. Contact support.'
      } else {
        console.error('[API] Backend unreachable — CORS issue or backend down')
        error.userMessage = 'Cannot reach the server. Please try again.'
      }
      error.isWakeUp = false
    } else {
      // Real HTTP error — use backend message directly
      console.error(`[API ERROR] ${status} ${method} ${url} — ${backendMsg || error.message}`)
      error.userMessage = backendMsg || error.message || 'Something went wrong.'
      error.isWakeUp = false
    }

    return Promise.reject(error)
  },
)

export default api

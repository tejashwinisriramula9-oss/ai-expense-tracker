import axios from 'axios'

// VITE_API_URL must be set in Vercel environment variables.
// Locally it reads from frontend/.env
// It must NOT contain a trailing slash.
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

if (import.meta.env.DEV) {
  console.log('[axiosConfig] API base URL:', API_BASE_URL)
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials not needed — we use Bearer tokens, not cookies
  withCredentials: false,
})

// ── Request interceptor: attach JWT + log in dev ──────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expense-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (import.meta.env.DEV) {
      console.log(`[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: surface backend error messages ──────
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API ←] ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    const status  = error.response?.status
    const url     = error.config?.url
    const message = error.response?.data?.message || error.message

    // Always log errors so they appear in Vercel/browser console
    console.error(`[API ERROR] ${status ?? 'NETWORK'} ${url} — ${message}`)

    // Attach a clean message so callers can use error.userMessage
    error.userMessage = message
    return Promise.reject(error)
  },
)

export default api

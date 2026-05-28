import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// If React fails to mount for any reason, show a fallback instead of a blank page.
const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element (#root) not found')
}

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

try {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('React mount failed:', error)
  rootEl.innerHTML = `
    <div style="padding:24px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; color: #fff; background: #0f172a; min-height: 100vh;">
      <h1 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Frontend failed to load</h1>
      <p style="opacity: 0.85; margin-bottom: 0;">Check browser console for details.</p>
    </div>
  `
}

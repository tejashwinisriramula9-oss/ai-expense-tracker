import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('expense-theme') || 'dark')

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
    localStorage.setItem('expense-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  const value = useMemo(() => ({ theme, toggleTheme }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}

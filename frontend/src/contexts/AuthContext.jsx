import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate  = useNavigate()
  const savedToken = localStorage.getItem('expense-token') || ''

  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(savedToken)
  const [loading, setLoading] = useState(!!savedToken)
  const [authLoading, setAuthLoading] = useState(false)

  // On mount: if we have a saved token, restore the auth header and fetch profile
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      fetchProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount only

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data)
    } catch (error) {
      console.error('[AuthContext] fetchProfile failed:', error.userMessage || error.message)
      // Token is invalid/expired — clear it
      clearAuth()
    } finally {
      // Always stop the initial loading spinner
      setLoading(false)
    }
  }

  const clearAuth = () => {
    localStorage.removeItem('expense-token')
    delete api.defaults.headers.common.Authorization
    setUser(null)
    setToken('')
  }

  const login = async (email, password) => {
    setAuthLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      const accessToken = response.data.token
      localStorage.setItem('expense-token', accessToken)
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
      setToken(accessToken)
      setUser(response.data.user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.userMessage || 'Login failed')
      throw error  // re-throw so Login.jsx can check error.isWakeUp
    } finally {
      setAuthLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setAuthLoading(true)
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const accessToken = response.data.token
      localStorage.setItem('expense-token', accessToken)
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
      setToken(accessToken)
      setUser(response.data.user)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.userMessage || 'Registration failed')
      throw error  // re-throw so Signup.jsx can check error.isWakeUp
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    clearAuth()
    toast.success('Signed out.')
    navigate('/login')
  }

  const updateUser = (updatedUser) => setUser((prev) => ({ ...prev, ...updatedUser }))

  const value = useMemo(
    () => ({ user, token, loading, authLoading, login, register, logout, updateUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, loading, authLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

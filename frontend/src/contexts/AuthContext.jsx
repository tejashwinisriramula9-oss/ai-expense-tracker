import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('expense-token') || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      fetchProfile()
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data)
    } catch (error) {
      console.error(error)
      logout()
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      const accessToken = response.data.token
      localStorage.setItem('expense-token', accessToken)
      setToken(accessToken)
      setUser(response.data.user)
      navigate('/dashboard')
      toast.success('Welcome back!')
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password })
      toast.success('Account created successfully. Please login.')
      navigate('/login')
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('expense-token')
    delete api.defaults.headers.common.Authorization
    setUser(null)
    setToken('')
    navigate('/login')
  }

  const updateUser = (updatedUser) => setUser((prev) => ({ ...prev, ...updatedUser }))

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, updateUser }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

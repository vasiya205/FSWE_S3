import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('homeTutorUser')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('homeTutorToken'))

  useEffect(() => {
    if (user) {
      localStorage.setItem('homeTutorUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('homeTutorUser')
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('homeTutorToken', token)
    } else {
      localStorage.removeItem('homeTutorToken')
    }
  }, [token])

  const value = useMemo(() => ({
    user,
    token,
    setUser,
    setToken,
    isAuthenticated: Boolean(token),
    getAuthHeaders: () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    logout: () => {
      setUser(null)
      setToken(null)
    },
    login: async (email, password) => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      setToken(data.token)
      setUser({ id: data.userId, fullName: data.fullName, email: data.email, role: data.role })
      return data
    },
    register: async (fullName, email, password, role) => {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      setToken(data.token)
      setUser({ id: data.userId, fullName: data.fullName, email: data.email, role: data.role })
      return data
    },
  }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

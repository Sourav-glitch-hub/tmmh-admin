// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin]   = useState(null)
  const [token, setToken]   = useState(() => localStorage.getItem('admin_token') || null)
  const [loading, setLoading] = useState(true)

  // On mount — restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin_user')
    if (saved && token) {
      try { setAdmin(JSON.parse(saved)) } catch { logout() }
    }
    setLoading(false)
  }, [])

  const login = (userData, jwt) => {
    setAdmin(userData)
    setToken(jwt)
    localStorage.setItem('admin_token', jwt)
    localStorage.setItem('admin_user', JSON.stringify(userData))
  }

  const logout = () => {
    setAdmin(null)
    setToken(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
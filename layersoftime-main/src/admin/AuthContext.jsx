import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { api } from './api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Wraps every /admin route. Loads the current session once.
export default function AuthProvider() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      <Outlet />
    </AuthContext.Provider>
  )
}

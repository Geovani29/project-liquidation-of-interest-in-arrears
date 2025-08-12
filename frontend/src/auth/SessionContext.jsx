import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi } from '../api/auth'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken'))
  const [refreshToken, setRefreshToken] = useState(() => sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken'))
  const [remember, setRemember] = useState(() => (localStorage.getItem('auth_storage') || 'local') === 'local')
  const [user, setUser] = useState(null) // opcional: payload verificado

  useEffect(() => {
    const storage = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    if (accessToken) storage.setItem('accessToken', accessToken)
    else {
      storage.removeItem('accessToken')
      other.removeItem('accessToken')
    }
  }, [accessToken])

  useEffect(() => {
    const storage = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    if (refreshToken) storage.setItem('refreshToken', refreshToken)
    else {
      storage.removeItem('refreshToken')
      other.removeItem('refreshToken')
    }
  }, [refreshToken])

  useEffect(() => {
    localStorage.setItem('auth_storage', remember ? 'local' : 'session')
  }, [remember])

  const login = async (email, password) => {
    const tokens = await loginApi(email, password)
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ accessToken, refreshToken, user, login, logout, remember, setRemember }), [accessToken, refreshToken, user, remember])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
  return ctx
}



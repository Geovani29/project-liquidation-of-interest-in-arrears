import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi } from '../api/auth'
import { getSupabaseUserId } from '../api/supabase'
import { calculationsService } from '../services/calculations'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken'))
  const [refreshToken, setRefreshToken] = useState(() => sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken'))
  const [remember, setRemember] = useState(() => (localStorage.getItem('auth_storage') || 'local') === 'local')
  const [user, setUser] = useState(null) // información del usuario de Supabase
  const [supabaseUserId, setSupabaseUserId] = useState(null) // ID de usuario en Supabase

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
    
    // Obtener/crear usuario en Supabase usando el email
    // El roble_user_id podría venir en tokens.user, por ahora usamos email como identificador
    try {
      const supUserId = await getSupabaseUserId(email, email) // usamos email como roble_user_id por ahora
      setSupabaseUserId(supUserId)
      setUser({ email, id: supUserId })
      
      // Configurar el servicio de cálculos con el usuario
      calculationsService.setUser(supUserId)
      
      // Migrar datos existentes si los hay
      await calculationsService.migrateExistingData()
    } catch (error) {
      console.error('Error creating/getting Supabase user:', error)
      // No falla el login si Supabase falla, solo log el error
    }
  }

  const logout = async () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    setSupabaseUserId(null)
    
    try {
      // Limpiar datos usando el servicio de cálculos
      await calculationsService.clearAll()
      
      // Resetear el servicio
      calculationsService.setUser(null)
    } catch (error) {
      console.error('Error during logout cleanup:', error)
    }
  }

  const value = useMemo(() => ({ 
    accessToken, 
    refreshToken, 
    user, 
    supabaseUserId, 
    login, 
    logout, 
    remember, 
    setRemember 
  }), [accessToken, refreshToken, user, supabaseUserId, remember])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
  return ctx
}



import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export const api = axios.create({
  baseURL: API_BASE,
})

function getAccessToken() {
  return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken')
}

function getRefreshToken() {
  return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken')
}

function getPreferredStorage() {
  const pref = localStorage.getItem('auth_storage')
  return pref === 'session' ? sessionStorage : localStorage
}

// Inyectar token si existe
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Refresh token automático básico
let refreshing = false
let queue = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {}
    if (response && response.status === 401 && !config.__isRetry) {
      if (refreshing) {
        await new Promise((resolve) => queue.push(resolve))
      } else {
        refreshing = true
        try {
          const refreshToken = getRefreshToken()
          if (!refreshToken) throw error
          const dbName = import.meta.env.VITE_ROBLE_DB || 'token_contract_xyz'
          const { data } = await axios.post(`https://roble-api.openlab.uninorte.edu.co/auth/${dbName}/refresh-token`, { refreshToken })
          const storage = getPreferredStorage()
          storage.setItem('accessToken', data.accessToken)
        } finally {
          refreshing = false
          queue.forEach((fn) => fn())
          queue = []
        }
      }
      config.__isRetry = true
      return api(config)
    }
    return Promise.reject(error)
  }
)



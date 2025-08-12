import axios from 'axios'

export async function login(email, password) {
  // Proxy interno al backend para centralizar políticas
  const { data } = await axios.post('/api/auth/login', { email, password })
  return data
}



import { useState } from 'react'
import { useSession } from '../auth/SessionContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Login() {
  const { login, remember, setRemember } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Has iniciado sesión correctamente')
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error de autenticación'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-900 px-6">
      <form onSubmit={onSubmit} className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-3xl p-10 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-md">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-zinc-800 dark:text-zinc-100">Iniciar sesión</h1>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300">Correo</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-5 py-3.5 text-lg" placeholder="usuario@correo.com" />
        <label className="block text-sm mt-4 text-zinc-600 dark:text-zinc-300">Contraseña</label>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-5 py-3.5 text-lg" placeholder="••••••••" />
        <div className="mt-3 text-sm">
          <Link to="/forgot-password" className="text-violet-600 hover:text-violet-700">¿Olvidaste tu contraseña?</Link>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input id="remember" type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500" />
          <label htmlFor="remember" className="text-sm text-zinc-700 dark:text-zinc-300 select-none">Recordarme</label>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <button disabled={loading} type="submit" className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3.5 text-lg shadow-md hover:from-violet-600/90 hover:to-indigo-600/90 active:scale-[.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Ingresando...' : 'Ingresar'}</button>
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          ¿No tienes cuenta? <Link to="/signup" className="text-violet-600 hover:text-violet-700">Regístrate</Link>
        </div>
      </form>
    </div>
  )
}



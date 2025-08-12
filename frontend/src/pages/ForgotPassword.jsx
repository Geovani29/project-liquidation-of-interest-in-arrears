import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(''); setOk(''); setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email })
      const msg = 'Hemos enviado instrucciones a tu correo si existe en el sistema.'
      setOk(msg)
      toast.success(msg)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al solicitar recuperación'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-xl bg-white dark:bg-zinc-800 rounded-3xl p-8 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-md">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-zinc-800 dark:text-zinc-100">Recuperar contraseña</h1>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300">Correo</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-base" placeholder="usuario@correo.com" />
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        {ok && <p className="text-sm text-green-600 mt-3">{ok}</p>}
        <button disabled={loading} type="submit" className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 text-base shadow-sm hover:from-violet-600/90 hover:to-indigo-600/90 active:scale-[.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Enviando...' : 'Enviar instrucciones'}</button>
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          <Link to="/login" className="text-violet-600 hover:text-violet-700">Volver a iniciar sesión</Link>
        </div>
      </form>
    </div>
  )
}



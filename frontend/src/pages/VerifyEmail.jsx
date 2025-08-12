import { useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const initialEmail = params.get('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(''); setOk(''); setLoading(true)
    try {
      await axios.post('/api/auth/verify-email', { email, code })
      const msg = 'Correo verificado. Ya puedes iniciar sesión.'
      setOk(msg)
      toast.success(msg)
      setTimeout(()=> navigate('/login'), 1200)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al verificar código'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-xl bg-white dark:bg-zinc-800 rounded-3xl p-8 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-md">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-zinc-800 dark:text-zinc-100">Verificar correo</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">Hemos enviado un código a tu correo. Ingrésalo para activar tu cuenta.</p>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300">Correo</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-base" placeholder="usuario@correo.com" />
        <label className="block text-sm mt-4 text-zinc-600 dark:text-zinc-300">Código</label>
        <input value={code} onChange={(e)=>setCode(e.target.value)} className="mt-1 w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-base" placeholder="123456" />
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        {ok && <p className="text-sm text-green-600 mt-3">{ok}</p>}
        <button disabled={loading} type="submit" className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 text-base shadow-sm hover:from-violet-600/90 hover:to-indigo-600/90 active:scale-[.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Verificando...' : 'Verificar'}</button>
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          <Link to="/login" className="text-violet-600 hover:text-violet-700">Volver a iniciar sesión</Link>
        </div>
      </form>
    </div>
  )
}



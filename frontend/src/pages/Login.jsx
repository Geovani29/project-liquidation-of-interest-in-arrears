import { useState } from 'react'
import { useSession } from '../auth/SessionContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Login() {
  const { login, remember, setRemember } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
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
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-xl bg-white dark:bg-zinc-800 rounded-3xl p-8 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-md">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-zinc-800 dark:text-zinc-100">Iniciar sesión</h1>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300">Correo</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-base" placeholder="usuario@correo.com" />
        <label className="block text-sm mt-4 text-zinc-600 dark:text-zinc-300">Contraseña</label>
        <div className="mt-1 relative">
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type={show ? 'text' : 'password'} className="peer w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-base pr-12 relative z-0" placeholder="••••••••" />
          <button type="button" onClick={()=>setShow(s=>!s)} className="absolute inset-y-0 right-3 my-auto h-8 w-8 grid place-items-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-100 z-10 pointer-events-auto" aria-label="Mostrar u ocultar contraseña">
            {show ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l3.75-4.5a1.65 1.65 0 012.32-.512l.529.432a1.65 1.65 0 002.32-.512l3.75-4.5a1.65 1.65 0 012.32-.512l.529.432a1.65 1.65 0 002.32-.512l3.75-4.5a1.65 1.65 0 012.32-.512l.333.274a1.65 1.65 0 010 1.18l-3.75 4.5a1.65 1.65 0 01-2.32.512l-.529-.432a1.65 1.65 0 00-2.32.512l-3.75 4.5a1.65 1.65 0 01-2.32.512l-.529-.432a1.65 1.65 0 00-2.32.512l-3.75 4.5a1.65 1.65 0 01-2.32.512l-.333-.274z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.18l-3.75-4.5a1.65 1.65 0 00-2.32-.512l-.529.432a1.65 1.65 0 01-2.32-.512l-2.096-2.516-1.12-1.344L3.28 2.22zM10 12.5a2.5 2.5 0 01-2.5-2.5 1.65 1.65 0 01-1.512-2.32l-1.25-1.5a4 4 0 00-4.012 5.32l-3.095 3.712a1.65 1.65 0 000 1.18l3.75 4.5a1.65 1.65 0 002.32.512l.529-.432a1.65 1.65 0 012.32.512l3.75 4.5a1.65 1.65 0 002.32.512l.529-.432a1.65 1.65 0 012.32.512l1.344 1.12 2.516 2.096a.75.75 0 101.06-1.06l-14.5-14.5zM10 6.5a2.5 2.5 0 00-2.5 2.5 1.65 1.65 0 001.512 2.32l1.25 1.5a4 4 0 014.012-5.32l3.095-3.712a1.65 1.65 0 000-1.18l-3.75-4.5a1.65 1.65 0 00-2.32-.512l-.529.432a1.65 1.65 0 01-2.32-.512l-3.75-4.5a1.65 1.65 0 00-2.32-.512l-.529.432a1.65 1.65 0 01-2.32.512L1.39 3.173a.75.75 0 00-1.06 1.06l1.745 1.745a10.029 10.029 0 00-3.3 4.38 1.651 1.651 0 000 1.18l3.75 4.5a1.65 1.65 0 002.32.512l.529-.432a1.65 1.65 0 012.32.512l2.096 2.516 1.12 1.344L16.72 17.78a.75.75 0 001.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.18l-3.75-4.5a1.65 1.65 0 00-2.32-.512l-.529.432a1.65 1.65 0 01-2.32-.512l-2.096-2.516-1.12-1.344L3.28 2.22z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <div className="mt-3 text-sm">
          <Link to="/forgot-password" className="text-violet-600 hover:text-violet-700">¿Olvidaste tu contraseña?</Link>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input id="remember" type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500" />
          <label htmlFor="remember" className="text-sm text-zinc-700 dark:text-zinc-300 select-none">Recordarme</label>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <button disabled={loading} type="submit" className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 text-base shadow-md hover:from-violet-600/90 hover:to-indigo-600/90 active:scale-[.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Ingresando...' : 'Ingresar'}</button>
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          ¿No tienes cuenta? <Link to="/signup" className="text-violet-600 hover:text-violet-700">Regístrate</Link>
        </div>
      </form>
    </div>
  )
}



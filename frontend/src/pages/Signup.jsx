import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(''); setOk(''); setLoading(true)
    try {
      await axios.post('/api/auth/signup', { name, email, password })
      const successMsg = 'Registro exitoso. Revisa tu correo para verificar la cuenta.'
      setOk(successMsg)
      toast.success(successMsg)
      // Redirigir a verificación
      setTimeout(()=>{ navigate(`/verify-email?email=${encodeURIComponent(email)}`) }, 1000)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al registrar'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-xl bg-white dark:bg-zinc-800 rounded-3xl p-8 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-md">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-zinc-800 dark:text-zinc-100">Crear cuenta</h1>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300">Nombre completo</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-base" placeholder="Nombre Apellido" />
        <label className="block text-sm mt-4 text-zinc-600 dark:text-zinc-300">Correo</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-base" placeholder="nombre@uninorte.edu.co" />
        <label className="block text-sm mt-4 text-zinc-600 dark:text-zinc-300">Contraseña</label>
        <div className="mt-1 relative">
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type={show ? 'text' : 'password'} className="peer w-full rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-base pr-12" placeholder="••••••••" />
          <button type="button" onClick={()=>setShow(s=>!s)} className="absolute inset-y-0 right-3 my-auto h-8 w-8 grid place-items-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-100 z-10 pointer-events-auto" aria-label="Mostrar u ocultar contraseña">
            {show ? (
              <svg viewBox="0 0 512 512" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M2404 4080 c-846 -49 -1644 -502 -2280 -1294 -166 -207 -166 -244 1 -453 635 -793 1436 -1245 2286 -1292 961 -52 1870 402 2585 1293 166 207 166 244 -1 453 -464 579 -1016 977 -1626 1172 -190 61 -419 105 -599 116 -196 11 -238 12 -366 5z m368 -466 c287 -54 563 -250 713 -505 180 -308 199 -680 51 -995 -58 -123 -114 -203 -209 -301 -535 -551 -1446 -383 -1756 324 -112 255 -114 567 -5 833 105 259 334 485 595 588 198 78 396 96 611 56z"/>
                <path d="M2455 3130 c-163 -35 -307 -136 -389 -274 -61 -101 -81 -176 -80 -296 0 -116 11 -163 57 -260 43 -89 167 -213 258 -257 321 -155 694 3 810 342 33 97 34 249 2 350 -73 231 -285 392 -528 401 -49 2 -108 -1 -130 -6z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 512 512" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M382 4627 c-78 -78 -142 -147 -142 -152 0 -6 141 -151 314 -324 l314 -314 -92 -77 c-300 -254 -561 -602 -723 -964 l-54 -119 42 -96 c244 -556 664 -1014 1204 -1313 587 -324 1317 -420 1970 -257 87 22 321 96 345 110 11 6 108 -85 405 -381 l390 -390 148 148 147 147 -2063 2063 -2062 2062 -143 -143z m1320 -1624 l176 -178 -10 -65 c-19 -128 3 -250 67 -385 87 -180 229 -304 420 -366 59 -19 92 -23 218 -24 l147 0 175 -175 175 -174 -78 -32 c-275 -114 -582 -117 -859 -9 -374 147 -650 487 -719 886 -24 139 -15 342 20 473 25 94 76 226 86 226 3 0 85 -80 182 -177z"/>
                <path d="M2265 4405 c-160 -18 -344 -56 -490 -101 -66 -20 -123 -40 -127 -43 -4 -4 104 -118 241 -255 l248 -248 84 27 c282 89 574 67 845 -65 400 -194 654 -598 654 -1041 0 -122 -20 -251 -55 -353 l-24 -71 337 -337 c185 -186 342 -338 349 -338 20 0 292 277 374 380 153 192 283 407 382 630 l38 86 -45 101 c-92 207 -229 433 -372 613 -92 116 -328 350 -444 439 -394 306 -818 488 -1302 562 -175 27 -524 34 -693 14z"/>
                <path d="M2885 3010 c198 -198 364 -360 369 -360 9 0 2 93 -15 180 -14 73 -78 208 -129 273 -124 159 -335 267 -519 267 l-66 0 360 -360z"/>
              </svg>
            )}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        {ok && <p className="text-sm text-green-600 mt-3">{ok}</p>}
        <button disabled={loading} type="submit" className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 text-base shadow-sm hover:from-violet-600/90 hover:to-indigo-600/90 active:scale-[.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Registrando...' : 'Registrarme'}</button>
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          ¿Ya tienes cuenta? <Link to="/login" className="text-violet-600 hover:text-violet-700">Inicia sesión</Link>
        </div>
      </form>
    </div>
  )
}



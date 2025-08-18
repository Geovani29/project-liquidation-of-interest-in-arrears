import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import LogoK from '../assets/K.svg'
import IconIntereses from '../assets/intereses.svg'
import { useSession } from '../auth/SessionContext'
import { toast } from 'sonner'

export default function Home() {
  const { accessToken, logout } = useSession()
  const navigate = useNavigate()
  const [openAuth, setOpenAuth] = useState(false)
  const authRef = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!openAuth) return
      if (authRef.current && !authRef.current.contains(e.target)) {
        setOpenAuth(false)
      }
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpenAuth(false) }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [openAuth])

  const goToInteres = () => {
    if (!accessToken) {
      navigate('/login?redirect=/app/c')
      return
    }
    navigate('/app/c')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-white grid place-items-center ring-1 ring-violet-300 cursor-pointer">
              <img src={LogoK} alt="Kaplo" className="h-6 w-6" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">Kaplo</span>
          </div>
          <div className="relative flex items-center gap-2" ref={authRef}>
            {!accessToken ? (
              <div className="relative">
                <button onClick={()=>setOpenAuth(o=>!o)} className="px-3 py-1.5 text-sm rounded-xl bg-violet-600 text-white hover:bg-violet-700 cursor-pointer">Acceder</button>
                {openAuth && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-lg overflow-hidden z-30">
                    <Link to="/login?redirect=/" onClick={()=>setOpenAuth(false)} className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer">Iniciar sesión</Link>
                    <Link to="/signup?redirect=/" onClick={()=>setOpenAuth(false)} className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer">Crear cuenta</Link>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={()=>{ logout(); toast.success('Sesión cerrada'); navigate('/') }} className="px-3 py-1.5 text-sm rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer">Cerrar sesión</button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-zinc-900 dark:text-zinc-100 text-center">Servicios financieros</h1>
        <p className="mt-3 text-center text-zinc-600 dark:text-zinc-300">Calcula y compara diferentes aspectos financieros</p>

        <div className="mt-6 flex justify-center gap-3">
          <button className="px-5 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 cursor-pointer">Explorar servicios</button>
          <button className="px-5 py-2 rounded-xl ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">Cómo funciona</button>
        </div>

        <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <button onClick={goToInteres} className="text-left rounded-2xl bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 p-4 hover:shadow-sm transition cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-xl bg-violet-100 text-violet-700 grid place-items-center">
                <img src={IconIntereses} alt="Interés en Mora" className="h-5 w-5" />
              </span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">Interés en Mora</div>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Calcula el interés por pagos en mora</p>
            {!accessToken && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-1 text-xs">
                <span>🔒</span> Requiere inicio de sesión
              </div>
            )}
          </button>

          {Array.from({length:5}).map((_,i)=> (
            <div key={i} className="rounded-2xl bg-white dark:bg-zinc-800 ring-1 ring-dashed ring-zinc-300 dark:ring-zinc-700 p-4 text-zinc-400 dark:text-zinc-500 flex items-center justify-center cursor-pointer">
              Próximamente
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}



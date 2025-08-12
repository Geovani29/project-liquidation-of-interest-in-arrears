import { useEffect, useState } from 'react'
import { useSession } from '../auth/SessionContext'
import { api } from '../api/client'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const DATE_FMT = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

function validateDate(value) {
  return DATE_FMT.test(value)
}

function currency(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)
}

function toIsoFromDisplay(display) {
  const m = DATE_FMT.exec(display || '')
  if (!m) return ''
  const [_, dd, mm, yyyy] = m
  const pad = (s) => s.toString().padStart(2, '0')
  return `${yyyy}-${pad(mm)}-${pad(dd)}`
}

function fromIsoToDisplay(iso) {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length !== 3) return ''
  const [yyyy, mm, dd] = parts
  return `${dd}/${mm}/${yyyy}`
}

function DatePicker({ valueDisplay, onChange, className }) {
  const empty = !valueDisplay
  const handleFocus = (e) => {
    e.target.type = 'date'
    e.target.value = toIsoFromDisplay(valueDisplay)
  }
  const handleBlur = (e) => {
    if (!e.target.value) {
      e.target.type = 'text'
      e.target.value = ''
    }
  }
  const handleChange = (e) => {
    onChange(fromIsoToDisplay(e.target.value))
  }
  return (
    <input
      type={empty ? 'text' : 'date'}
      placeholder={empty ? 'dd/mm/aaaa' : undefined}
      value={empty ? '' : toIsoFromDisplay(valueDisplay)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      className={className}
    />
  )
}

export default function Calculator() {
  const { logout } = useSession()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fechaInicial: '',
    fechaCorte: '',
    capitalBase: '',
    tasaMensual: '3',
    fechaVencimiento: '',
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark') { setDark(true); return }
    } catch {}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(prefersDark)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const validateBusinessRules = () => {
    if (!validateDate(form.fechaInicial) || !validateDate(form.fechaCorte)) {
      return 'Fechas en formato dd/mm/aaaa'
    }
    const [d1, m1, y1] = form.fechaInicial.split('/').map(Number)
    const [d2, m2, y2] = form.fechaCorte.split('/').map(Number)
    const start = new Date(y1, m1 - 1, d1)
    const end = new Date(y2, m2 - 1, d2)
    if (start > end) return 'La fecha inicial no puede ser mayor que la de corte'
    if (!form.capitalBase || isNaN(Number(form.capitalBase)) || Number(form.capitalBase) <= 0) {
      return 'Capital base inválido (> 0)'
    }
    if (!form.tasaMensual || isNaN(Number(form.tasaMensual)) || Number(form.tasaMensual) < 0) {
      return 'Tasa mensual inválida (>= 0)'
    }
    if (form.fechaVencimiento) {
      if (!validateDate(form.fechaVencimiento)) return 'Fecha de vencimiento inválida'
      const [dv, mv, yv] = form.fechaVencimiento.split('/').map(Number)
      const venc = new Date(yv, mv - 1, dv)
      if (!(start < venc && venc <= end)) return 'El vencimiento debe estar entre inicial (exclusivo) y corte (inclusive)'
    }
    return ''
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const err = validateBusinessRules()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      const { data } = await api.post('/api/calculate', {
        ...form,
        capitalBase: Number(form.capitalBase),
        tasaMensual: Number(form.tasaMensual),
        fechaVencimiento: form.fechaVencimiento || null,
      })
      setData(data)
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Error del servidor')
    } finally {
      setLoading(false)
    }
  }

  const exportExcel = async () => {
    setLoading(true)
    try {
      const res = await api.post('/api/export', {
        ...form,
        capitalBase: Number(form.capitalBase),
        tasaMensual: Number(form.tasaMensual),
        fechaVencimiento: form.fechaVencimiento || null,
      }, { responseType: 'blob' })
      const blob = res.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disp = res.headers['content-disposition'] || ''
      const match = /filename="?([^";]+)"?/i.exec(disp)
      a.download = match ? match[1] : 'liquidacion.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex">
        <aside className={`m-4 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
          <div className="relative">
            <div className="p-4 flex items-center gap-3">
              {!sidebarCollapsed && <div className="h-6 w-6" />}
            </div>
            <button onClick={() => setSidebarCollapsed((c) => !c)} className={`absolute top-3 ${sidebarCollapsed ? 'right-3' : 'right-3'} h-7 w-7 grid place-items-center rounded-full bg-violet-600 text-white text-sm shadow-md hover:bg-violet-700 transition`} aria-label="Alternar sidebar">
              {sidebarCollapsed ? '›' : '‹'}
            </button>
          </div>

          <nav className="px-2 space-y-1">
            <a className={`flex items-center gap-3 rounded-xl mx-2 ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2 bg-violet-600 text-white`}>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">📊</span>
              {!sidebarCollapsed && <span>Liquidación intereses en mora</span>}
            </a>
          </nav>

          <div className="mt-auto p-3">
            <button
              onClick={() => { logout(); toast.success('Sesión cerrada'); navigate('/login') }}
              className={`w-full mb-2 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-3'} gap-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-[.99] transition shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400/60`}
              aria-label="Cerrar sesión"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200">
                <svg viewBox="0 0 512 512" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <g transform="translate(0,512) scale(0.1,-0.1)">
                    <path d="M1200 4675 c-383 -78 -682 -380 -756 -763 -21 -109 -21 -2594 0 -2704 69 -356 322 -634 681 -745 l90 -28 755 0 755 0 95 33 c141 49 231 104 330 202 100 99 158 183 201 295 49 126 59 191 59 393 0 143 -3 191 -15 220 -71 169 -319 169 -390 0 -11 -27 -15 -73 -15 -170 0 -164 -11 -232 -49 -314 -57 -123 -181 -213 -323 -235 -40 -6 -307 -9 -694 -7 -574 3 -634 5 -684 22 -181 59 -311 191 -367 371 -17 57 -18 125 -18 1315 0 1190 1 1258 18 1315 56 181 184 311 367 371 50 17 109 19 684 22 387 2 654 -1 694 -7 142 -22 266 -112 323 -235 38 -82 49 -150 49 -314 0 -97 4 -143 15 -170 64 -152 273 -172 370 -34 l30 44 3 192 c4 214 -5 278 -57 411 -43 112 -100 196 -201 295 -99 98 -189 153 -330 202 l-95 33 -730 2 c-573 1 -744 -1 -795 -12z" />
                    <path d="M3965 3393 c-107 -56 -153 -177 -106 -278 11 -24 79 -100 165 -185 80 -80 146 -148 146 -152 0 -5 -421 -8 -935 -8 -822 0 -940 -2 -973 -15 -169 -71 -169 -319 0 -390 33 -13 151 -15 973 -15 514 0 935 -3 935 -8 0 -4 -66 -72 -146 -152 -154 -153 -183 -196 -184 -268 -1 -150 158 -255 298 -197 48 20 714 683 744 740 28 54 28 136 0 190 -30 58 -696 720 -744 740 -48 19 -134 19 -173 -2z" />
                  </g>
                </svg>
              </span>
              {!sidebarCollapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
            </button>
            <button onClick={()=>setDark(d=>!d)} className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-3'} gap-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200`}>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-200">🌙</span>
              {!sidebarCollapsed && (
                <span className="text-sm">{dark ? 'Light Mode' : 'Dark Mode'}</span>
              )}
              {!sidebarCollapsed && (
                <span className={`ml-auto inline-flex h-6 w-11 items-center rounded-full ${dark ? 'bg-violet-600' : 'bg-zinc-300'}`}>
                  <span className={`h-5 w-5 bg-white rounded-full transition ${dark ? 'translate-x-5' : 'translate-x-1'}`}></span>
                </span>
              )}
            </button>
          </div>
        </aside>

        <div className="flex-1 p-4 md:p-8">
          <h1 className="text-2xl md:text-4xl font-semibold mb-6 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Liquidación de intereses moratorios</h1>

          <form onSubmit={submit} className="bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Fecha inicial</label>
              <DatePicker valueDisplay={form.fechaInicial} onChange={(v)=>setForm(f=>({...f, fechaInicial: v}))} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Fecha de corte</label>
              <DatePicker valueDisplay={form.fechaCorte} onChange={(v)=>setForm(f=>({...f, fechaCorte: v}))} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Capital base</label>
              <input name="capitalBase" value={form.capitalBase} onChange={handleChange} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" placeholder="ej. 69300000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Tasa interés moratorio mensual (%)</label>
              <input name="tasaMensual" value={form.tasaMensual} onChange={handleChange} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" placeholder="3" />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Fecha de vencimiento (opcional)</label>
              <DatePicker valueDisplay={form.fechaVencimiento} onChange={(v)=>setForm(f=>({...f, fechaVencimiento: v}))} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-600/90 hover:to-indigo-600/90 active:scale-[.99] transition shadow-sm px-5 py-2 disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Calculando...' : 'Calcular'}</button>
              {data && (
                <button type="button" onClick={exportExcel} className="inline-flex items-center rounded-xl bg-zinc-900 text-white hover:bg-black active:scale-[.99] transition shadow-sm px-5 py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>Exportar a Excel</button>
              )}
            </div>
            {error && <p className="text-red-600">{error}</p>}
          </form>

          {data && (
            <div className="mt-6 space-y-8">
              {data.tramos.map((tr, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 rounded-2xl p-4">
                  <h2 className="text-center font-semibold mb-4 text-zinc-800 dark:text-zinc-200">{tr.titulo}</h2>
                  <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <table className="min-w-full text-sm text-zinc-700 dark:text-zinc-200">
                      <thead className="bg-zinc-50 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-300 text-xs uppercase tracking-wide">
                        <tr>
                          {['Mes causado','Del','Hasta','Días','Base','Tasa de interés moratorio','Interés causado'].map((h) => (
                            <th key={h} className="px-3 py-2 text-center border-b border-zinc-200 dark:border-zinc-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                        {tr.rows.map((r, i) => (
                          <tr key={i} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-800 dark:even:bg-zinc-900/40">
                            <td className="px-3 py-2">{r.mes}</td>
                            <td className="px-3 py-2 text-center">{r.del}</td>
                            <td className="px-3 py-2 text-center">{r.hasta}</td>
                            <td className="px-3 py-2 text-center">{r.dias}</td>
                            <td className="px-3 py-2 text-right">{currency(r.base)}</td>
                            <td className="px-3 py-2 text-center">{r.tasa.toFixed(2)}%</td>
                            <td className="px-3 py-2 text-right">{currency(r.interes)}</td>
                          </tr>
                        ))}
                        <tr className="bg-zinc-100 dark:bg-zinc-700/40 font-semibold">
                          <td className="px-3 py-2 text-right" colSpan={6}>Subtotal tramo</td>
                          <td className="px-3 py-2 text-right">{currency(tr.subtotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              <div className="bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 rounded-2xl p-4">
                <div className="text-right font-semibold text-zinc-800 dark:text-zinc-200">Total intereses causados a esta fecha: {currency(data.total)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



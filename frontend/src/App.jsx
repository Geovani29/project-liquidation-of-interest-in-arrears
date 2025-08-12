import { useState, useEffect } from 'react'

const DATE_FMT = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

function validateDate(value) {
  return DATE_FMT.test(value)
}

function currency(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)
}

function toIsoFromDisplay(display) {
  // dd/mm/yyyy -> yyyy-mm-dd
  const m = DATE_FMT.exec(display || '')
  if (!m) return ''
  const [_, dd, mm, yyyy] = m
  const pad = (s) => s.toString().padStart(2, '0')
  return `${yyyy}-${pad(mm)}-${pad(dd)}`
}

function fromIsoToDisplay(iso) {
  // yyyy-mm-dd -> dd/mm/yyyy
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length !== 3) return ''
  const [yyyy, mm, dd] = parts
  return `${dd}/${mm}/${yyyy}`
}

function DatePicker({ valueDisplay, onChange, className }) {
  // Muestra placeholder dd/mm/aaaa usando input de texto y cambia a date al enfocar
  const empty = !valueDisplay
  const handleFocus = (e) => {
    e.target.type = 'date'
    // si ya hay un valor display, convertirlo
    e.target.value = toIsoFromDisplay(valueDisplay)
  }
  const handleBlur = (e) => {
    if (!e.target.value) {
      e.target.type = 'text'
      e.target.value = ''
    }
  }
  const handleChange = (e) => {
    // siempre viene en ISO porque el tipo es date al cambiar
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

export default function App() {
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
    // Aplicar modo oscuro a nivel de <html> para que afecte a toda la app
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
      if (stored === 'dark') {
        setDark(true)
        return
      }
    } catch {}
    // si no hay preferencia guardada, seguir preferencia del sistema
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(prefersDark)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateDate(form.fechaInicial) || !validateDate(form.fechaCorte)) {
      setError('Fechas en formato dd/mm/aaaa')
      return
    }
    if (!form.capitalBase || isNaN(Number(form.capitalBase))) {
      setError('Capital base inválido')
      return
    }
    if (!form.tasaMensual || isNaN(Number(form.tasaMensual))) {
      setError('Tasa mensual inválida')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:5000/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          capitalBase: Number(form.capitalBase),
          tasaMensual: Number(form.tasaMensual),
          fechaVencimiento: form.fechaVencimiento || null,
        }),
      })
      if (!res.ok) throw new Error('Error del servidor')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const exportExcel = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:5000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          capitalBase: Number(form.capitalBase),
          tasaMensual: Number(form.tasaMensual),
          fechaVencimiento: form.fechaVencimiento || null,
        }),
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'liquidacion.xlsx'
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
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            className={`absolute top-3 ${sidebarCollapsed ? 'right-3' : 'right-3'} h-7 w-7 grid place-items-center rounded-full bg-violet-600 text-white text-sm shadow-md hover:bg-violet-700 transition`}
            aria-label="Alternar sidebar"
          >
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
            <button type="submit" className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-600/90 hover:to-indigo-600/90 shadow-sm px-5 py-2" disabled={loading}>{loading ? 'Calculando...' : 'Calcular'}</button>
            {data && (
              <button type="button" onClick={exportExcel} className="inline-flex items-center rounded-xl bg-zinc-900 text-white hover:bg-black shadow-sm px-5 py-2" disabled={loading}>Exportar a Excel</button>
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

      {/* Estilos globales ya se manejan con utilidades Tailwind */}
    </div>
    </div>
  )
}

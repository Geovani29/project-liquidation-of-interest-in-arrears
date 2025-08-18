import { useEffect, useRef, useState } from 'react'
import { useSession } from '../auth/SessionContext'
import { api } from '../api/client'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { calculationsService } from '../services/calculations'
import perfilIcon from '../assets/perfil.svg'
import historialIcon from '../assets/historial.svg'

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

function DatePicker({ valueDisplay, onChange, className, disabled }) {
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
      disabled={disabled}
    />
  )
}

export default function Calculator() {
  const { logout, user } = useSession()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fechaInicial: '',
    fechaCorte: '',
    capitalBase: '',
    tasaMensual: '',
    fechaVencimiento: '',
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  const [saved, setSaved] = useState('')
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, synced, error, offline
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const tableWrapRef = useRef(null)
  const [tableScrolled, setTableScrolled] = useState(false)
  const userDropdownRef = useRef(null)
  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  // Cargar datos iniciales del servicio
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar datos del formulario
        const formData = await calculationsService.loadFormData()
        if (formData) {
          setForm(formData)
        }

        // Cargar resultados
        const resultData = await calculationsService.loadResults()
        if (resultData) {
          setData(resultData)
        }

        // Cargar estado del sidebar
        const sidebarState = calculationsService.loadSidebarState()
        setSidebarCollapsed(sidebarState)
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadInitialData()
  }, [])

  // Cargar cálculo desde historial si está disponible
  useEffect(() => {
    const loadFromHistory = () => {
      try {
        const stored = localStorage.getItem('load_calculation')
        if (stored) {
          const calculation = JSON.parse(stored)
          
          // Cargar datos del formulario
          if (calculation.form_data) {
            setForm(calculation.form_data)
          }
          
          // Cargar resultados si existen
          if (calculation.result_data) {
            setData(calculation.result_data)
          }
          
          // Limpiar el localStorage para que no se cargue de nuevo
          localStorage.removeItem('load_calculation')
          
          toast.success(`Cálculo "${calculation.name}" cargado`)
        }
      } catch (error) {
        console.error('Error loading calculation from history:', error)
        localStorage.removeItem('load_calculation')
      }
    }

    loadFromHistory()
  }, [])

  // Monitorear estado de sincronización
  useEffect(() => {
    const updateSyncStatus = () => {
      const status = calculationsService.getStatus()
      if (!status.hasUser) {
        setSyncStatus('idle')
      } else if (!status.isOnline) {
        setSyncStatus('offline')
      } else if (status.canSync) {
        setSyncStatus('synced')
      } else {
        setSyncStatus('error')
      }
    }

    // Actualizar estado inicial
    updateSyncStatus()

    // Escuchar cambios de conectividad
    const handleOnline = () => updateSyncStatus()
    const handleOffline = () => updateSyncStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Actualizar estado cada 30 segundos
    const interval = setInterval(updateSyncStatus, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  // Cerrar dropdown de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showUserDropdown])

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

  // Persistir formulario usando el servicio
  useEffect(() => {
    setSaved('guardando')
    setSyncStatus('syncing')
    const t = setTimeout(async () => {
      try {
        await calculationsService.saveFormData(form)
        setSaved('guardado')
        setSyncStatus('synced')
        setTimeout(() => setSaved(''), 1200)
      } catch (error) {
        console.error('Error saving form data:', error)
        setSaved('')
        setSyncStatus('error')
      }
    }, 500)
    return () => clearTimeout(t)
  }, [form])

  useEffect(() => {
    calculationsService.saveSidebarState(sidebarCollapsed)
  }, [sidebarCollapsed])

  const validateBusinessRules = () => {
    if (!validateDate(form.fechaInicial) || !validateDate(form.fechaCorte)) {
      return 'Fechas en formato dd/mm/aaaa'
    }
    const [d1, m1, y1] = form.fechaInicial.split('/').map(Number)
    const [d2, m2, y2] = form.fechaCorte.split('/').map(Number)
    const start = new Date(y1, m1 - 1, d1)
    const end = new Date(y2, m2 - 1, d2)
    if (start > end) return 'La fecha inicial no puede ser mayor que la de corte'
    const cap = Number(String(form.capitalBase || '').replace(/[^0-9]/g, ''))
    if (!cap || isNaN(cap) || cap <= 0) {
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
        capitalBase: Number(String(form.capitalBase).replace(/[^0-9]/g, '')),
        tasaMensual: Number(form.tasaMensual),
        fechaVencimiento: form.fechaVencimiento || null,
      })
      setData(data)
      try {
        await calculationsService.saveResults(data, form)
      } catch (error) {
        console.error('Error saving results:', error)
      }
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
        capitalBase: Number(String(form.capitalBase).replace(/[^0-9]/g, '')),
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
      const fname = a.download || 'liquidacion.xlsx'
      toast.success(`Exportado: ${fname}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLimpiar = async () => {
    try {
      const emptyForm = { fechaInicial:'', fechaCorte:'', capitalBase:'', tasaMensual:'', fechaVencimiento:'' }
      setForm(emptyForm)
      setData(null)
      await calculationsService.clearCalculation()
    } catch (error) {
      console.error('Error clearing calculation:', error)
    }
  }

  const handleRellenarEjemplo = () => {
    setForm({ 
      fechaInicial:'18/12/2018', 
      fechaCorte:'24/06/2025', 
      capitalBase:'69.300.000', 
      tasaMensual:'3', 
      fechaVencimiento:'18/12/2019' 
    })
  }

  const handleSaveCalculation = () => {
    if (!data) {
      toast.error('Primero debes calcular para poder guardar')
      return
    }
    
    // Generar nombre por defecto basado en los datos del formulario
    const defaultName = `Liquidación ${form.capitalBase ? formatCurrency(Number(String(form.capitalBase).replace(/[^0-9]/g, ''))) : ''} - ${new Date().toLocaleDateString()}`
    setSaveName(defaultName)
    setShowSaveDialog(true)
  }

  const handleConfirmSave = async () => {
    if (!saveName.trim()) {
      toast.error('Ingresa un nombre para el cálculo')
      return
    }

    try {
      await calculationsService.saveCalculation(saveName, form, data)
      toast.success('¡Cálculo guardado!', {
        description: `"${saveName}" se guardó correctamente en tu historial`,
        action: {
          label: 'Ver historial',
          onClick: () => navigate('/historial')
        }
      })
      setShowSaveDialog(false)
      setSaveName('')
    } catch (error) {
      console.error('Error saving calculation:', error)
      toast.error('Error al guardar', {
        description: 'No se pudo guardar el cálculo. Inténtalo de nuevo.'
      })
    }
  }

  const handleCancelSave = () => {
    setShowSaveDialog(false)
    setSaveName('')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // Componente para mostrar estado de sincronización
  const SyncIndicator = () => {
    const getIndicator = () => {
      switch (syncStatus) {
        case 'syncing':
          return { icon: '🔄', text: 'Sincronizando...', color: 'text-blue-600' }
        case 'synced':
          return { icon: '☁️', text: 'Sincronizado', color: 'text-green-600' }
        case 'offline':
          return { icon: '📱', text: 'Sin conexión', color: 'text-yellow-600' }
        case 'error':
          return { icon: '⚠️', text: 'Error sync', color: 'text-red-600' }
        default:
          return { icon: '💾', text: 'Local', color: 'text-gray-500' }
      }
    }

    const indicator = getIndicator()
    return (
      <span className={`text-xs ${indicator.color} flex items-center gap-1`}>
        <span>{indicator.icon}</span>
        <span>{indicator.text}</span>
      </span>
    )
  }

  // máscara de capital
  const handleMoneyChange = (e) => {
    const raw = e.target.value
    const digits = String(raw || '').replace(/[^0-9]/g, '')
    const formatted = digits ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(digits)) : ''
    setForm((f) => ({ ...f, capitalBase: formatted }))
  }

  // sombra del encabezado en scroll
  useEffect(() => {
    const el = tableWrapRef.current
    if (!el) return
    const onScroll = () => setTableScrolled(el.scrollTop > 0)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [tableWrapRef.current])

  return (
    <div>
      <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex">
        <aside className={`m-4 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-800 rounded-3xl transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-72'} h-[calc(100vh-2rem)]`}>
			<div className="p-3 flex items-center justify-end">
            <button onClick={() => setSidebarCollapsed((c) => !c)} className="h-7 w-7 grid place-items-center rounded-full bg-violet-500 text-white text-sm shadow-md hover:bg-violet-600 transition cursor-pointer" aria-label="Alternar sidebar">
					{sidebarCollapsed ? '›' : '‹'}
				</button>
			</div>

          <nav className="px-2 space-y-1">
            <a className={`group relative flex items-center gap-3 rounded-2xl mx-2 transition cursor-pointer ${sidebarCollapsed ? 'justify-center px-0 py-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'px-4 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200'}`}>
              <span className={`inline-flex items-center justify-center rounded-xl ${sidebarCollapsed ? 'h-8 w-8 bg-white' : 'h-8 w-8 bg-violet-200'}`}>
                <img src="/src/assets/intereses.svg" alt="Intereses" className="h-5 w-5" />
              </span>
              {!sidebarCollapsed && <span className="font-medium">Liquidación intereses en mora</span>}
              {sidebarCollapsed && (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-zinc-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">Liquidación</span>
              )}
            </a>


          </nav>

          <div className="mt-auto p-3">
            <button
              onClick={handleLogout}
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
            {/* Botón de tema retirado del sidebar por solicitud */}
          </div>
        </aside>

        <div className="flex-1 p-0 md:p-0 flex flex-col">
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-8 py-3 flex items-center justify-between no-print">
            <h1 className="text-xl md:text-2xl font-semibold text-violet-600">Liquidación de intereses moratorios</h1>
            <div className="relative flex items-center gap-2">
              <button onClick={()=>setDark(d=>!d)} className="h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer" aria-pressed={dark}>🌙</button>
              
              {/* Dropdown de usuario */}
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => {
                    console.log('Toggle dropdown:', !showUserDropdown)
                    setShowUserDropdown(!showUserDropdown)
                  }}
                  className="h-8 w-8 rounded-full bg-violet-600 text-white grid place-items-center text-sm font-semibold cursor-pointer hover:bg-violet-700 transition"
                >
                  U
                </button>
                
{showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 z-50 animate-scaleIn">
                    <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Usuario</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email || 'Usuario'}</p>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false)
                          toast.info('Función en desarrollo')
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3"
                      >
                        <img src={perfilIcon} alt="Perfil" className="h-4 w-4" />
                        <span>Perfil</span>
                      </button>
                      
                      <Link
                        to="/historial"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3"
                      >
                        <img src={historialIcon} alt="Historial" className="h-4 w-4" />
                        <span>Historial</span>
                      </Link>
                      
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
                      
                      <button
                        onClick={() => {
                          setShowUserDropdown(false)
                          handleLogout()
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                      >
                        <span>🚪</span>
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8">

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
              <input name="capitalBase" value={form.capitalBase} onChange={handleMoneyChange} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" placeholder="ej. 69.300.000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Tasa interés moratorio mensual (%)</label>
              <input name="tasaMensual" value={form.tasaMensual} onChange={handleChange} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" placeholder="3" />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Fecha de vencimiento (opcional)</label>
              <DatePicker valueDisplay={form.fechaVencimiento} onChange={(v)=>setForm(f=>({...f, fechaVencimiento: v}))} className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 items-center">
              <button type="submit" className="inline-flex items-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 active:scale-[.99] transition shadow-sm px-5 py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Calculando...' : 'Calcular'}</button>
              {data && (
                <>
                  <button type="button" onClick={handleSaveCalculation} className="inline-flex items-center rounded-xl bg-green-600 text-white hover:bg-green-700 active:scale-[.99] transition shadow-sm px-5 py-2 cursor-pointer">
                    💾 Guardar cálculo
                  </button>
                  <button type="button" onClick={exportExcel} className="inline-flex items-center rounded-xl bg-zinc-900 text-white hover:bg-black active:scale-[.99] transition shadow-sm px-5 py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>Exportar a Excel</button>
                </>
              )}
              <button type="button" onClick={handleLimpiar} className="inline-flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 px-4 py-2 cursor-pointer">Limpiar</button>
              <button type="button" onClick={handleRellenarEjemplo} className="inline-flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 px-4 py-2 cursor-pointer">Rellenar ejemplo</button>
              {/* Botón de imprimir removido por solicitud */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{saved === 'guardando' ? 'Guardando…' : saved === 'guardado' ? 'Guardado' : ''}</span>
                <SyncIndicator />
              </div>
            </div>
            {error && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 px-4 py-3 ring-1 ring-rose-200 dark:ring-rose-800">
                <div className="flex items-start gap-3">
                  <span>⚠️</span>
                  <div className="flex-1 text-sm">{error}</div>
                  <button type="button" onClick={()=>setError('')} className="text-sm underline">Cerrar</button>
                </div>
              </div>
            )}
          </form>

          {loading && (
            <div className="mt-6">
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                {/* Header de loading con animación */}
                <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/30 dark:to-violet-900/30 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-200">Calculando intereses moratorios</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Procesando datos y generando liquidación...</p>
                    </div>
                  </div>
                </div>
                
                {/* Skeleton de tabla mejorado */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Header de tabla skeleton */}
                    <div className="grid grid-cols-4 gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-700">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                    
                    {/* Filas de tabla skeleton con variación */}
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="grid grid-cols-4 gap-4 py-2" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" style={{ width: `${75 + Math.random() * 25}%` }}></div>
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }}></div>
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" style={{ width: `${80 + Math.random() * 20}%` }}></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Resumen skeleton */}
                  <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-2 animate-pulse"></div>
                        <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 animate-pulse"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-2 animate-pulse"></div>
                        <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 animate-pulse"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-2 animate-pulse"></div>
                        <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data && !loading && (
            <div className="mt-6 space-y-8">
              {data.tramos.map((tr, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 rounded-2xl p-0">
                  <h2 className="text-center font-semibold px-4 pt-4 text-zinc-800 dark:text-zinc-200">{tr.titulo}</h2>
                  <div ref={tableWrapRef} className="mt-2 overflow-auto rounded-2xl border border-zinc-200 dark:border-zinc-700 max-h-[60vh]">
                    <table className="min-w-full text-sm text-zinc-700 dark:text-zinc-200">
                      <thead className={`sticky top-0 z-10 ${tableScrolled ? 'shadow-sm' : ''} bg-zinc-50 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-300 text-xs uppercase tracking-wide`}>
                        <tr>
                          {['Mes causado','Del','Hasta','Días','Base','Tasa de interés moratorio','Interés causado'].map((h) => (
                            <th key={h} className="px-3 py-2 text-center border-b border-zinc-200 dark:border-zinc-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                        {tr.rows.map((r, i) => (
                          <tr key={i} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-800 dark:even:bg-zinc-900/40 hover:bg-violet-50/60 dark:hover:bg-zinc-700/40 transition">
                            <td className="px-3 py-2">{r.mes}</td>
                            <td className="px-3 py-2 text-center">{r.del}</td>
                            <td className="px-3 py-2 text-center">{r.hasta}</td>
                            <td className="px-3 py-2 text-center">{r.dias}</td>
                            <td className="px-3 py-2 text-right">{currency(r.base)}</td>
                            <td className="px-3 py-2 text-center">{r.tasa.toFixed(2)}%</td>
                            <td className="px-3 py-2 text-right">{currency(r.interes)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 bg-zinc-100 dark:bg-zinc-700/50">
                        <tr className="font-semibold">
                          <td className="px-3 py-2 text-right" colSpan={6}>Subtotal tramo</td>
                          <td className="px-3 py-2 text-right">{currency(tr.subtotal)}</td>
                        </tr>
                      </tfoot>
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

      {/* Modal para guardar cálculo */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-scaleIn">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4 animate-scaleIn shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Guardar Cálculo
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                Nombre del cálculo
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Ej: Liquidación Cliente ABC"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelSave}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



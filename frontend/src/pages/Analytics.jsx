import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../auth/SessionContext'
import { calculationsService } from '../services/calculations'
import { toast } from 'sonner'
import perfilIcon from '../assets/perfil.svg'
import historialIcon from '../assets/historial.svg'

export default function Analytics() {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  
  // Estados principales
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  const [periodStats, setPeriodStats] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef(null)

  // Función para manejar el botón regresar
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Cargar datos de analytics
  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [statsData, periodData] = await Promise.all([
        calculationsService.getUserStatistics(),
        calculationsService.getStatisticsByPeriod(selectedPeriod)
      ])
      
      setStatistics(statsData)
      setPeriodStats(periodData)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Error al cargar estadísticas', {
        description: 'No se pudieron cargar las estadísticas. Inténtalo de nuevo.'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderStatCard = (title, value, subtitle, icon, color = 'blue') => (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`text-3xl opacity-50`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const renderChart = () => {
    if (!periodStats.length) return null

    const maxValue = Math.max(...periodStats.map(item => item.calculation_count))
    
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Cálculos por {selectedPeriod === 'month' ? 'Mes' : selectedPeriod === 'week' ? 'Semana' : 'Día'}
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          >
            <option value="day">Por día</option>
            <option value="week">Por semana</option>
            <option value="month">Por mes</option>
            <option value="year">Por año</option>
          </select>
        </div>

        <div className="space-y-4">
          {periodStats.slice(0, 12).map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-20 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                {item.period}
              </div>
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(item.calculation_count / maxValue) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {item.calculation_count} cálculos
                </span>
              </div>
              <div className="w-24 text-sm text-zinc-600 dark:text-zinc-400">
                {formatCurrency(item.total_capital)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTopCalculations = () => (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
        Resumen por Período
      </h3>
      
      {periodStats.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-zinc-600 dark:text-zinc-400">
            No hay datos suficientes para mostrar estadísticas
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {periodStats.slice(0, 5).map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {item.period}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {item.calculation_count} cálculos
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(item.total_capital)}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Promedio: {formatCurrency(item.avg_capital)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header fijo */}
      <div className="bg-white dark:bg-zinc-800 shadow-sm border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                📊 Analytics y Estadísticas
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="bg-zinc-600 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                ← Regresar
              </button>
              
              {/* Dropdown de usuario */}
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 animate-scaleIn"
                >
                  {user?.email?.charAt(0).toUpperCase()}
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50 animate-scaleIn">
                    <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Sesión iniciada como:</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {user?.email}
                      </p>
                    </div>
                    
                    <button className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2">
                      <img src={perfilIcon} alt="Perfil" className="w-4 h-4" />
                      Perfil
                    </button>
                    
                    <button 
                      onClick={() => navigate('/historial')}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <img src={historialIcon} alt="Historial" className="w-4 h-4" />
                      Historial
                    </button>
                    
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      🧮 Calculadora
                    </button>
                    
                    <button 
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          // Skeleton loader
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 animate-pulse">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 animate-pulse">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 animate-pulse">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : !statistics ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Realiza algunos cálculos para ver tus estadísticas aquí
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a la calculadora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tarjetas de estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderStatCard(
                'Total de Cálculos',
                statistics.total_calculations,
                'Cálculos realizados',
                '📊',
                'blue'
              )}
              
              {renderStatCard(
                'Capital Total',
                formatCurrency(statistics.total_capital),
                'Suma de todos los capitales',
                '💰',
                'green'
              )}
              
              {renderStatCard(
                'Intereses Totales',
                formatCurrency(statistics.total_interest),
                'Intereses calculados',
                '📈',
                'purple'
              )}
              
              {renderStatCard(
                'Promedio Capital',
                formatCurrency(statistics.avg_capital),
                'Capital promedio por cálculo',
                '📋',
                'orange'
              )}
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  Información General
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Meses activos:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {statistics.active_months || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Último cálculo:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {statistics.last_calculation_date 
                        ? formatDate(statistics.last_calculation_date)
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Usuario:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {statistics.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                {renderTopCalculations()}
              </div>
            </div>

            {/* Gráfico de tendencias */}
            <div className="grid grid-cols-1 gap-6">
              {renderChart()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

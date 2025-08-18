import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSession } from '../auth/SessionContext'
import { calculationsService } from '../services/calculations'
import { toast } from 'sonner'
import editarIcon from '../assets/editar.svg'
import copiarIcon from '../assets/copiar.svg'
import eliminarIcon from '../assets/eliminar.svg'
import perfilIcon from '../assets/perfil.svg'
import historialIcon from '../assets/historial.svg'

export default function History() {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef(null)

  // Cargar cálculos al montar el componente
  useEffect(() => {
    loadCalculations()
  }, [])

  // Búsqueda en tiempo real
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const results = await calculationsService.searchCalculations(searchQuery)
          setSearchResults(results)
        } catch (error) {
          console.error('Error searching:', error)
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

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

  const loadCalculations = async () => {
    try {
      setLoading(true)
      const { data, count } = await calculationsService.getCalculations()
      setCalculations(data)
      setTotalCount(count)
    } catch (error) {
      console.error('Error loading calculations:', error)
      toast.error('Error cargando cálculos')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadCalculation = (calculation) => {
    // Guardar el cálculo seleccionado en localStorage para que Calculator lo cargue
    localStorage.setItem('load_calculation', JSON.stringify(calculation))
    navigate('/interes-mora')
    toast.success(`Cargando: ${calculation.name}`)
  }

  const handleDuplicate = async (calculation) => {
    try {
      await calculationsService.duplicateCalculation(calculation.id)
      toast.success('Cálculo duplicado')
      loadCalculations()
    } catch (error) {
      console.error('Error duplicating:', error)
      toast.error('Error duplicando cálculo')
    }
  }

  const handleDelete = async (calculation) => {
    if (!confirm(`¿Eliminar "${calculation.name}"?`)) return
    
    try {
      await calculationsService.deleteCalculation(calculation.id)
      toast.success('Cálculo eliminado')
      loadCalculations()
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Error eliminando cálculo')
    }
  }

  const handleStartEdit = (calculation) => {
    setEditingId(calculation.id)
    setEditingName(calculation.name)
  }

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }

    try {
      await calculationsService.updateCalculationName(editingId, editingName)
      setEditingId(null)
      setEditingName('')
      toast.success('Nombre actualizado')
      loadCalculations()
    } catch (error) {
      console.error('Error updating name:', error)
      toast.error('Error actualizando nombre')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const CalculationCard = ({ calculation }) => {
    const isEditing = editingId === calculation.id
    const formData = calculation.form_data || {}
    const resultData = calculation.result_data || {}

    return (
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-md transition-shadow">
        {/* Header con nombre y acciones */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
                  {calculation.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(calculation.created_at)}
                </p>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleStartEdit(calculation)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition cursor-pointer"
                title="Editar nombre"
              >
                <img src={editarIcon} alt="Editar" className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDuplicate(calculation)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition cursor-pointer"
                title="Duplicar"
              >
                <img src={copiarIcon} alt="Duplicar" className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(calculation)}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition cursor-pointer"
                title="Eliminar"
              >
                <img src={eliminarIcon} alt="Eliminar" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Datos del cálculo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Parámetros</h4>
            <div className="space-y-1 text-sm">
              <div><span className="text-zinc-500">Capital:</span> {formatCurrency(formData.capitalBase)}</div>
              <div><span className="text-zinc-500">Tasa:</span> {formData.tasaMensual}% mensual</div>
              <div><span className="text-zinc-500">Período:</span> {formData.fechaInicial} - {formData.fechaCorte}</div>
            </div>
          </div>

          {resultData.summary && (
            <div>
              <h4 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Resultados</h4>
              <div className="space-y-1 text-sm">
                <div><span className="text-zinc-500">Total intereses:</span> {formatCurrency(resultData.summary.totalIntereses)}</div>
                <div><span className="text-zinc-500">Períodos:</span> {resultData.rows?.length || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Botón para cargar */}
        <button
          onClick={() => handleLoadCalculation(calculation)}
          className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
        >
          Cargar en calculadora
        </button>
      </div>
    )
  }

  const resultsToShow = searchQuery.trim() ? searchResults : calculations

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-violet-600 hover:text-violet-700">
                <span className="text-2xl font-bold">K</span>
                <span className="font-semibold">Kaplo</span>
              </Link>
              <span className="text-zinc-400">→</span>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Historial de Cálculos
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="bg-zinc-600 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                ← Regresar
              </Link>
              
              {/* Dropdown de usuario */}
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="h-8 w-8 rounded-full bg-violet-600 text-white grid place-items-center text-sm font-semibold cursor-pointer hover:bg-violet-700 transition"
                >
                  U
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Usuario</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email || 'user@example.com'}</p>
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
                        to="/interes-mora"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3"
                      >
                        <img src={historialIcon} alt="Calculadora" className="h-4 w-4" />
                        <span>Calculadora</span>
                      </Link>
                      
                      <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
                      
                      <button
                        onClick={() => {
                          setShowUserDropdown(false)
                          logout()
                          navigate('/')
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
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de búsqueda y estadísticas */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Mis Cálculos
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {totalCount} cálculos guardados
            </p>
          </div>

          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar cálculos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de cálculos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-500 dark:text-zinc-400">Cargando cálculos...</div>
          </div>
        ) : resultsToShow.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              {searchQuery.trim() ? 'No se encontraron resultados' : 'No tienes cálculos guardados'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {searchQuery.trim() 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera liquidación de intereses'
              }
            </p>
            {!searchQuery.trim() && (
              <Link
                to="/interes-mora"
                className="inline-flex items-center bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Crear mi primera liquidación
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {resultsToShow.map((calculation) => (
              <CalculationCard key={calculation.id} calculation={calculation} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

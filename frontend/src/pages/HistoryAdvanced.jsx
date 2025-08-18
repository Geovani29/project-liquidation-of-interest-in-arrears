import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../auth/SessionContext'
import { calculationsService } from '../services/calculations'
import { toast } from 'sonner'
import editarIcon from '../assets/editar.svg'
import copiarIcon from '../assets/copiar.svg'
import eliminarIcon from '../assets/eliminar.svg'
import perfilIcon from '../assets/perfil.svg'
import historialIcon from '../assets/historial.svg'

export default function HistoryAdvanced() {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  
  // Estados principales
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef(null)

  // Estados para funcionalidades avanzadas
  const [showFilters, setShowFilters] = useState(false)
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [selectedCalculations, setSelectedCalculations] = useState([])
  const [showBatchActions, setShowBatchActions] = useState(false)
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)

  // Estados para filtros avanzados
  const [filters, setFilters] = useState({
    folderId: '',
    dateFrom: '',
    dateTo: '',
    capitalMin: '',
    capitalMax: '',
    rateMin: '',
    rateMax: '',
    tagIds: [],
    orderBy: 'created_at',
    orderDirection: 'desc'
  })

  // Estados para crear etiquetas/carpetas
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6', description: '' })
  const [newFolder, setNewFolder] = useState({ name: '', description: '', parentId: null })

  // Función para manejar el botón regresar de forma inteligente
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  // Búsqueda y filtros en tiempo real
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadCalculations()
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, filters])

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowUserDropdown(false)
        setShowFilters(false)
        setShowCreateTag(false)
        setShowCreateFolder(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      const [foldersData, tagsData] = await Promise.all([
        calculationsService.getFolders(),
        calculationsService.getTags()
      ])
      setFolders(foldersData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
    loadCalculations()
  }

  // Cargar cálculos con filtros
  const loadCalculations = async () => {
    setLoading(true)
    try {
      const searchFilters = {
        ...filters,
        query: searchQuery.trim() || undefined
      }

      const result = await calculationsService.searchCalculationsAdvanced(searchFilters)
      setCalculations(result.data)
      setTotalCount(result.count)
    } catch (error) {
      console.error('Error loading calculations:', error)
      toast.error('Error al cargar cálculos', {
        description: 'No se pudieron cargar los cálculos. Inténtalo de nuevo.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Crear etiqueta
  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTag.name.trim()) return

    try {
      const tag = await calculationsService.createTag(
        newTag.name,
        newTag.color,
        newTag.description
      )
      setTags(prev => [...prev, tag])
      setNewTag({ name: '', color: '#3B82F6', description: '' })
      setShowCreateTag(false)
      toast.success('Etiqueta creada', {
        description: `La etiqueta "${tag.name}" se creó correctamente.`
      })
    } catch (error) {
      console.error('Error creating tag:', error)
      toast.error('Error al crear etiqueta', {
        description: 'No se pudo crear la etiqueta. Inténtalo de nuevo.'
      })
    }
  }

  // Crear carpeta
  const handleCreateFolder = async (e) => {
    e.preventDefault()
    if (!newFolder.name.trim()) return

    try {
      const folder = await calculationsService.createFolder(
        newFolder.name,
        newFolder.description,
        newFolder.parentId || null
      )
      setFolders(prev => [...prev, folder])
      setNewFolder({ name: '', description: '', parentId: null })
      setShowCreateFolder(false)
      toast.success('Carpeta creada', {
        description: `La carpeta "${folder.name}" se creó correctamente.`
      })
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Error al crear carpeta', {
        description: 'No se pudo crear la carpeta. Inténtalo de nuevo.'
      })
    }
  }

  // Manejar selección múltiple
  const handleSelectCalculation = (id, checked) => {
    if (checked) {
      setSelectedCalculations(prev => [...prev, id])
    } else {
      setSelectedCalculations(prev => prev.filter(calcId => calcId !== id))
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCalculations(calculations.map(calc => calc.id))
    } else {
      setSelectedCalculations([])
    }
  }

  // Acciones en lote
  const handleBatchDelete = async () => {
    if (!selectedCalculations.length) return

    if (!confirm(`¿Eliminar ${selectedCalculations.length} cálculos seleccionados?`)) return

    try {
      await calculationsService.deleteCalculationsInBatch(selectedCalculations)
      setSelectedCalculations([])
      loadCalculations()
      toast.success('Cálculos eliminados', {
        description: `Se eliminaron ${selectedCalculations.length} cálculos correctamente.`
      })
    } catch (error) {
      console.error('Error deleting calculations:', error)
      toast.error('Error al eliminar cálculos')
    }
  }

  const handleBatchMoveToFolder = async (folderId) => {
    if (!selectedCalculations.length) return

    try {
      await calculationsService.moveCalculationsToFolderInBatch(selectedCalculations, folderId)
      setSelectedCalculations([])
      loadCalculations()
      toast.success('Cálculos movidos', {
        description: `Se movieron ${selectedCalculations.length} cálculos a la carpeta.`
      })
    } catch (error) {
      console.error('Error moving calculations:', error)
      toast.error('Error al mover cálculos')
    }
  }

  const handleBatchAddTag = async (tagId) => {
    if (!selectedCalculations.length) return

    try {
      await calculationsService.addTagToCalculationsInBatch(selectedCalculations, tagId)
      setSelectedCalculations([])
      loadCalculations()
      toast.success('Etiqueta agregada', {
        description: `Se agregó la etiqueta a ${selectedCalculations.length} cálculos.`
      })
    } catch (error) {
      console.error('Error adding tag:', error)
      toast.error('Error al agregar etiqueta')
    }
  }

  // Funciones existentes (editar, duplicar, eliminar, cargar)
  const handleEdit = async (id, newName) => {
    try {
      await calculationsService.updateCalculationName(id, newName)
      setCalculations(prev => 
        prev.map(calc => 
          calc.id === id ? { ...calc, name: newName } : calc
        )
      )
      setEditingId(null)
      setEditingName('')
      toast.success('Nombre actualizado', {
        description: 'El nombre del cálculo se actualizó correctamente.'
      })
    } catch (error) {
      console.error('Error updating name:', error)
      toast.error('Error al actualizar nombre')
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await calculationsService.duplicateCalculation(id)
      loadCalculations()
      toast.success('Cálculo duplicado', {
        description: 'El cálculo se duplicó correctamente.'
      })
    } catch (error) {
      console.error('Error duplicating:', error)
      toast.error('Error al duplicar cálculo')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cálculo?')) return

    try {
      await calculationsService.deleteCalculation(id)
      setCalculations(prev => prev.filter(calc => calc.id !== id))
      toast.success('Cálculo eliminado', {
        description: 'El cálculo se eliminó correctamente.'
      })
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Error al eliminar cálculo')
    }
  }

  const handleLoadCalculation = (calculation) => {
    localStorage.setItem('loadCalculation', JSON.stringify(calculation))
    navigate('/')
    toast.success('Cálculo cargado', {
      description: 'Los datos se cargaron en la calculadora.',
      action: {
        label: 'Ir a calculadora',
        onClick: () => navigate('/')
      }
    })
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

  const getCapitalFromFormData = (formData) => {
    try {
      const data = typeof formData === 'string' ? JSON.parse(formData) : formData
      const capital = data?.capitalBase?.replace(/[.,]/g, '')
      return parseInt(capital) || 0
    } catch {
      return 0
    }
  }

  const renderCalculationCard = (calculation, index) => {
    const isSelected = selectedCalculations.includes(calculation.id)
    const capital = getCapitalFromFormData(calculation.form_data)

    return (
      <div
        key={calculation.id}
        className={`bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 transition-all duration-300 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 animate-fadeInUp ${
          isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectCalculation(calculation.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              {editingId === calculation.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleEdit(calculation.id, editingName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit(calculation.id, editingName)
                    if (e.key === 'Escape') {
                      setEditingId(null)
                      setEditingName('')
                    }
                  }}
                  className="w-full text-lg font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                  autoFocus
                />
              ) : (
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {calculation.name}
                </h3>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditingId(calculation.id)
                setEditingName(calculation.name)
              }}
              className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Editar nombre"
            >
              <img src={editarIcon} alt="Editar" className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDuplicate(calculation.id)}
              className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Duplicar"
            >
              <img src={copiarIcon} alt="Duplicar" className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(calculation.id)}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Eliminar"
            >
              <img src={eliminarIcon} alt="Eliminar" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          <div className="flex justify-between">
            <span>Capital:</span>
            <span className="font-medium">{formatCurrency(capital)}</span>
          </div>
          <div className="flex justify-between">
            <span>Creado:</span>
            <span>{formatDate(calculation.created_at)}</span>
          </div>
          {calculation.folder && (
            <div className="flex justify-between">
              <span>Carpeta:</span>
              <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                {calculation.folder.name}
              </span>
            </div>
          )}
          {calculation.calculation_tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {calculation.calculation_tags.map((tagRelation) => (
                <span
                  key={tagRelation.tags.id}
                  className="inline-block px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: tagRelation.tags.color + '20',
                    color: tagRelation.tags.color
                  }}
                >
                  {tagRelation.tags.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => handleLoadCalculation(calculation)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          Cargar en calculadora
        </button>
      </div>
    )
  }

  const renderFilters = () => (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro por carpeta */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Carpeta
          </label>
          <select
            value={filters.folderId}
            onChange={(e) => setFilters(prev => ({ ...prev, folderId: e.target.value }))}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          >
            <option value="">Todas las carpetas</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>

        {/* Filtro por fecha desde */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Desde
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        {/* Filtro por fecha hasta */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Hasta
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        {/* Filtro por capital mínimo */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Capital mínimo
          </label>
          <input
            type="number"
            value={filters.capitalMin}
            onChange={(e) => setFilters(prev => ({ ...prev, capitalMin: e.target.value }))}
            placeholder="Ej: 1000000"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        {/* Filtro por capital máximo */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Capital máximo
          </label>
          <input
            type="number"
            value={filters.capitalMax}
            onChange={(e) => setFilters(prev => ({ ...prev, capitalMax: e.target.value }))}
            placeholder="Ej: 10000000"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
        </div>

        {/* Ordenamiento */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Ordenar por
          </label>
          <div className="flex gap-2">
            <select
              value={filters.orderBy}
              onChange={(e) => setFilters(prev => ({ ...prev, orderBy: e.target.value }))}
              className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            >
              <option value="created_at">Fecha</option>
              <option value="name">Nombre</option>
              <option value="capital_amount">Capital</option>
            </select>
            <select
              value={filters.orderDirection}
              onChange={(e) => setFilters(prev => ({ ...prev, orderDirection: e.target.value }))}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setFilters({
            folderId: '',
            dateFrom: '',
            dateTo: '',
            capitalMin: '',
            capitalMax: '',
            rateMin: '',
            rateMax: '',
            tagIds: [],
            orderBy: 'created_at',
            orderDirection: 'desc'
          })}
          className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          Limpiar filtros
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  )

  const renderBatchActions = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-blue-800 dark:text-blue-200">
          {selectedCalculations.length} cálculos seleccionados
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleBatchDelete}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleBatchMoveToFolder(e.target.value)
                e.target.value = ''
              }
            }}
            className="px-3 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Mover a carpeta...</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleBatchAddTag(e.target.value)
                e.target.value = ''
              }
            }}
            className="px-3 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Agregar etiqueta...</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
          <button
            onClick={() => setSelectedCalculations([])}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
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
                Historial de Cálculos ({totalCount})
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
                      onClick={() => navigate('/')}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <img src={historialIcon} alt="Calculadora" className="w-4 h-4" />
                      Calculadora
                    </button>
                    
                    <button 
                      onClick={() => navigate('/analytics')}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      📊 Analytics
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
        {/* Barra de búsqueda y controles */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar cálculos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                🔍 Filtros
              </button>
              <button
                onClick={() => setShowCreateTag(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Etiqueta
              </button>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Carpeta
              </button>
            </div>
          </div>

          {calculations.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedCalculations.length === calculations.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Seleccionar todos
              </span>
            </div>
          )}
        </div>

        {/* Filtros */}
        {showFilters && renderFilters()}

        {/* Acciones en lote */}
        {selectedCalculations.length > 0 && renderBatchActions()}

        {/* Lista de cálculos */}
        {loading ? (
          // Skeleton loader
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                </div>
                <div className="mt-4 h-10 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : calculations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              {searchQuery ? 'No se encontraron cálculos' : 'No hay cálculos guardados'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                : 'Realiza tu primer cálculo y guárdalo para verlo aquí'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir a la calculadora
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculations.map((calculation, index) => renderCalculationCard(calculation, index))}
          </div>
        )}
      </div>

      {/* Modal para crear etiqueta */}
      {showCreateTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
              Crear nueva etiqueta
            </h3>
            <form onSubmit={handleCreateTag}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={newTag.description}
                  onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTag(false)}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear carpeta */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
              Crear nueva carpeta
            </h3>
            <form onSubmit={handleCreateFolder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Carpeta padre (opcional)
                </label>
                <select
                  value={newFolder.parentId || ''}
                  onChange={(e) => setNewFolder(prev => ({ ...prev, parentId: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                >
                  <option value="">Sin carpeta padre</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={newFolder.description}
                  onChange={(e) => setNewFolder(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

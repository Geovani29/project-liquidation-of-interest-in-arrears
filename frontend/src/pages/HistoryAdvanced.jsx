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
  const { user, logout, supabaseUserId } = useSession()
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
  
  // Estados para drag & drop
  const [draggedCalculation, setDraggedCalculation] = useState(null)
  const [dragOverFolder, setDragOverFolder] = useState(null)
  
  // Estados para vista de carpeta específica
  const [viewingFolder, setViewingFolder] = useState(null) // null = vista principal, folderId = vista de carpeta específica
  const [folderCalculations, setFolderCalculations] = useState([]) // cálculos de la carpeta actual
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [movingCalculationId, setMovingCalculationId] = useState(null)

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
    if (user && supabaseUserId) {
      loadInitialData()
    }
  }, [user, supabaseUserId])

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
      // Asegurar que el servicio esté configurado con el usuario actual
      if (supabaseUserId) {
        calculationsService.setUser(supabaseUserId)
      }
      
      const [foldersData, tagsData] = await Promise.all([
        calculationsService.getFolders(),
        calculationsService.getTags()
      ])
      setFolders(foldersData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Error al cargar datos')
    } finally {
      // Siempre cargar cálculos al final
      loadCalculations()
    }
  }

  // Función para refrescar todos los datos
  const refreshAllData = async () => {
    try {
      const [foldersData, tagsData] = await Promise.all([
        calculationsService.getFolders(),
        calculationsService.getTags(),
        loadCalculations()
      ])
      setFolders(foldersData)
      setTags(tagsData)
      
      // Si estamos viendo una carpeta específica, recargar sus cálculos
      if (viewingFolder) {
        await loadFolderCalculations(viewingFolder)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Error al actualizar datos')
    }
  }

  // Cargar cálculos de una carpeta específica
  const loadFolderCalculations = async (folderId) => {
    setLoading(true)
    try {
      const result = await calculationsService.searchCalculationsAdvanced({
        folderId: folderId === 'none' ? null : folderId,
        limit: 1000 // Cargar todos los de la carpeta
      })
      
      setFolderCalculations(result.data)
    } catch (error) {
      console.error('Error loading folder calculations:', error)
      toast.error('Error al cargar cálculos de la carpeta')
      setFolderCalculations([])
    } finally {
      setLoading(false)
    }
  }

  // Cambiar a vista de carpeta específica
  const viewFolder = async (folderId) => {
    setViewingFolder(folderId)
    await loadFolderCalculations(folderId)
  }

  // Volver a la vista principal
  const backToMainView = () => {
    setViewingFolder(null)
    setFolderCalculations([])
    loadCalculations()
  }

  // Funciones para drag & drop
  const handleDragStart = (e, calculation) => {
    setDraggedCalculation(calculation)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
  }

  const handleDragEnd = () => {
    setDraggedCalculation(null)
    setDragOverFolder(null)
  }

  const handleDragOver = (e, folderId = null) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverFolder(folderId)
  }

  const handleDragLeave = () => {
    setDragOverFolder(null)
  }

  const handleDrop = async (e, folderId = null) => {
    e.preventDefault()
    
    if (!draggedCalculation) return
    
    // No hacer nada si se suelta en la misma carpeta
    if (draggedCalculation.folder_id === folderId) {
      setDraggedCalculation(null)
      setDragOverFolder(null)
      return
    }

    try {
      await calculationsService.moveCalculationToFolder(draggedCalculation.id, folderId)
      
      // Actualizar estado local
      setCalculations(prev => 
        prev.map(calc => 
          calc.id === draggedCalculation.id 
            ? { 
                ...calc, 
                folder_id: folderId,
                folder: folderId ? folders.find(f => f.id === folderId) : null
              } 
            : calc
        )
      )

      const targetName = folderId ? folders.find(f => f.id === folderId)?.name : 'Sin carpeta'
      toast.success('Cálculo movido', {
        description: `"${draggedCalculation.name}" se movió a "${targetName}".`
      })

      // Refrescar datos para asegurar sincronización
      if (viewingFolder) {
        await loadFolderCalculations(viewingFolder)
      } else {
        await refreshAllData()
      }
      
    } catch (error) {
      console.error('Error moving calculation:', error)
      toast.error('Error al mover cálculo')
    } finally {
      setDraggedCalculation(null)
      setDragOverFolder(null)
    }
  }

  // Renderizar vista de carpeta específica (en pila)
  const renderFolderView = () => {
    const currentFolder = viewingFolder === 'none' ? { name: 'Sin carpeta', id: 'none' } : folders.find(f => f.id === viewingFolder)
    
    return (
      <div className="flex gap-6">
        {/* Sidebar con carpetas para mover archivos */}
        <div className="w-64 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 h-fit">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            📁 Mover a:
          </h3>
          
          <div className="space-y-1">
            {/* Rama principal */}
            <div 
              className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                dragOverFolder === '' 
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 shadow-md' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
              onDragOver={(e) => handleDragOver(e, '')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, '')}
            >
              <span className="text-blue-500">🌳</span>
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                Rama principal
              </span>
            </div>

            {/* Sin carpeta */}
            <div 
              className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                dragOverFolder === null 
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 shadow-md' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
              onDragOver={(e) => handleDragOver(e, null)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, null)}
            >
              <span className="text-zinc-400">📄</span>
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                Sin carpeta
              </span>
            </div>

            {/* Otras carpetas */}
            {folders.filter(f => f.id !== viewingFolder).map(folder => (
              <div 
                key={folder.id}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                  dragOverFolder === folder.id 
                    ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 shadow-md' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <span className="text-yellow-500">📁</span>
                <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate">
                  {folder.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 space-y-6">
          {/* Header de carpeta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={backToMainView}
                className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                ← Regresar
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{viewingFolder === 'none' ? '📄' : '📁'}</span>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentFolder?.name || 'Carpeta no encontrada'}
                </h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  ({folderCalculations.length} archivo{folderCalculations.length !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          </div>

        {/* Lista de archivos en pila */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  <div className="flex-1">
                    <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  </div>
                  <div className="w-20 h-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : folderCalculations.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg mb-2">Esta carpeta está vacía</p>
            <p className="text-sm">Arrastra archivos aquí o crea nuevos cálculos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {folderCalculations.map((calculation, index) => (
              <div
                key={calculation.id}
                draggable
                onDragStart={(e) => handleDragStart(e, calculation)}
                onDragEnd={handleDragEnd}
                className={`group bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 hover:shadow-md transition-all cursor-move ${
                  draggedCalculation?.id === calculation.id ? 'opacity-50 scale-95' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  {/* Icono de archivo */}
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">📊</span>
                  </div>

                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {calculation.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <span>
                        {new Date(calculation.created_at).toLocaleDateString('es-ES')}
                      </span>
                      {calculation.capital_amount && (
                        <span>
                          Capital: ${Number(calculation.capital_amount).toLocaleString('es-ES')}
                        </span>
                      )}
                      {calculation.total_interest && (
                        <span>
                          Interés: ${Number(calculation.total_interest).toLocaleString('es-ES')}
                        </span>
                      )}
                    </div>
                    
                    {/* Etiquetas */}
                    {calculation.calculation_tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {calculation.calculation_tags.map((tagRelation) => (
                          <span
                            key={tagRelation.tags.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded group/tag hover:bg-opacity-30 transition-all cursor-pointer"
                            style={{
                              backgroundColor: tagRelation.tags.color + '20',
                              color: tagRelation.tags.color
                            }}
                          >
                            {tagRelation.tags.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveTagFromCalculation(calculation.id, tagRelation.tags.id)
                              }}
                              className="opacity-0 group-hover/tag:opacity-100 text-xs hover:bg-red-500 hover:text-white w-4 h-4 rounded-full flex items-center justify-center transition-all ml-1"
                              title="Eliminar etiqueta"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(calculation.id)
                        setEditingName(calculation.name)
                      }}
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full cursor-pointer transition-all"
                      title="Editar nombre"
                    >
                      <img src={editarIcon} alt="Editar" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(calculation.id)}
                      className="p-2 text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full cursor-pointer transition-all"
                      title="Duplicar"
                    >
                      <img src={copiarIcon} alt="Copiar" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(calculation.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full cursor-pointer transition-all"
                      title="Eliminar"
                    >
                      <img src={eliminarIcon} alt="Eliminar" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLoadCalculation(calculation)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Cargar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    )
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
      
      // Asegurar que los datos tengan la estructura correcta
      const processedData = result.data.map(calc => ({
        ...calc,
        folder_id: calc.folder_id || null,
        folder: calc.folder || null,
        calculation_tags: calc.calculation_tags || []
      }))
      
      setCalculations(processedData)
      setTotalCount(result.count)
    } catch (error) {
      console.error('Error loading calculations:', error)
      toast.error('Error al cargar cálculos', {
        description: 'No se pudieron cargar los cálculos. Inténtalo de nuevo.'
      })
      // En caso de error, limpiar datos para evitar estado inconsistente
      setCalculations([])
      setTotalCount(0)
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

  // Editar nombre de carpeta
  const handleEditFolder = async (folderId, newName) => {
    if (!newName.trim()) return

    try {
      await calculationsService.updateFolder(folderId, { name: newName.trim() })
      setFolders(prev => 
        prev.map(folder => 
          folder.id === folderId ? { ...folder, name: newName.trim() } : folder
        )
      )
      setEditingFolderId(null)
      setEditingFolderName('')
      toast.success('Carpeta actualizada', {
        description: 'El nombre de la carpeta se actualizó correctamente.'
      })
    } catch (error) {
      console.error('Error updating folder:', error)
      toast.error('Error al actualizar carpeta')
    }
  }

  // Eliminar carpeta
  const handleDeleteFolder = async (folderId) => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return

    // Contar cálculos en esta carpeta
    const calculationsInFolder = calculations.filter(calc => calc.folder_id === folderId).length

    let confirmMessage
    if (calculationsInFolder === 0) {
      confirmMessage = `¿Eliminar la carpeta "${folder.name}"?\n\nLa carpeta está vacía y se eliminará permanentemente.`
    } else {
      confirmMessage = `¿Eliminar la carpeta "${folder.name}"?\n\nEsta carpeta contiene ${calculationsInFolder} cálculo(s) guardado(s).\nAl eliminar la carpeta, los cálculos se moverán a "Sin carpeta".`
    }

    if (!confirm(confirmMessage)) return

    try {
      await calculationsService.deleteFolder(folderId)
      
      // Actualizar la lista de carpetas
      setFolders(prev => prev.filter(f => f.id !== folderId))
      
      // Actualizar los cálculos localmente - mover a "Sin carpeta"
      setCalculations(prev => 
        prev.map(calc => 
          calc.folder_id === folderId 
            ? { ...calc, folder_id: null, folder: null }
            : calc
        )
      )
      
      // Limpiar filtro si estaba filtrado por esta carpeta
      if (filters.folderId === folderId) {
        setFilters(prev => ({ ...prev, folderId: '' }))
      }
      
      // Recargar completamente los datos para asegurar sincronización
      await refreshAllData()
      
      if (calculationsInFolder === 0) {
        toast.success('Carpeta eliminada', {
          description: `La carpeta "${folder.name}" se eliminó correctamente.`
        })
      } else {
        toast.success('Carpeta eliminada', {
          description: `La carpeta "${folder.name}" se eliminó y sus ${calculationsInFolder} cálculo(s) se movieron a "Sin carpeta".`
        })
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast.error('Error al eliminar carpeta')
    }
  }

  // Mover cálculo a carpeta
  const handleMoveCalculation = async (calculationId, targetFolderId) => {
    try {
      await calculationsService.moveCalculationToFolder(
        calculationId, 
        targetFolderId === 'none' ? null : targetFolderId
      )
      
      // Actualizar el cálculo localmente
      setCalculations(prev => 
        prev.map(calc => 
          calc.id === calculationId 
            ? { 
                ...calc, 
                folder_id: targetFolderId === 'none' ? null : targetFolderId,
                folder: targetFolderId === 'none' ? null : folders.find(f => f.id === targetFolderId)
              } 
            : calc
        )
      )
      
      setShowMoveModal(false)
      setMovingCalculationId(null)
      
      const targetName = targetFolderId === 'none' ? 'Sin carpeta' : folders.find(f => f.id === targetFolderId)?.name
      
      // Recargar datos para asegurar sincronización
      await loadCalculations()
      
      toast.success('Cálculo movido', {
        description: `El cálculo se movió a "${targetName}".`
      })
    } catch (error) {
      console.error('Error moving calculation:', error)
      toast.error('Error al mover cálculo')
      
      // En caso de error, recargar para restaurar estado correcto
      await loadCalculations()
    }
  }

  // Eliminar etiqueta de cálculo
  const handleRemoveTagFromCalculation = async (calculationId, tagId) => {
    try {
      await calculationsService.removeTagFromCalculation(calculationId, tagId)
      
      // Actualizar estado local
      setCalculations(prev => 
        prev.map(calc => 
          calc.id === calculationId 
            ? {
                ...calc,
                calculation_tags: calc.calculation_tags.filter(ct => ct.tag_id !== tagId)
              }
            : calc
        )
      )

      const tag = tags.find(t => t.id === tagId)
      toast.success('Etiqueta eliminada', {
        description: `La etiqueta "${tag?.name}" se eliminó del cálculo.`
      })
      
    } catch (error) {
      console.error('Error removing tag from calculation:', error)
      toast.error('Error al eliminar etiqueta')
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
    localStorage.setItem('load_calculation', JSON.stringify(calculation))
    navigate('/app/c')
    toast.success('Cálculo cargado', {
      description: 'Los datos se cargaron en la calculadora.',
      action: {
        label: 'Ir a calculadora',
        onClick: () => navigate('/app/c')
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
        draggable
        onDragStart={(e) => handleDragStart(e, calculation)}
        onDragEnd={handleDragEnd}
        className={`group bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 min-h-[280px] transition-all duration-300 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 animate-fadeInUp cursor-move ${
          isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
        } ${draggedCalculation?.id === calculation.id ? 'opacity-50 scale-95' : ''}`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectCalculation(calculation.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
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
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 break-words">
                  {calculation.name}
                </h3>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-1 ml-3 flex-shrink-0 transition-opacity duration-200 ${
            editingId === calculation.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <button
              onClick={() => {
                if (editingId === calculation.id) {
                  handleEdit(calculation.id, editingName)
                } else {
                  setEditingId(calculation.id)
                  setEditingName(calculation.name)
                }
              }}
              className={`p-2 rounded-full transition-colors cursor-pointer shadow-sm border ${
                editingId === calculation.id
                  ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                  : 'bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              title={editingId === calculation.id ? "Confirmar edición" : "Editar nombre"}
            >
              {editingId === calculation.id ? (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <img src={editarIcon} alt="Editar" className="w-4 h-4" />
              )}
            </button>
            
            {editingId === calculation.id && (
              <button
                onClick={() => {
                  setEditingId(null)
                  setEditingName('')
                }}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer bg-white dark:bg-zinc-700 shadow-sm border border-red-200 dark:border-red-600"
                title="Cancelar edición"
              >
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            <button
              onClick={() => handleDuplicate(calculation.id)}
              className={`p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 ${
                editingId === calculation.id ? 'opacity-50 pointer-events-none' : ''
              }`}
              title="Duplicar"
              disabled={editingId === calculation.id}
            >
              <img src={copiarIcon} alt="Duplicar" className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMovingCalculationId(calculation.id)
                setShowMoveModal(true)
              }}
              className={`p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 ${
                editingId === calculation.id ? 'opacity-50 pointer-events-none' : ''
              }`}
              title="Mover a carpeta"
              disabled={editingId === calculation.id}
            >
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
              </svg>
            </button>
            <button
              onClick={() => handleDelete(calculation.id)}
              className={`p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 ${
                editingId === calculation.id ? 'opacity-50 pointer-events-none' : ''
              }`}
              title="Eliminar"
              disabled={editingId === calculation.id}
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
              <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                📁 {calculation.folder.name}
              </span>
            </div>
          )}
          {calculation.calculation_tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {calculation.calculation_tags.map((tagRelation) => (
                <span
                  key={tagRelation.tags.id}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded group/tag hover:bg-opacity-30 transition-all cursor-pointer"
                  style={{
                    backgroundColor: tagRelation.tags.color + '20',
                    color: tagRelation.tags.color
                  }}
                >
                  {tagRelation.tags.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTagFromCalculation(calculation.id, tagRelation.tags.id)
                    }}
                    className="opacity-0 group-hover/tag:opacity-100 text-xs hover:bg-red-500 hover:text-white w-4 h-4 rounded-full flex items-center justify-center transition-all ml-1"
                    title="Eliminar etiqueta"
                  >
                    ✕
                  </button>
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

  // Función para organizar carpetas en jerarquía
  const buildFolderTree = (folders) => {
    const folderMap = {}
    const tree = []

    // Crear mapa de carpetas
    folders.forEach(folder => {
      folderMap[folder.id] = { ...folder, children: [] }
    })

    // Construir árbol
    folders.forEach(folder => {
      if (folder.parent_id && folderMap[folder.parent_id]) {
        folderMap[folder.parent_id].children.push(folderMap[folder.id])
      } else {
        tree.push(folderMap[folder.id])
      }
    })

    return tree
  }

  // Componente para renderizar carpeta con jerarquía
  const FolderTreeItem = ({ folder, depth = 0, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(true)
    const [showActions, setShowActions] = useState(false)
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div>
        <div 
          className={`group flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            dragOverFolder === folder.id 
              ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 shadow-md' 
              : filters.folderId === folder.id 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="w-4 h-4 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-4"></div>}
          
          <span className="text-yellow-500">📁</span>
          
          {editingFolderId === folder.id ? (
            <input
              type="text"
              value={editingFolderName}
              onChange={(e) => setEditingFolderName(e.target.value)}
              onBlur={() => handleEditFolder(folder.id, editingFolderName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditFolder(folder.id, editingFolderName)
                if (e.key === 'Escape') {
                  setEditingFolderId(null)
                  setEditingFolderName('')
                }
              }}
              className="flex-1 text-sm bg-transparent border-b-2 border-blue-500 focus:outline-none text-zinc-700 dark:text-zinc-300"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate cursor-pointer"
              onClick={() => onSelect(folder.id)}
            >
              {folder.name}
            </span>
          )}
          
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ({calculations.filter(calc => calc.folder_id === folder.id).length})
          </span>

          {/* Acciones de carpeta */}
          {showActions && editingFolderId !== folder.id && (
            <div className="flex items-center gap-2 ml-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingFolderId(folder.id)
                  setEditingFolderName(folder.name)
                }}
                className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border border-blue-200 dark:border-blue-700"
                title="Editar nombre"
              >
                <img src={editarIcon} alt="Editar" className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFolder(folder.id)
                }}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-700"
                title="Eliminar carpeta"
              >
                <img src={eliminarIcon} alt="Eliminar" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {folder.children.map(child => (
              <FolderTreeItem 
                key={child.id} 
                folder={child} 
                depth={depth + 1} 
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Componente para el explorador de carpetas
  const FolderExplorer = () => {
    const folderTree = buildFolderTree(folders)
    const calculationsWithoutFolder = calculations.filter(calc => !calc.folder_id).length

    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            📁 Explorador de Carpetas
          </h3>
          <button
            onClick={() => setShowCreateFolder(true)}
            className="text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            + Nueva carpeta
          </button>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {/* Opción "Todas las carpetas" */}
          <div 
            className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
              !filters.folderId 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, folderId: '' }))}
          >
            <span className="text-blue-500">🌳</span>
            <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Rama principal
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({calculations.length})
            </span>
          </div>

          {/* Cálculos sin carpeta */}
          {calculationsWithoutFolder > 0 && (
            <div 
              className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                dragOverFolder === null 
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 shadow-md' 
                  : filters.folderId === 'none' 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
              onClick={() => setFilters(prev => ({ ...prev, folderId: 'none' }))}
              onDragOver={(e) => handleDragOver(e, null)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, null)}
            >
              <span className="text-zinc-400">📄</span>
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                Sin carpeta
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                ({calculationsWithoutFolder})
              </span>
            </div>
          )}

          {/* Árbol de carpetas */}
          {folderTree.map(folder => (
            <FolderTreeItem 
              key={folder.id} 
              folder={folder} 
              onSelect={(folderId) => viewFolder(folderId)}
            />
          ))}

          {folderTree.length === 0 && (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              <div className="text-2xl mb-2">📁</div>
              <p className="text-sm">No hay carpetas creadas</p>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="text-purple-600 dark:text-purple-400 text-sm mt-2 hover:underline"
              >
                Crear primera carpeta
              </button>
            </div>
          )}
        </div>
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
            <option value="">🌳 Rama principal</option>
            <option value="none">📄 Sin carpeta</option>
            {buildFolderTree(folders).map(folder => (
              <optgroup key={`group-${folder.id}`} label={`📁 ${folder.name}`}>
                <option value={folder.id}>📁 {folder.name}</option>
                {folder.children?.map(child => (
                  <option key={child.id} value={child.id}>{'  ├── 📁 ' + child.name}</option>
                ))}
              </optgroup>
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
                      onClick={() => navigate('/app/c')}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <img src={historialIcon} alt="Calculadora" className="w-4 h-4" />
                      Calculadora
                    </button>
                    
                    <button 
                      onClick={() => navigate('/app/a')}
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
        {/* Vista de carpeta específica o vista principal */}
        {viewingFolder ? (
          renderFolderView()
        ) : (
          <>
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
                className={`px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                  showFilters 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                🔍 Filtros
              </button>
              <button
                onClick={() => setShowCreateTag(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                + Etiqueta
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

        {/* Explorador de carpetas */}
        <FolderExplorer />

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
          </>
        )}
      </div>

      {/* Modal para crear etiqueta */}
      {showCreateTag && (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
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
        <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
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

      {/* Modal para mover cálculo */}
      {showMoveModal && movingCalculationId && (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
              Mover cálculo a carpeta
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Selecciona la carpeta de destino:
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                {/* Opción "Sin carpeta" */}
                <button
                  onClick={() => handleMoveCalculation(movingCalculationId, 'none')}
                  className="w-full text-left p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-zinc-400">📄</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Sin carpeta</span>
                </button>
                
                {/* Lista de carpetas */}
                {buildFolderTree(folders).map(folder => (
                  <div key={folder.id}>
                    <button
                      onClick={() => handleMoveCalculation(movingCalculationId, folder.id)}
                      className="w-full text-left p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-yellow-500">📁</span>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{folder.name}</span>
                    </button>
                    
                    {/* Subcarpetas */}
                    {folder.children?.map(child => (
                      <button
                        key={child.id}
                        onClick={() => handleMoveCalculation(movingCalculationId, child.id)}
                        className="w-full text-left p-2 pl-8 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-yellow-500">📁</span>
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{child.name}</span>
                      </button>
                    ))}
                  </div>
                ))}
                
                {folders.length === 0 && (
                  <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                    <p className="text-sm">No hay carpetas disponibles</p>
                    <button
                      onClick={() => {
                        setShowMoveModal(false)
                        setShowCreateFolder(true)
                      }}
                      className="text-purple-600 dark:text-purple-400 text-sm mt-2 hover:underline cursor-pointer"
                    >
                      Crear carpeta
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowMoveModal(false)
                  setMovingCalculationId(null)
                }}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

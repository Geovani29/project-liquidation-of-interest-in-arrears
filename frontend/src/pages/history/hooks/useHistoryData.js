import { useState, useEffect } from 'react'
import { calculationsService } from '../../../services/calculations'
import { toast } from 'sonner'

export const useHistoryData = (user, supabaseUserId) => {
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])

  // Estados para vista de carpeta específica
  const [viewingFolder, setViewingFolder] = useState(null)
  const [folderCalculations, setFolderCalculations] = useState([])

  // Cargar datos iniciales
  useEffect(() => {
    if (user && supabaseUserId) {
      loadInitialData()
    }
  }, [user, supabaseUserId])

  const loadInitialData = async () => {
    try {
      // Asegurar que el servicio esté configurado con el usuario actual
      if (supabaseUserId) {
        await calculationsService.setUser(supabaseUserId)
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

  const loadCalculations = async (searchFilters = {}) => {
    setLoading(true)
    try {
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

  return {
    // Estados
    calculations,
    loading,
    totalCount,
    folders,
    tags,
    viewingFolder,
    folderCalculations,

    // Setters
    setCalculations,
    setFolders,
    setTags,
    setFolderCalculations,

    // Funciones
    loadCalculations,
    loadFolderCalculations,
    refreshAllData,
    viewFolder,
    backToMainView
  }
}

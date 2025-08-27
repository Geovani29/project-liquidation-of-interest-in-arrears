import { useState, useEffect } from 'react'
import { calculationsService } from '../../../services/calculations'
import { toast } from 'sonner'

export const useHistoryData = (user, supabaseUserId) => {
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [tags, setTags] = useState([])

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
      
      const tagsData = await calculationsService.getTags()
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

  // Función para refrescar todos los datos
  const refreshAllData = async () => {
    try {
      const tagsData = await calculationsService.getTags()
      setTags(tagsData)
      await loadCalculations()
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Error al actualizar datos')
    }
  }

  return {
    // Estados
    calculations,
    loading,
    totalCount,
    tags,

    // Setters
    setCalculations,
    setTags,

    // Funciones
    loadCalculations,
    refreshAllData
  }
}

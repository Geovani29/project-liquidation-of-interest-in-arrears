import { useState, useEffect } from 'react'

export const useHistoryFilters = (loadCalculations) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Estados para filtros avanzados
  const [filters, setFilters] = useState({
    folderId: 'sin-carpeta', // Estado especial para la vista principal
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

  // Búsqueda y filtros en tiempo real
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      applyFilters()
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, filters])

  const applyFilters = () => {
    const searchFilters = {
      ...filters,
      query: searchQuery.trim() || undefined
    }

    // Si estamos en la vista principal (sin-carpeta), no aplicar filtro de carpeta
    if (filters.folderId === 'sin-carpeta') {
      searchFilters.folderId = undefined
    }

    loadCalculations(searchFilters)
  }

  const resetFilters = () => {
    setFilters({
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
    setSearchQuery('')
  }

  return {
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    resetFilters,
    applyFilters
  }
}

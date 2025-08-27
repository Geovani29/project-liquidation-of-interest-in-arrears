import { useState, useEffect } from 'react'

export const useHistoryFilters = (loadCalculations) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Estados para filtros avanzados
  const [filters, setFilters] = useState({
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

    loadCalculations(searchFilters)
  }

  const resetFilters = () => {
    setFilters({
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

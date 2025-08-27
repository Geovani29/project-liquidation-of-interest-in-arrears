import { useState } from 'react'
import { useSession } from '../auth/SessionContext'

// Hooks personalizados
import {
  useHistoryData,
  useHistoryFilters,
  useCalculationActions,
  useTags
} from './history/hooks'

// Componentes
import {
  HistoryHeader,
  SearchAndFilters,
  FilterPanel,
  CalculationsList,
  BatchActionsPanel,
  CreateTagModal
} from './history/components'

export default function HistoryAdvanced() {
  const { user, logout, supabaseUserId } = useSession()
  
  // Estados globales
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Hook de datos principales
  const {
    calculations,
    loading,
    totalCount,
    tags,
    setCalculations,
    setTags,
    loadCalculations,
    refreshAllData
  } = useHistoryData(user, supabaseUserId)

  // Hook de filtros
  const {
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    resetFilters
  } = useHistoryFilters(loadCalculations)

  // Hook de acciones de cálculos
  const {
    editingId,
    setEditingId,
    editingName,
    setEditingName,
    selectedCalculations,
    setSelectedCalculations,
    handleEdit,
    handleDuplicate,
    handleDelete,
    handleLoadCalculation,
    handleSelectCalculation,
    handleSelectAll,
    handleBatchDelete,
    handleBatchAddTag
  } = useCalculationActions(loadCalculations, setCalculations)

  // Hook de etiquetas
  const {
    showCreateTag,
    setShowCreateTag,
    newTag,
    setNewTag,
    handleCreateTag,
    handleRemoveTagFromCalculation
  } = useTags(setTags, setCalculations, loadCalculations)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header fijo */}
      <HistoryHeader
        user={user}
        logout={logout}
        totalCount={totalCount}
        showUserDropdown={showUserDropdown}
        setShowUserDropdown={setShowUserDropdown}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Barra de búsqueda y controles */}
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          setShowCreateTag={setShowCreateTag}
          calculations={calculations}
          selectedCalculations={selectedCalculations}
          handleSelectAll={handleSelectAll}
        />

        {/* Filtros */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            setShowFilters={setShowFilters}
          />
        )}

        {/* Acciones en lote */}
        <BatchActionsPanel
          selectedCalculations={selectedCalculations}
          handleBatchDelete={handleBatchDelete}
          handleBatchAddTag={handleBatchAddTag}
          tags={tags}
          setSelectedCalculations={setSelectedCalculations}
        />

        {/* Lista de cálculos */}
        <CalculationsList
          loading={loading}
          calculations={calculations}
          searchQuery={searchQuery}
          selectedCalculations={selectedCalculations}
          editingId={editingId}
          editingName={editingName}
          setEditingName={setEditingName}
          handleSelectCalculation={handleSelectCalculation}
          setEditingId={setEditingId}
          handleEdit={handleEdit}
          handleDuplicate={handleDuplicate}
          handleDelete={handleDelete}
          handleLoadCalculation={handleLoadCalculation}
          handleRemoveTagFromCalculation={handleRemoveTagFromCalculation}
          tags={tags}
        />
      </div>

      {/* Modal de crear etiqueta */}
      <CreateTagModal
        showCreateTag={showCreateTag}
        setShowCreateTag={setShowCreateTag}
        newTag={newTag}
        setNewTag={setNewTag}
        handleCreateTag={handleCreateTag}
      />
    </div>
  )
}

import { useState } from 'react'
import { useSession } from '../auth/SessionContext'

// Hooks personalizados
import {
  useHistoryData,
  useHistoryFilters,
  useDragAndDrop,
  useCalculationActions,
  useFoldersAndTags
} from './history/hooks'

// Componentes
import {
  HistoryHeader,
  SearchAndFilters,
  FilterPanel,
  FolderExplorer,
  CalculationsList,
  BatchActionsPanel,
  CreateTagModal,
  CreateFolderModal,
  MoveCalculationModal
} from './history/components'

export default function HistoryAdvancedFinal() {
  const { user, logout, supabaseUserId } = useSession()
  
  // Estados globales
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Hook de datos principales
  const {
    calculations,
    loading,
    totalCount,
    folders,
    tags,
    viewingFolder,
    folderCalculations,
    setCalculations,
    setFolders,
    setTags,
    loadCalculations,
    refreshAllData,
    viewFolder,
    backToMainView
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
    handleBatchMoveToFolder,
    handleBatchAddTag
  } = useCalculationActions(loadCalculations, setCalculations)

  // Hook de carpetas y etiquetas
  const {
    showCreateTag,
    setShowCreateTag,
    showCreateFolder,
    setShowCreateFolder,
    showMoveModal,
    setShowMoveModal,
    movingCalculationId,
    setMovingCalculationId,
    editingFolderId,
    setEditingFolderId,
    editingFolderName,
    setEditingFolderName,
    newTag,
    setNewTag,
    newFolder,
    setNewFolder,
    handleCreateTag,
    handleCreateFolder,
    handleEditFolder,
    handleDeleteFolder,
    handleMoveCalculation,
    handleRemoveTagFromCalculation
  } = useFoldersAndTags(setFolders, setTags, setCalculations, loadCalculations)

  // Hook de drag and drop
  const {
    draggedCalculation,
    dragOverFolder,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragAndDrop(folders, setCalculations, refreshAllData, viewingFolder, loadCalculations)

  // Renderizado de vista de carpeta específica (versión simplificada)
  const renderFolderView = () => {
    const currentFolder = viewingFolder === 'none' 
      ? { name: 'Sin carpeta', id: 'none' } 
      : folders.find(f => f.id === viewingFolder)
    
    return (
      <div className="space-y-6">
        {/* Header de carpeta */}
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

        {/* Vista simplificada de archivos en carpeta */}
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
                className="group bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">📊</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {calculation.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <span>
                        {new Date(calculation.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
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
    )
  }

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
        {/* Vista de carpeta específica o vista principal */}
        {viewingFolder ? (
          renderFolderView()
        ) : (
          <>
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

            {/* Explorador de carpetas */}
            <FolderExplorer
              folders={folders}
              calculations={calculations}
              filters={filters}
              setFilters={setFilters}
              setShowCreateFolder={setShowCreateFolder}
              viewFolder={viewFolder}
              dragOverFolder={dragOverFolder}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              editingFolderId={editingFolderId}
              setEditingFolderId={setEditingFolderId}
              editingFolderName={editingFolderName}
              setEditingFolderName={setEditingFolderName}
              handleEditFolder={handleEditFolder}
              handleDeleteFolder={handleDeleteFolder}
            />

            {/* Filtros */}
            {showFilters && (
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                folders={folders}
                resetFilters={resetFilters}
                setShowFilters={setShowFilters}
              />
            )}

            {/* Acciones en lote */}
            <BatchActionsPanel
              selectedCalculations={selectedCalculations}
              handleBatchDelete={handleBatchDelete}
              handleBatchMoveToFolder={handleBatchMoveToFolder}
              handleBatchAddTag={handleBatchAddTag}
              folders={folders}
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
              draggedCalculation={draggedCalculation}
              handleSelectCalculation={handleSelectCalculation}
              setEditingId={setEditingId}
              handleEdit={handleEdit}
              handleDuplicate={handleDuplicate}
              setMovingCalculationId={setMovingCalculationId}
              setShowMoveModal={setShowMoveModal}
              handleDelete={handleDelete}
              handleLoadCalculation={handleLoadCalculation}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleRemoveTagFromCalculation={handleRemoveTagFromCalculation}
              tags={tags}
            />
          </>
        )}
      </div>

      {/* Modales */}
      <CreateTagModal
        showCreateTag={showCreateTag}
        setShowCreateTag={setShowCreateTag}
        newTag={newTag}
        setNewTag={setNewTag}
        handleCreateTag={handleCreateTag}
      />

      <CreateFolderModal
        showCreateFolder={showCreateFolder}
        setShowCreateFolder={setShowCreateFolder}
        newFolder={newFolder}
        setNewFolder={setNewFolder}
        handleCreateFolder={handleCreateFolder}
        folders={folders}
      />

      <MoveCalculationModal
        showMoveModal={showMoveModal}
        setShowMoveModal={setShowMoveModal}
        movingCalculationId={movingCalculationId}
        setMovingCalculationId={setMovingCalculationId}
        handleMoveCalculation={handleMoveCalculation}
        folders={folders}
        setShowCreateFolder={setShowCreateFolder}
      />
    </div>
  )
}

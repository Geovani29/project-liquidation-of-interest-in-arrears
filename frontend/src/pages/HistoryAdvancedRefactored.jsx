import { useState } from 'react'
import { useSession } from '../auth/SessionContext'
import { useNavigate } from 'react-router-dom'

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
  CalculationCard,
  CreateTagModal,
  CreateFolderModal,
  MoveCalculationModal
} from './history/components'

export default function HistoryAdvancedRefactored() {
  const { user, logout, supabaseUserId } = useSession()
  const navigate = useNavigate()
  
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
    setFolderCalculations,
    loadCalculations,
    loadFolderCalculations,
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
  } = useDragAndDrop(folders, setCalculations, refreshAllData, viewingFolder, loadFolderCalculations)

  // Renderizado de vista de carpeta específica
  const renderFolderView = () => {
    const currentFolder = viewingFolder === 'none' 
      ? { name: 'Sin carpeta', id: 'none' } 
      : folders.find(f => f.id === viewingFolder)
    
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

            {/* Otras carpetas */}
            {folders.filter(f => f.id !== viewingFolder).length > 0 ? (
              folders.filter(f => f.id !== viewingFolder).map(folder => (
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
              ))
            ) : (
              <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                <div className="text-xs">
                  Solo puedes mover a "Rama principal"
                </div>
              </div>
            )}
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
                      </div>
                    </div>

                    {/* Acciones */}
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
      </div>
    )
  }

  // Renderizado de acciones en lote
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
            ) : calculations.filter(calc => !calc.folder_id).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {searchQuery ? 'No se encontraron cálculos' : 'No hay archivos sin carpeta'}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {searchQuery 
                    ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                    : 'Todos tus cálculos están organizados en carpetas. Puedes usar el explorador de carpetas para navegar o crear nuevos cálculos.'
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
                {calculations.filter(calc => !calc.folder_id).map((calculation, index) => (
                  <CalculationCard
                    key={calculation.id}
                    calculation={calculation}
                    index={index}
                    isSelected={selectedCalculations.includes(calculation.id)}
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
                ))}
              </div>
            )}
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

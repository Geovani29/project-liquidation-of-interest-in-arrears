import { useState } from 'react'
import { buildFolderTree } from '../utils/folderTree'
import editarIcon from '../../../assets/editar.svg'
import eliminarIcon from '../../../assets/eliminar.svg'

const FolderTreeItem = ({ 
  folder, 
  depth = 0, 
  onSelect,
  filters,
  calculations,
  dragOverFolder,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  editingFolderId,
  setEditingFolderId,
  editingFolderName,
  setEditingFolderName,
  handleEditFolder,
  handleDeleteFolder
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showActions, setShowActions] = useState(false)
  const hasChildren = folder.children && folder.children.length > 0

  return (
    <div>
      <div 
        className={`group flex items-center gap-2 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
          dragOverFolder === folder.id 
            ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 shadow-md' 
            : filters.folderId === folder.id 
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
        }`}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleDragOver(e, folder.id)
        }}
        onDragLeave={(e) => {
          e.stopPropagation()
          handleDragLeave(e)
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleDrop(e, folder.id)
        }}
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
                handleDeleteFolder(folder.id, [folder], calculations)
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
              filters={filters}
              calculations={calculations}
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
          ))}
        </div>
      )}
    </div>
  )
}

export const FolderExplorer = ({
  folders,
  calculations,
  filters,
  setFilters,
  setShowCreateFolder,
  viewFolder,
  dragOverFolder,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  editingFolderId,
  setEditingFolderId,
  editingFolderName,
  setEditingFolderName,
  handleEditFolder,
  handleDeleteFolder
}) => {
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
            filters.folderId === '' 
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

        {/* Archivos sin carpeta - Mostrar cada archivo individualmente */}
        {calculationsWithoutFolder > 0 && (
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 px-3">
              📄 Archivos sueltos ({calculationsWithoutFolder})
            </div>
            {calculations
              .filter(calc => !calc.folder_id)
              .map(calculation => (
                <div
                  key={calculation.id}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ml-4 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  title={`${calculation.name} - Solo se puede mover desde las cards de abajo`}
                >
                  <span className="text-blue-500 text-xs">📊</span>
                  <span className="flex-1 text-xs text-zinc-600 dark:text-zinc-400 truncate">
                    {calculation.name}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Árbol de carpetas */}
        {folderTree.map(folder => (
          <FolderTreeItem 
            key={folder.id} 
            folder={folder} 
            onSelect={(folderId) => viewFolder(folderId)}
            filters={filters}
            calculations={calculations}
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

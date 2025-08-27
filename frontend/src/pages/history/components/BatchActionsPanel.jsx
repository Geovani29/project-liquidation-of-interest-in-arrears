import { memo } from 'react'

export const BatchActionsPanel = memo(({
  selectedCalculations,
  handleBatchDelete,
  handleBatchMoveToFolder,
  handleBatchAddTag,
  folders,
  tags,
  setSelectedCalculations
}) => {
  if (selectedCalculations.length === 0) return null

  return (
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
})

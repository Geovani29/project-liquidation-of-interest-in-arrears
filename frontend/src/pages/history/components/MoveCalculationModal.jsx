import { buildFolderTree } from '../utils/folderTree'

export const MoveCalculationModal = ({
  showMoveModal,
  setShowMoveModal,
  movingCalculationId,
  setMovingCalculationId,
  handleMoveCalculation,
  folders,
  setShowCreateFolder
}) => {
  if (!showMoveModal || !movingCalculationId) return null

  return (
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
              onClick={() => handleMoveCalculation(movingCalculationId, 'none', folders)}
              className="w-full text-left p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="text-zinc-400">📄</span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Sin carpeta</span>
            </button>
            
            {/* Lista de carpetas */}
            {buildFolderTree(folders).map(folder => (
              <div key={folder.id}>
                <button
                  onClick={() => handleMoveCalculation(movingCalculationId, folder.id, folders)}
                  className="w-full text-left p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-yellow-500">📁</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{folder.name}</span>
                </button>
                
                {/* Subcarpetas */}
                {folder.children?.map(child => (
                  <button
                    key={child.id}
                    onClick={() => handleMoveCalculation(movingCalculationId, child.id, folders)}
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
  )
}

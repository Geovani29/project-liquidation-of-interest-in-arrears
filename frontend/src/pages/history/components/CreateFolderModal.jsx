export const CreateFolderModal = ({
  showCreateFolder,
  setShowCreateFolder,
  newFolder,
  setNewFolder,
  handleCreateFolder,
  folders
}) => {
  if (!showCreateFolder) return null

  return (
    <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Crear nueva carpeta
        </h3>
        <form onSubmit={handleCreateFolder}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={newFolder.name}
              onChange={(e) => setNewFolder(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Carpeta padre (opcional)
            </label>
            <select
              value={newFolder.parentId || ''}
              onChange={(e) => setNewFolder(prev => ({ ...prev, parentId: e.target.value || null }))}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            >
              <option value="">Sin carpeta padre</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateFolder(false)}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

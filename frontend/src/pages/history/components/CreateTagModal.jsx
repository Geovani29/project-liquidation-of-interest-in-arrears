export const CreateTagModal = ({
  showCreateTag,
  setShowCreateTag,
  newTag,
  setNewTag,
  handleCreateTag
}) => {
  if (!showCreateTag) return null

  return (
    <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Crear nueva etiqueta
        </h3>
        <form onSubmit={handleCreateTag}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={newTag.name}
              onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Color
            </label>
            <input
              type="color"
              value={newTag.color}
              onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newTag.isPublic}
                onChange={(e) => setNewTag(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Etiqueta pública (visible para otros usuarios)
              </span>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateTag(false)}
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

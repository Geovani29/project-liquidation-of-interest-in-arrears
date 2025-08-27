import { memo } from 'react'

export const CreateTemplateModal = memo(({
  showCreateTemplateModal,
  setShowCreateTemplateModal,
  newTemplate,
  updateNewTemplate,
  createTemplate,
  clearNewTemplate
}) => {
  if (!showCreateTemplateModal) return null

  const handleCreate = () => {
    createTemplate()
  }

  const handleCancel = () => {
    setShowCreateTemplateModal(false)
    clearNewTemplate()
  }

  return (
    <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4 animate-scaleIn shadow-2xl">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Crear Plantilla
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nombre de la plantilla
            </label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => updateNewTemplate('name', e.target.value)}
              placeholder="Ej: Crédito hipotecario estándar"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={newTemplate.description}
              onChange={(e) => updateNewTemplate('description', e.target.value)}
              placeholder="Describe para qué sirve esta plantilla..."
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={newTemplate.isPublic}
              onChange={(e) => updateNewTemplate('isPublic', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
              Hacer pública (otros usuarios pueden usarla)
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear plantilla
          </button>
        </div>
      </div>
    </div>
  )
})

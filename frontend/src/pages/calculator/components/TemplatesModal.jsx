import { memo } from 'react'

export const TemplatesModal = memo(({
  showTemplatesModal,
  setShowTemplatesModal,
  templates,
  useTemplate,
  deleteTemplate,
  setShowCreateTemplateModal
}) => {
  if (!showTemplatesModal) return null

  return (
    <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-4xl mx-4 animate-scaleIn shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Plantillas
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nueva plantilla
            </button>
            <button
              onClick={() => setShowTemplatesModal(false)}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
        
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No hay plantillas
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Crea tu primera plantilla para reutilizar configuraciones comunes
            </p>
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear plantilla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-600">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {template.name}
                  </h4>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-500 hover:text-red-700 transition-colors text-sm"
                  >
                    Eliminar
                  </button>
                </div>
                
                {template.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {template.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  <span>Usos: {template.usage_count || 0}</span>
                  {template.is_public && (
                    <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Pública
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => useTemplate(template)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Usar plantilla
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
